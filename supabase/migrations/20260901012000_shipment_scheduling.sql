alter table public.shipments add column if not exists next_check_at timestamptz not null default now();
create index if not exists shipments_due_check_idx on public.shipments(next_check_at) where status not in ('DELIVERED','FAILED');
