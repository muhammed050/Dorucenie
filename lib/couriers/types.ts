export type NormalizedShipmentStatus = "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION" | "FAILED" | "UNKNOWN";

export type CourierCredentials = Record<string, string | undefined>;

export type CourierEvent = {
  id?: string;
  status: NormalizedShipmentStatus;
  occurredAt: string;
  location?: string;
  description?: string;
  raw: unknown;
};

export type TrackingResult = {
  trackingNumber: string;
  status: NormalizedShipmentStatus;
  estimatedDeliveryAt?: string;
  events: CourierEvent[];
  raw: unknown;
};

export interface CourierAdapter {
  readonly slug: string;
  readonly name: string;
  authenticate(credentials: CourierCredentials): Promise<void>;
  validateCredentials(credentials: CourierCredentials): Promise<{ valid: boolean; message?: string }>;
  getTracking(trackingNumber: string, credentials: CourierCredentials): Promise<TrackingResult>;
  getEvents(trackingNumber: string, credentials: CourierCredentials): Promise<CourierEvent[]>;
  normalizeEvent(event: unknown): CourierEvent;
  refreshToken?(credentials: CourierCredentials): Promise<CourierCredentials>;
}

export class CourierError extends Error {
  constructor(public readonly code: "retryable" | "non_retryable" | "rate_limited" | "reauthorization_required" | "temporary_provider_error", message: string, public readonly retryAfterSeconds?: number) {
    super(message);
    this.name = "CourierError";
  }
}
