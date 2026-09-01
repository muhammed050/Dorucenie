import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function authorized(request: Request) {
  const expected = process.env.INTERNAL_WORKER_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(expected && supplied && supplied === expected);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: shipments, error } = await db.from("shipments").select("id,organization_id,tracking_number,courier_connection_id,courier_connections(courier_id,secret_ref,couriers(slug))").lte("next_check_at", new Date().toISOString()).not("status", "in", "(DELIVERED,FAILED)").order("next_check_at", { ascending: true }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let queued = 0;
  for (const shipment of shipments ?? []) {
    const connection = shipment.courier_connections;
    const courier = connection?.couriers?.slug;
    if (!courier || !connection?.secret_ref) continue;
    const dedupeKey = `TRACK_SHIPMENT:${shipment.id}`;
    const { error: jobError } = await db.from("jobs").upsert({ organization_id: shipment.organization_id, type: "TRACK_SHIPMENT", payload: { shipmentId: shipment.id, trackingNumber: shipment.tracking_number, courier, secretRef: connection.secret_ref }, status: "pending", run_at: new Date().toISOString(), max_attempts: 5, dedupe_key: dedupeKey }, { onConflict: "organization_id,dedupe_key", ignoreDuplicates: true });
    if (!jobError) { queued++; await db.from("shipments").update({ next_check_at: new Date(Date.now() + 15 * 60_000).toISOString() }).eq("id", shipment.id).eq("organization_id", shipment.organization_id); }
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.INTERNAL_WORKER_SECRET;
  if (baseUrl && secret) {
    await Promise.all(Array.from({ length: 5 }, () => fetch(`${baseUrl.replace(/\/$/, "")}/api/internal/worker`, { method: "POST", headers: { authorization: `Bearer ${secret}` }, cache: "no-store" }).catch(() => null)));
  }
  return NextResponse.json({ queued, workers: 5 });
}
