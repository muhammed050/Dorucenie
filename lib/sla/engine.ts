export type SlaRule = { targetDays: number; businessDays: boolean; cutoffTime?: string | null; timezone: string; calendarId?: string | null };
export type SlaState = "ON_TIME" | "AT_RISK" | "BREACHED";

function nextBusinessDay(date: Date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function calculateDeadline(start: Date, rule: SlaRule) {
  if (!rule.businessDays) return new Date(start.getTime() + rule.targetDays * 86_400_000);
  let result = new Date(start);
  let remaining = rule.targetDays;
  while (remaining > 0) { result = nextBusinessDay(result); remaining--; }
  return result;
}

export function evaluateSla(now: Date, deadline: Date, riskWindowMinutes = 24 * 60): SlaState {
  if (now.getTime() >= deadline.getTime()) return "BREACHED";
  if (deadline.getTime() - now.getTime() <= riskWindowMinutes * 60_000) return "AT_RISK";
  return "ON_TIME";
}

export function calculateRiskScore(now: Date, deadline: Date, estimatedDelivery?: Date | null) {
  const remaining = deadline.getTime() - now.getTime();
  if (remaining <= 0) return 100;
  if (!estimatedDelivery) return Math.max(0, Math.min(99, 100 - remaining / 86_400_000 * 20));
  const overrun = estimatedDelivery.getTime() - deadline.getTime();
  return Math.max(0, Math.min(100, overrun <= 0 ? 10 : 50 + Math.min(50, overrun / 86_400_000 * 25)));
}
