import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanKey } from "@/lib/billing/plans";

export async function getCurrentPlan(organizationId: string): Promise<PlanKey> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db.from("subscriptions").select("plan_key,status").eq("organization_id", organizationId).maybeSingle();
  if (!data || !["active", "trialing"].includes(data.status)) return "FREE";
  const key = data.plan_key as PlanKey;
  return key in PLANS ? key : "FREE";
}

export async function hasActiveSubscription(organizationId: string) { return (await getCurrentPlan(organizationId)) !== "FREE"; }
export async function canUseFeature(organizationId: string, feature: "shipments" | "members" | "couriers", currentUsage = 0) { const plan = await getCurrentPlan(organizationId); return currentUsage < PLANS[plan][feature]; }
export async function canTrackShipment(organizationId: string, currentUsage: number) { return canUseFeature(organizationId, "shipments", currentUsage); }
export async function canAddMember(organizationId: string, currentUsage: number) { return canUseFeature(organizationId, "members", currentUsage); }
export async function canConnectCourier(organizationId: string, currentUsage: number) { return canUseFeature(organizationId, "couriers", currentUsage); }
