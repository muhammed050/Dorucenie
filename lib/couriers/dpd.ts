import { CourierError, type CourierAdapter, type CourierCredentials, type CourierEvent, type TrackingResult } from "./types";
import { normalizeStatus } from "./normalizer";

/** DPD has country-specific API products. The endpoint is configured per deployment rather than guessed. */
export const dpdAdapter: CourierAdapter = {
  slug: "dpd",
  name: "DPD",
  async authenticate(credentials) {
    const result = await this.validateCredentials(credentials);
    if (!result.valid) throw new CourierError("reauthorization_required", result.message ?? "DPD credentials are invalid");
  },
  async validateCredentials(credentials) {
    if (!credentials.apiUrl) return { valid: false, message: "DPD apiUrl is required for the selected DPD country API" };
    if (!credentials.apiKey && !credentials.token) return { valid: false, message: "DPD apiKey or token is required" };
    return { valid: true };
  },
  async getTracking(trackingNumber, credentials): Promise<TrackingResult> {
    const apiUrl = credentials.apiUrl;
    if (!apiUrl) throw new CourierError("non_retryable", "DPD API endpoint is not configured for this connection");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (credentials.apiKey) headers.Authorization = `Bearer ${credentials.apiKey}`;
    if (credentials.token) headers.Authorization = `Bearer ${credentials.token}`;
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/tracking/${encodeURIComponent(trackingNumber)}`, { headers, cache: "no-store" });
    if (response.status === 429) throw new CourierError("rate_limited", "DPD rate limit reached", Number(response.headers.get("retry-after") ?? 60));
    if (response.status === 401 || response.status === 403) throw new CourierError("reauthorization_required", "DPD credentials rejected");
    if (!response.ok) throw new CourierError(response.status >= 500 ? "temporary_provider_error" : "non_retryable", `DPD tracking request failed (${response.status})`);
    const raw = await response.json();
    const source = (raw as Record<string, unknown>);
    const events = Array.isArray(source.events) ? source.events.map((event) => this.normalizeEvent(event)) : [];
    return { trackingNumber, status: events.at(-1)?.status ?? normalizeStatus(source.status), events, raw };
  },
  async getEvents(trackingNumber, credentials) { return (await this.getTracking(trackingNumber, credentials)).events; },
  normalizeEvent(event: unknown): CourierEvent {
    const e = (event ?? {}) as Record<string, unknown>;
    return { id: typeof e.id === "string" ? e.id : undefined, status: normalizeStatus(e.status ?? e.statusCode ?? e.type), occurredAt: typeof e.timestamp === "string" ? e.timestamp : new Date().toISOString(), location: typeof e.location === "string" ? e.location : undefined, description: typeof e.description === "string" ? e.description : undefined, raw: event };
  },
};
