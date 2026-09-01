alter table public.couriers enable row level security;
create policy couriers_catalog_select on public.couriers for select to authenticated using (true);
revoke insert,update,delete on public.couriers from anon,authenticated;
