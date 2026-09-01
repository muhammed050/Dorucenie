-- Keep the encrypted OAuth secret completely outside the authenticated API surface.
revoke select on table public.store_connections from anon, authenticated;
grant select (id, organization_id, store_id, provider, scopes, status, metadata, created_at, updated_at) on table public.store_connections to authenticated;
revoke select (secret_ref) on table public.store_connections from anon, authenticated;
