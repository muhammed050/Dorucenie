alter table public.jobs add column if not exists dedupe_key text;
create unique index if not exists jobs_dedupe_idx on public.jobs(organization_id,dedupe_key) where dedupe_key is not null and status in ('pending','processing','retry_wait');

create table if not exists public.provider_rate_limits (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null, window_start timestamptz not null, used integer not null default 0, limit_value integer not null,
  unique(organization_id,provider,window_start)
);
alter table public.provider_rate_limits enable row level security;
alter table public.provider_rate_limits force row level security;
create policy provider_rate_limits_select on public.provider_rate_limits for select using (public.is_organization_admin(organization_id));
revoke insert,update,delete on public.provider_rate_limits from anon,authenticated;

create or replace function public.consume_provider_rate(p_organization_id uuid,p_provider text,p_limit integer,p_window_seconds integer default 60)
returns boolean language plpgsql security definer set search_path=public as $$
declare w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds); updated integer;
begin
 insert into provider_rate_limits(organization_id,provider,window_start,used,limit_value) values(p_organization_id,p_provider,w,1,p_limit)
 on conflict(organization_id,provider,window_start) do update set used=provider_rate_limits.used+1,limit_value=excluded.limit_value
 returning used into updated;
 if updated > p_limit then
   update provider_rate_limits set used=greatest(0,used-1) where organization_id=p_organization_id and provider=p_provider and window_start=w;
   return false;
 end if;
 return true;
end; $$;
revoke all on function public.consume_provider_rate(uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_provider_rate(uuid,text,integer,integer) to service_role;
