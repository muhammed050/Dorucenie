# Deployment

1. Deploy Next.js to Vercel.
2. Apply all Supabase migrations in order.
3. Configure Vault access and create server-only integration secrets.
4. Configure Whop sandbox plans first, then production plans and webhook `/api/webhooks/whop`.
5. Configure Shopify OAuth/webhooks when the Shopify integration is enabled.
6. Configure Resend and Sentry.
7. Set all variables from `.env.example` in Vercel.
8. Configure Supabase pg_cron/pg_net to call `/api/internal/scheduler` with the internal secret stored in Vault.
9. Run typecheck, lint, tests and production build in CI.
10. Perform cross-tenant RLS tests and a sandbox Whop checkout before switching to production billing.
