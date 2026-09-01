# Doručenie

Doručenie is a multi-tenant courier performance and delivery SLA monitoring SaaS. It connects real delivery sources, normalizes courier events, evaluates SLA risk and breaches, and provides courier performance analytics.

## Stack

- Next.js App Router / React / strict TypeScript
- Tailwind CSS v4
- Supabase Auth + Postgres + RLS + Vault
- PostgreSQL-backed jobs with atomic `SKIP LOCKED` claiming
- Vercel for the web application
- Whop embedded checkout for billing

## Core architecture

`shipments` are tenant-scoped. Courier providers implement the common adapter in `lib/couriers`. Workers process durable Postgres jobs with a 15-minute lease and 60-second heartbeat. The scheduler only enqueues work and fans out to at most five workers.

See `docs/architecture.md`, `docs/jobs.md`, `docs/security.md`, `docs/billing.md`, and `docs/deployment.md`.

## Development

Requirements: Node.js 22+ recommended.

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets. Service-role keys, Vault references, courier credentials, Whop webhook secrets and worker secrets are server-only.

## Integrations

- DHL Unified Shipment Tracking is implemented against the current DHL Group tracking endpoint.
- DPD is implemented behind a country-specific configured endpoint; the application refuses to guess a DPD API product when credentials/configuration are missing.
- Whop checkout is embedded in the application and subscription state is controlled by verified webhook events.
- Shopify, Resend and Sentry require external application credentials before their production flows can be activated.
