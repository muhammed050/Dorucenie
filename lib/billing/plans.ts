export const PLAN_KEYS = ["FREE", "STARTER", "GROWTH", "BUSINESS"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLANS: Record<PlanKey, { price: number; shipments: number; members: number; couriers: number }> = {
  FREE: { price: 0, shipments: 100, members: 1, couriers: 1 },
  STARTER: { price: 29, shipments: 2_000, members: 3, couriers: 3 },
  GROWTH: { price: 79, shipments: 10_000, members: 10, couriers: 10 },
  BUSINESS: { price: 199, shipments: 50_000, members: Number.POSITIVE_INFINITY, couriers: Number.POSITIVE_INFINITY },
};

export const WHOP_PLAN_IDS: Partial<Record<Exclude<PlanKey, "FREE">, string>> = {
  STARTER: process.env.WHOP_PLAN_STARTER,
  GROWTH: process.env.WHOP_PLAN_GROWTH,
  BUSINESS: process.env.WHOP_PLAN_BUSINESS,
};
