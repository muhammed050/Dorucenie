# Architecture

Doručenie is a serverless multi-tenant Next.js application backed by Supabase Postgres/Auth. Browser requests use the SSR Supabase client and tenant authorization helpers. Server-only integrations use a service-role client isolated in `lib/supabase/admin.ts`.

## Data flow

Shopify/courier source → ingestion/job enqueue → Postgres jobs → bounded workers → provider adapter → normalized shipment events → SLA/risk engine → aggregated metrics/alerts → dashboard/reports.

Billing is separate: embedded Whop checkout → verified Standard Webhook → idempotent subscription synchronization → server-side plan enforcement.

## Queue guarantees

- PostgreSQL `FOR UPDATE SKIP LOCKED` atomic claim.
- 15-minute lease with worker ownership.
- 60-second heartbeat.
- Retry backoff and terminal failure.
- Scheduler only enqueues and fans out at most five workers.
