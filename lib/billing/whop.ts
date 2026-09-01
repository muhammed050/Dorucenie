import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { WHOP_PLAN_IDS, type PlanKey } from "./plans";

function decodeSecret(value: string) {
  const raw = value.startsWith("whsec_") ? value.slice(6) : value;
  return Buffer.from(raw, "base64");
}

export function verifyWhopWebhook(body: string, headers: Headers) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatureHeader) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", decodeSecret(secret)).update(`${id}.${timestamp}.${body}`).digest("base64");
  return signatureHeader.split(" ").some((item) => {
    const [version, signature] = item.split(",");
    if (version !== "v1" || !signature) return false;
    const a = Buffer.from(signature); const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export function planKeyFromWhopPlan(planId: string | undefined): PlanKey {
  if (planId && planId === WHOP_PLAN_IDS.STARTER) return "STARTER";
  if (planId && planId === WHOP_PLAN_IDS.GROWTH) return "GROWTH";
  if (planId && planId === WHOP_PLAN_IDS.BUSINESS) return "BUSINESS";
  return "FREE";
}
