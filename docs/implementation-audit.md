# Implementation audit — 2026-09-01

## Existing foundation
- Next.js App Router, React 19, TypeScript, Tailwind.
- Supabase SSR Auth with protected workspace routing.
- Profiles, organizations and organization_members with tenant authorization helpers.
- Login, signup, password reset and callback flows.
- Existing dashboard foundation and UI primitives.
- Vitest/lint/typecheck/build configuration.

## Missing before this branch
- Production shipment/courier data model.
- Atomic Postgres job queue and worker leases.
- Courier adapter boundary.
- SLA/risk engine.
- Billing/subscription persistence and webhook processing.
- Shipment pages and provider event timeline.
- Provider credential isolation.

## Implemented on production-completion
- Production core schema and tenant RLS.
- `claim_jobs` using `FOR UPDATE SKIP LOCKED`, 15-minute leases and ownership-bound heartbeat.
- Atomic provider rate-limit primitive.
- Bounded scheduler fan-out (5 workers × 20 jobs).
- DHL Unified Tracking adapter against the current DHL Group tracking endpoint.
- DPD country-specific adapter boundary that refuses to guess an endpoint when configuration is missing.
- Provider-neutral event normalization.
- SLA deadline/risk primitives.
- Server-only secret boundary backed by Supabase Vault's decrypted secrets view.
- Embedded Whop checkout loader and verified Standard Webhooks endpoint.
- Server-side plan limits and billing page.
- Shipment list/detail pages.
- Environment documentation.

## Still blocked / requires external setup
- Whop plan IDs and webhook registration.
- Supabase project migration application and Vault configuration.
- Supabase pg_cron/pg_net scheduler registration with the deployed app URL.
- Shopify OAuth app credentials and webhook registration.
- DPD country/product API endpoint and credentials; DPD APIs are country-specific.
- Resend and Sentry production keys.
- Full browser E2E execution against a configured environment.
- `@whop/checkout` package installation is intentionally not added to the lockfile in this connector-only edit path; the committed billing UI uses Whop's official embedded checkout loader. Replace it with the React package after running the package-manager install locally/CI.

## Architectural risks to resolve before claiming GA
- Regenerate `lib/supabase/database.types.ts` from the migrated production schema.
- Add complete Shopify ingestion and OAuth lifecycle.
- Add courier scoring/aggregations, reports, alerts, team/settings UI and email delivery.
- Run the complete test/build suite in a real checkout environment.
