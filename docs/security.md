# Security

- All tenant tables have RLS and tenant membership policies.
- Organization IDs are resolved from authenticated membership rather than trusted browser input.
- Service-role access is isolated in server-only modules.
- Courier credentials are referenced through Supabase Vault.
- Internal scheduler/worker endpoints require a secret.
- Whop webhooks use Standard Webhooks signature verification and a five-minute timestamp tolerance.
- Webhook delivery is at-least-once, so `(provider,event_id)` is unique.
- Job updates require worker ownership.
- Provider rate limiting is an atomic database operation.

Before production, run cross-tenant RLS tests with two real users and regenerate database types from the deployed schema.
