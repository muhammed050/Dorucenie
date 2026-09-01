import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { planKeyFromWhopPlan, verifyWhopWebhook } from "@/lib/billing/whop";

const EventSchema = z.object({ type: z.string(), data: z.record(z.string(), z.unknown()) });

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyWhopWebhook(body, request.headers)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const eventId = request.headers.get("webhook-id");
  if (!eventId) return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  const parsed = EventSchema.safeParse(JSON.parse(body));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const event = parsed.data;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { error: insertError } = await db.from("webhook_events").insert({ provider: "whop", event_id: eventId, event_type: event.type, payload: event });
  if (insertError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const data = event.data;
  const organizationId = typeof data.organization_id === "string" ? data.organization_id : typeof data.metadata === "object" && data.metadata && typeof (data.metadata as Record<string, unknown>).organization_id === "string" ? (data.metadata as Record<string, unknown>).organization_id as string : null;
  const membershipId = typeof data.membership_id === "string" ? data.membership_id : typeof data.id === "string" && event.type.startsWith("membership.") ? data.id : null;
  const planId = typeof data.plan_id === "string" ? data.plan_id : typeof data.plan === "object" && data.plan && typeof (data.plan as Record<string, unknown>).id === "string" ? (data.plan as Record<string, unknown>).id as string : undefined;

  if (organizationId && /^[0-9a-f-]{36}$/i.test(organizationId)) {
    const active = ["membership.activated", "payment.succeeded", "subscription.created", "subscription.updated"].includes(event.type);
    const cancelled = ["membership.deactivated", "subscription.cancelled"].includes(event.type);
    const planKey = planKeyFromWhopPlan(planId);
    await db.from("subscriptions").upsert({ organization_id: organizationId, whop_customer_id: typeof data.customer_id === "string" ? data.customer_id : null, whop_membership_id: membershipId, plan_id: planId ?? null, plan_key: cancelled ? "FREE" : planKey, status: cancelled ? "cancelled" : active ? "active" : "past_due", period_start: typeof data.period_start === "string" ? data.period_start : null, period_end: typeof data.period_end === "string" ? data.period_end : null, cancel_at_period_end: Boolean(data.cancel_at_period_end) }, { onConflict: "organization_id" });
  }
  await db.from("webhook_events").update({ processed_at: new Date().toISOString() }).eq("provider", "whop").eq("event_id", eventId);
  return NextResponse.json({ ok: true });
}
