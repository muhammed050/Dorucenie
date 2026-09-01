-- Supabase no longer auto-exposes new public tables to the Data API. Grants are explicit; RLS remains the authorization boundary.
grant select, insert, update, delete on public.stores, public.store_connections, public.courier_connections, public.shipments, public.shipment_events, public.sla_rules, public.sla_breaches, public.alerts, public.courier_daily_metrics, public.subscriptions, public.notification_preferences, public.reports, public.audit_logs to authenticated;
grant select on public.couriers to authenticated;
revoke all on public.jobs from anon, authenticated;
revoke all on public.webhook_events from anon, authenticated;
