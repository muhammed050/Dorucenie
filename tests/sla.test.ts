import { describe, expect, it } from "vitest";
import { calculateDeadline, evaluateSla, calculateRiskScore } from "@/lib/sla/engine";

describe("SLA engine", () => {
  it("calculates business-day deadlines", () => {
    const start = new Date("2026-09-04T10:00:00Z");
    expect(calculateDeadline(start, { targetDays: 1, businessDays: true, timezone: "UTC" }).toISOString()).toBe("2026-09-07T10:00:00.000Z");
  });
  it("marks approaching deadlines at risk", () => {
    const deadline = new Date("2026-09-02T10:00:00Z");
    expect(evaluateSla(new Date("2026-09-02T09:00:00Z"), deadline)).toBe("AT_RISK");
  });
  it("scores a breached shipment at 100", () => {
    expect(calculateRiskScore(new Date("2026-09-03"), new Date("2026-09-02"))).toBe(100);
  });
});
