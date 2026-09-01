import { CourierError, type CourierAdapter, type CourierCredentials, type CourierEvent, type TrackingResult } from "./types";
import { normalizeStatus } from "./normalizer";

const BASE_URL = "https://api-eu.dhl.com/track/shipments";

export const dhlAdapter: CourierAdapter = {
  slug: "dhl",
  name: "DHL",
  async authenticate(credentials) {
    const result = await this.validateCredentials(credentials);
    if (!result.valid) throw new CourierError("reauthorization_required", result.message ?? "DHL credentials are invalid");
  },
  async validateCredentials(credentials) {
    if (!credentials.apiKey) return { valid: false, message: "DHL apiKey is required" };
    try {
      const response = await fetch(`${BASE_URL}?trackingNumber=0000000000`, { headers: { "DHL-API-Key": credentials.apiKey }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) return { valid: false, message: "DHL API key rejected" };
      return { valid: true };
    } catch (error) { return { valid: false, message: error instanceof Error ? error.message : "DHL connection failed" }; }
  },
  async getTracking(trackingNumber, credentials): Promise<TrackingResult> {
    if (!credentials.apiKey) throw new CourierError("reauthorization_required", "DHL apiKey is missing");
    const response = await fetch(`${BASE_URL}?trackingNumber=${encodeURIComponent(trackingNumber)}`, { headers: { "DHL-API-Key": credentials.apiKey, Accept: "application/json" }, cache: "no-store" });
    if (response.status === 429) throw new CourierError("rate_limited", "DHL rate limit reached", Number(response.headers.get("retry-after") ?? 60));
    if (response.status === 401 || response.status === 403) throw new CourierError("reauthorization_required", "DHL credentials rejected");
    if (!response.ok) throw new CourierError(response.status >= 500 ? "temporary_provider_error" : "non_retryable", `DHL tracking request failed (${response.status})`);
    const raw = await response.json() as Record<string, unknown>;
    const shipments = Array.isArray(raw.shipments) ? raw.shipments : [];
    const first = (shipments[0] ?? {}) as Record<string, unknown>;
    const events = Array.isArray(first.events) ? first.events.map((event) => this.normalizeEvent(event)) : [];
    return { trackingNumber, status: events.at(-1)?.status ?? "UNKNOWN", estimatedDeliveryAt: typeof first.estimatedTimeOfDelivery === "string" ? first.estimatedTimeOfDelivery : undefined, events, raw };
  },
  async getEvents(trackingNumber, credentials) { return (await this.getTracking(trackingNumber, credentials)).events; },
  normalizeEvent(event: unknown): CourierEvent {
    const e = (event ?? {}) as Record<string, unknown>;
    return { id: typeof e.id === "string" ? e.id : undefined, status: normalizeStatus(e.statusCode ?? e.status), occurredAt: typeof e.timestamp === "string" ? e.timestamp : new Date().toISOString(), location: typeof e.location === "string" ? e.location : undefined, description: typeof e.description === "string" ? e.description : undefined, raw: event };
  },
};
