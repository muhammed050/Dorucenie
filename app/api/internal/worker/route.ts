import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCourierAdapter } from "@/lib/couriers";
import { readSecret } from "@/lib/security/credentials";

const LEASE_MINUTES = 15;
const MAX_JOBS = 20;

function authorized(request: Request) {
  const expected = process.env.INTERNAL_WORKER_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(expected && supplied && supplied === expected);
}

function backoff(attempt: number) {
  return Math.min(60 * 60 * 1000, 60_000 * 5 ** Math.max(0, attempt - 1));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const workerId = randomUUID();
  // New production tables are added by migrations; keep this boundary isolated from browser-generated types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: jobs, error } = await db.rpc("claim_jobs", { p_worker_id: workerId, p_limit: MAX_JOBS, p_lease_minutes: LEASE_MINUTES });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];
  for (const job of (jobs ?? [])) {
    try {
      if (job.type === "TRACK_SHIPMENT") {
        const payload = job.payload as { shipmentId?: string; trackingNumber?: string; courier?: string; secretRef?: string };
        if (!payload.shipmentId || !payload.trackingNumber || !payload.courier || !payload.secretRef) throw new Error("TRACK_SHIPMENT payload is incomplete");
        const adapter = getCourierAdapter(payload.courier);
        const credentials = await readSecret(payload.secretRef);
        const tracking = await adapter.getTracking(payload.trackingNumber, credentials as Record<string, string>);
        await db.from("shipments").update({ status: tracking.status, estimated_delivery_at: tracking.estimatedDeliveryAt ?? null, updated_at: new Date().toISOString() }).eq("id", payload.shipmentId).eq("organization_id", job.organization_id);
        for (const event of tracking.events) {
          await db.from("shipment_events").upsert({ organization_id: job.organization_id, shipment_id: payload.shipmentId, provider_event_id: event.id ?? `${event.occurredAt}:${event.status}`, status: event.status, occurred_at: event.occurredAt, location: event.location ?? null, description: event.description ?? null, raw_event: event.raw }, { onConflict: "shipment_id,provider_event_id" });
        }
      } else {
        throw new Error(`Unsupported job type: ${job.type}`);
      }
      await db.from("jobs").update({ status: "completed", locked_until: null, worker_id: null, completed_at: new Date().toISOString(), last_error: null }).eq("id", job.id).eq("worker_id", workerId).eq("status", "processing");
      results.push({ id: job.id, status: "completed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      const attempts = Number(job.attempts ?? 1);
      const retry = attempts < Number(job.max_attempts ?? 5);
      await db.from("jobs").update({ status: retry ? "retry_wait" : "failed", run_at: retry ? new Date(Date.now() + backoff(attempts)).toISOString() : job.run_at, locked_until: null, worker_id: null, last_error: message }).eq("id", job.id).eq("worker_id", workerId).eq("status", "processing");
      results.push({ id: job.id, status: retry ? "retry_wait" : "failed" });
    }
  }
  return NextResponse.json({ workerId, processed: results.length, results });
}
