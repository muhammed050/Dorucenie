# Courier integrations

Providers implement `CourierAdapter` and return normalized statuses/events. The rest of the application never calls provider-specific APIs directly.

DHL uses the current DHL Group Unified Shipment Tracking endpoint `https://api-eu.dhl.com/track/shipments` and the `DHL-API-Key` header. DHL's official developer portal currently lists Unified Shipment Tracking as the global tracking API.

DPD is intentionally country/product-specific. The adapter requires a configured API endpoint and credentials and fails clearly when those are absent; it does not fabricate a universal DPD endpoint.

Customer credentials are referenced from Supabase Vault and are only read by server-side workers.
