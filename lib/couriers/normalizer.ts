import type { NormalizedShipmentStatus } from "./types";

const MAP: Record<string, NormalizedShipmentStatus> = {
  CREATED: "CREATED", CREATED_EVENT: "CREATED", PICKED_UP: "PICKED_UP", PICKUP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT", TRANSIT: "IN_TRANSIT", OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED", EXCEPTION: "EXCEPTION", FAILED: "FAILED",
};

export function normalizeStatus(value: unknown): NormalizedShipmentStatus {
  const key = String(value ?? "UNKNOWN").trim().toUpperCase().replace(/[ -]+/g, "_");
  return MAP[key] ?? "UNKNOWN";
}
