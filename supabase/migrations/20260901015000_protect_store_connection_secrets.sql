-- Store OAuth credentials are encrypted before persistence.
-- The browser must not be able to select the ciphertext column at all.
revoke select (secret_ref) on table public.store_connections from anon, authenticated;
grant insert (organization_id, store_id, provider, secret_ref, scopes, status, metadata) on table public.store_connections to authenticated;
grant update (organization_id, store_id, provider, secret_ref, scopes, status, metadata) on table public.store_connections to authenticated;
