-- Doručenie production core schema.
-- All tenant data is scoped by organization_id and protected by RLS.

create extension if not exists pgcrypto;

do $$ begin create type public.shipment_status as enum ('CREATED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION','FAILED','UNKNOWN'); exception when duplicate_object then null; end $$;
do $$ begin create type public.job_status as enum ('pending','processing','completed','retry_wait','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.alert_status as enum ('open','acknowledged','resolved'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_status as enum ('trialing','active','past_due','cancelled','expired','incomplete'); exception when duplicate_object then null; end $$;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, platform text not null default 'shopify', external_store_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id, platform, external_store_id)
);
create index if not exists stores_org_idx on public.stores(organization_id);

create table if not exists public.store_connections (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade, provider text not null,
  secret_ref text, scopes text[] not null default '{}', status text not null default 'active',
  metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(store_id, provider)
);
create index if not exists store_connections_org_idx on public.store_connections(organization_id);

create table if not exists public.couriers (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, country_codes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.courier_connections (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  courier_id uuid not null references public.couriers(id), name text not null, secret_ref text,
  status text not null default 'active', last_error text, last_checked_at timestamptz,
  metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id, courier_id, name)
);
create index if not exists courier_connections_org_idx on public.courier_connections(organization_id);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null, courier_connection_id uuid references public.courier_connections(id) on delete set null,
  tracking_number text not null, external_id text, status public.shipment_status not null default 'CREATED',
  service text, origin_country text, destination_country text, destination_region text, timezone text,
  estimated_delivery_at timestamptz, sla_deadline_at timestamptz, delivered_at timestamptz, shipped_at timestamptz,
  risk_level text not null default 'LOW', risk_score numeric(5,2) not null default 0,
  metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id, tracking_number)
);
create index if not exists shipments_org_status_idx on public.shipments(organization_id,status);
create index if not exists shipments_org_updated_idx on public.shipments(organization_id,updated_at desc);
create index if not exists shipments_risk_idx on public.shipments(organization_id,risk_level) where risk_level in ('HIGH','CRITICAL');

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade, provider_event_id text, status public.shipment_status not null,
  occurred_at timestamptz not null, location text, description text, raw_event jsonb not null default '{}', created_at timestamptz not null default now(),
  unique(shipment_id, provider_event_id)
);
create index if not exists shipment_events_shipment_idx on public.shipment_events(shipment_id,occurred_at desc);

create table if not exists public.sla_rules (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, active boolean not null default true, business_days boolean not null default true, cutoff_time time,
  timezone text not null default 'UTC', destination_country text, destination_region text, service text,
  target_days integer not null check(target_days >= 0), calendar_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists sla_rules_match_idx on public.sla_rules(organization_id,active,destination_country,service);

create table if not exists public.sla_breaches (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade, rule_id uuid references public.sla_rules(id) on delete set null,
  breached_at timestamptz not null default now(), delay_minutes integer not null default 0, resolved boolean not null default false,
  created_at timestamptz not null default now(), unique(shipment_id, rule_id)
);
create index if not exists sla_breaches_org_idx on public.sla_breaches(organization_id,breached_at desc);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null, payload jsonb not null default '{}', status public.job_status not null default 'pending',
  run_at timestamptz not null default now(), locked_until timestamptz, worker_id uuid, attempts integer not null default 0,
  max_attempts integer not null default 5, last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz
);
create index if not exists jobs_claim_idx on public.jobs(status,run_at,locked_until) where status in ('pending','retry_wait','processing');
create index if not exists jobs_org_idx on public.jobs(organization_id,status);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete cascade, courier_connection_id uuid references public.courier_connections(id) on delete cascade,
  type text not null, severity text not null default 'warning', title text not null, message text not null,
  status public.alert_status not null default 'open', dedupe_key text, created_at timestamptz not null default now(), acknowledged_at timestamptz, resolved_at timestamptz,
  unique(organization_id,dedupe_key)
);
create index if not exists alerts_org_status_idx on public.alerts(organization_id,status,created_at desc);

