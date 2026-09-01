import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanKey } from "@/lib/billing/plans";

export async function getCurrentPlan(organizationId: string): Promise<PlanKey> {
  const supabase = await createClient();
  const { data } = await supabase.from("subscriptions").select("plan_key,status").eq("organization_id", organizationId).maybeSingle();
  if (!data || !["active", "trialing"].includes(data.status)) return "FREE";
  const key = data.plan_key as PlanKey;
  return key in PLANS ? key : "FREE";
}

export async function hasActiveSubscription(organizationId: string) {
  const plan = await getCurrentPlan(organizationId);
  return plan !== "FREE";
}

export async function canUseFeature(organizationId: string, feature: "shipments" | "members" | "couriers", currentUsage = 0) {
  const plan = await getCurrentPlan(organizationId);
  const limit = PLANS[plan][feature];
  return currentUsage < limit;
}

export async function canTrackShipment(organizationId: string, currentUsage: number) {
  return canUseFeature(organizationId, "shipments", currentUsage);
}
export async function canAddMember(organizationId: string, currentUsage: number) {
  return canUseFeature(organizationId, "members", currentUsage);
}
export async function canConnectCourier(organizationId: string, currentUsage: number) {
  return canUseFeature(organizationId, "couriers", currentUsage);
}
