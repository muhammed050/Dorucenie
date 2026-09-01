begin;

create extension if not exists pgcrypto;

set local search_path = public, extensions, pg_catalog;

create schema private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 160
  ),
  constraint profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) between 1 and 2048
  )
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length check (
    char_length(btrim(name)) between 1 and 160
  )
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_members_org_user_key unique (organization_id, user_id),
  constraint organization_members_role_check check (role in ('owner', 'admin', 'member'))
);

create unique index organization_members_one_owner_idx
  on public.organization_members (organization_id)
  where role = 'owner';

create index organization_members_user_id_idx
  on public.organization_members (user_id, organization_id);

create function public.current_user_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid());
$$;

create function private.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as om
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
  );
$$;

create function private.is_organization_admin(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as om
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'admin')
  );
$$;

create function private.is_organization_owner(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as om
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
      and om.role = 'owner'
  );
$$;

create function private.require_organization_member(p_organization_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_organization_member(p_organization_id) then
    raise exception 'organization membership required'
      using errcode = '42501';
  end if;

  return p_organization_id;
end;
$$;

create function private.require_organization_admin(p_organization_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_organization_admin(p_organization_id) then
    raise exception 'organization administrator access required'
      using errcode = '42501';
  end if;

  return p_organization_id;
end;
$$;

create function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_organization_member(p_organization_id);
$$;

create function public.is_organization_admin(p_organization_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_organization_admin(p_organization_id);
$$;

create function public.is_organization_owner(p_organization_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_organization_owner(p_organization_id);
$$;

create function public.get_current_organization_id(p_organization_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when public.is_organization_member(p_organization_id) then p_organization_id
    else null
  end;
$$;

create function public.require_organization_member(p_organization_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select private.require_organization_member(p_organization_id);
$$;

create function public.require_organization_admin(p_organization_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select private.require_organization_admin(p_organization_id);
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
  v_organization_name text;
  v_organization_id uuid;
begin
  v_display_name := nullif(
    btrim(left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 160)),
    ''
  );

  v_organization_name := nullif(
    btrim(left(coalesce(new.raw_user_meta_data ->> 'company_name', ''), 160)),
    ''
  );

  if v_organization_name is null then
    v_organization_name := 'Doručenie organization';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name);

  insert into public.organizations (name, created_by)
  values (v_organization_name, new.id)
  returning id into v_organization_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_organization_id, new.id, 'owner');

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function private.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row
execute function private.set_updated_at();

create trigger profiles_on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;

alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = public.current_user_id());

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = public.current_user_id())
with check (id = public.current_user_id());

create policy organizations_select_for_members
on public.organizations
for select
to authenticated
using (public.is_organization_member(id));

create policy organizations_update_for_admins
on public.organizations
for update
to authenticated
using (public.is_organization_admin(id))
with check (public.is_organization_admin(id));

create policy organization_members_select_for_members
on public.organization_members
for select
to authenticated
using (public.is_organization_member(organization_id));

create policy organization_members_insert_for_admins
on public.organization_members
for insert
to authenticated
with check (
  public.is_organization_admin(organization_id)
  and role in ('admin', 'member')
  and (role <> 'admin' or public.is_organization_owner(organization_id))
);

create policy organization_members_update_for_authorized_admins
on public.organization_members
for update
to authenticated
using (
  public.is_organization_admin(organization_id)
  and role <> 'owner'
  and (role <> 'admin' or public.is_organization_owner(organization_id))
)
with check (
  public.is_organization_admin(organization_id)
  and role in ('admin', 'member')
  and (role <> 'admin' or public.is_organization_owner(organization_id))
);

create policy organization_members_delete_for_authorized_admins
on public.organization_members
for delete
to authenticated
using (
  public.is_organization_admin(organization_id)
  and role <> 'owner'
  and (role <> 'admin' or public.is_organization_owner(organization_id))
);

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.organizations from public, anon, authenticated;
revoke all on table public.organization_members from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

grant select on table public.organizations to authenticated;
grant update (name) on table public.organizations to authenticated;

grant select on table public.organization_members to authenticated;
grant insert (organization_id, user_id, role) on table public.organization_members to authenticated;
grant update (role) on table public.organization_members to authenticated;
grant delete on table public.organization_members to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.organizations to service_role;
grant all on table public.organization_members to service_role;

revoke all on function public.current_user_id() from public, anon, authenticated;
revoke all on function public.get_current_organization_id(uuid) from public, anon, authenticated;
revoke all on function public.require_organization_member(uuid) from public, anon, authenticated;
revoke all on function public.require_organization_admin(uuid) from public, anon, authenticated;
revoke all on function public.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function public.is_organization_admin(uuid) from public, anon, authenticated;
revoke all on function public.is_organization_owner(uuid) from public, anon, authenticated;

revoke all on function private.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function private.is_organization_admin(uuid) from public, anon, authenticated;
revoke all on function private.is_organization_owner(uuid) from public, anon, authenticated;
revoke all on function private.require_organization_member(uuid) from public, anon, authenticated;
revoke all on function private.require_organization_admin(uuid) from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

grant execute on function public.current_user_id() to authenticated, service_role;
grant execute on function public.is_organization_member(uuid) to authenticated, service_role;
grant execute on function public.is_organization_admin(uuid) to authenticated, service_role;
grant execute on function public.is_organization_owner(uuid) to authenticated, service_role;
grant execute on function public.get_current_organization_id(uuid) to authenticated, service_role;
grant execute on function public.require_organization_member(uuid) to authenticated, service_role;
grant execute on function public.require_organization_admin(uuid) to authenticated, service_role;

grant execute on function private.is_organization_member(uuid) to authenticated, service_role;
grant execute on function private.is_organization_admin(uuid) to authenticated, service_role;
grant execute on function private.is_organization_owner(uuid) to authenticated, service_role;
grant execute on function private.require_organization_member(uuid) to authenticated, service_role;
grant execute on function private.require_organization_admin(uuid) to authenticated, service_role;

commit;