create table if not exists public.courier_daily_metrics (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  courier_id uuid not null references public.couriers(id), metric_date date not null, shipments integer not null default 0, delivered integer not null default 0,
  late integer not null default 0, failed integer not null default 0, exceptions integer not null default 0, avg_delivery_minutes numeric(12,2), sla_compliance numeric(5,2),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,courier_id,metric_date)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), organization_id uuid unique not null references public.organizations(id) on delete cascade,
  whop_customer_id text, whop_membership_id text unique, plan_id text, plan_key text not null default 'FREE', status public.subscription_status not null default 'trialing',
  period_start timestamptz, period_end timestamptz, cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, event_id text not null, event_type text, payload jsonb not null default '{}', processed_at timestamptz, created_at timestamptz not null default now(),
  unique(provider,event_id)
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(), organization_id uuid unique not null references public.organizations(id) on delete cascade,
  email_enabled boolean not null default true, daily_report boolean not null default true, weekly_report boolean not null default true,
  sla_alerts boolean not null default true, risk_alerts boolean not null default true, integration_alerts boolean not null default true, updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null, period_start date not null, period_end date not null, generated_at timestamptz, storage_path text, summary jsonb not null default '{}', created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid, action text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists audit_logs_org_idx on public.audit_logs(organization_id,created_at desc);

-- Seed the provider registry. No customer credentials are stored here.
insert into public.couriers(slug,name,country_codes) values
 ('dhl','DHL','{}'),('dpd','DPD','{}') on conflict(slug) do nothing;

-- Atomic job claiming. Expired processing leases become claimable again.
create or replace function public.claim_jobs(p_worker_id uuid, p_limit integer default 20, p_lease_minutes integer default 15)
returns setof public.jobs language plpgsql security definer set search_path = public as $$
begin
  return query
  with candidates as (
    select id from public.jobs
    where ((status in ('pending','retry_wait') and run_at <= now()) or (status='processing' and locked_until < now()))
    order by run_at asc, created_at asc
    for update skip locked
    limit greatest(1, least(p_limit,100))
  ), claimed as (
    update public.jobs j set status='processing', worker_id=p_worker_id, locked_until=now() + make_interval(mins => greatest(1,p_lease_minutes)), attempts=attempts+1, updated_at=now()
    from candidates c where j.id=c.id returning j.*
  ) select * from claimed;
end; $$;
revoke all on function public.claim_jobs(uuid,integer,integer) from public, anon, authenticated;
grant execute on function public.claim_jobs(uuid,integer,integer) to service_role;

create or replace function public.heartbeat_job(p_job_id uuid,p_worker_id uuid,p_lease_minutes integer default 15)
returns boolean language sql security definer set search_path=public as $$
update public.jobs set locked_until=now()+make_interval(mins=>greatest(1,p_lease_minutes)),updated_at=now()
where id=p_job_id and worker_id=p_worker_id and status='processing' returning true;
$$;
revoke all on function public.heartbeat_job(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.heartbeat_job(uuid,uuid,integer) to service_role;

-- RLS: tenant tables only visible to members of their organization. Service role bypasses RLS.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['stores','store_connections','courier_connections','shipments','shipment_events','sla_rules','sla_breaches','jobs','alerts','courier_daily_metrics','subscriptions','notification_preferences','reports','audit_logs'] LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
    EXECUTE format('alter table public.%I force row level security', t);
    EXECUTE format('drop policy if exists tenant_select on public.%I', t);
    EXECUTE format('drop policy if exists tenant_insert on public.%I', t);
    EXECUTE format('drop policy if exists tenant_update on public.%I', t);
    EXECUTE format('drop policy if exists tenant_delete on public.%I', t);
    EXECUTE format('create policy tenant_select on public.%I for select using (public.is_organization_member(organization_id))', t);
    EXECUTE format('create policy tenant_insert on public.%I for insert with check (public.is_organization_member(organization_id))', t);
    EXECUTE format('create policy tenant_update on public.%I for update using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id))', t);
    EXECUTE format('create policy tenant_delete on public.%I for delete using (public.is_organization_admin(organization_id))', t);
  END LOOP;
END $$;

alter table public.webhook_events enable row level security;
alter table public.webhook_events force row level security;
-- Webhook events are service-only; no authenticated policies are intentionally provided.
revoke all on public.webhook_events from anon, authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['stores','store_connections','courier_connections','shipments','sla_rules','jobs','courier_daily_metrics','subscriptions','notification_preferences'] LOOP
  EXECUTE format('drop trigger if exists touch_updated_at on public.%I',t);
  EXECUTE format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
 END LOOP;
END $$;
