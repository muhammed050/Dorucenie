# Jobs

The `jobs` table is the durable queue. `claim_jobs()` is the only claim path and uses `FOR UPDATE SKIP LOCKED`.

Workers authenticate with `INTERNAL_WORKER_SECRET`, claim at most 20 jobs, and own a lease for 15 minutes. A worker renews its own jobs every 60 seconds. Completion/failure updates require the same `worker_id`.

Retryable work uses exponential backoff. Rate-limit errors should be rescheduled rather than converted into shipment failures.

Configure Supabase Cron/pg_cron to call `/api/internal/scheduler` every few minutes. Store the deployed app URL and worker secret in Supabase Vault rather than hardcoding either into migrations.
