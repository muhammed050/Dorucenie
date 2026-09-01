import type { Metadata } from "next";
import { CheckCircle2, ExternalLink, Link2, Store as StoreIcon, Unplug } from "lucide-react";

import { requireOrganizationMember } from "@/lib/auth";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Stores",
  description: "Connect and manage your Doručenie store integrations.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ connected?: string; disconnected?: string; error?: string }>;

const errors: Record<string, string> = {
  invalid_shop: "Enter a valid Shopify myshopify.com domain.",
  invalid_state: "The Shopify authorization expired or was started in another browser session.",
  invalid_hmac: "Shopify authorization could not be verified.",
  invalid_callback: "Shopify returned an incomplete authorization response.",
  connection_failed: "We could not finish the Shopify connection. Check your Shopify app credentials and try again.",
  invalid_store: "The selected store could not be identified.",
  disconnect_failed: "We could not disconnect that store. Please try again.",
};

export default async function StoresPage({ searchParams }: { searchParams: SearchParams }) {
  const { organization } = await requireOrganizationMember();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id, name, platform, external_store_id, created_at, updated_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  const storeIds = (stores ?? []).map((store) => store.id);
  const { data: connections } = storeIds.length
    ? await supabase
        .from("store_connections")
        .select("store_id, provider, status, scopes, metadata, updated_at")
        .eq("organization_id", organization.id)
        .in("store_id", storeIds)
    : { data: [] };

  const connectionByStore = new Map((connections ?? []).map((connection) => [connection.store_id, connection]));

  return (
    <div className="border-b border-border-subtle">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">Integrations</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Stores</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
              Connect your store once. Doručenie will use the connection as the source for real order and delivery data.
            </p>
          </div>
          <ButtonLink href="/dashboard" variant="secondary" size="sm">Back to dashboard</ButtonLink>
        </div>

        {params.error ? <div className="mt-6 rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger-strong">{errors[params.error] || "Something went wrong. Please try again."}</div> : null}
        {params.connected === "shopify" ? <div className="mt-6 flex items-center gap-2 rounded-control border border-success/30 bg-success-soft px-4 py-3 text-sm text-success-strong"><CheckCircle2 className="size-4" aria-hidden="true" /> Shopify store connected successfully.</div> : null}
        {params.disconnected === "shopify" ? <div className="mt-6 flex items-center gap-2 rounded-control border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-soft"><Unplug className="size-4" aria-hidden="true" /> Shopify connection disconnected. Your store record remains available for a future reconnect.</div> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-brand/30">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-control bg-brand-soft text-brand-strong"><Link2 className="size-5" aria-hidden="true" /></div>
              <CardTitle className="mt-4 text-xl">Connect Shopify</CardTitle>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Enter the permanent <span className="font-mono">myshopify.com</span> domain. You will be redirected to Shopify to approve access.</p>
            </CardHeader>
            <CardContent>
              <form action="/api/integrations/shopify/connect" method="get" className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink">Shopify store domain</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input name="shop" required placeholder="your-store.myshopify.com" pattern="[A-Za-z0-9][A-Za-z0-9-]*\\.myshopify\\.com" className="min-h-11 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-focus sm:flex-1" />
                    <Button type="submit" className="sm:w-auto">Connect Shopify</Button>
                  </div>
                </label>
              </form>
              <p className="mt-4 text-xs leading-5 text-ink-muted">Doručenie requests only the read permissions needed for order and fulfillment monitoring. The Shopify access token never reaches the browser.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Connected stores</CardTitle></CardHeader>
            <CardContent>
              {storesError ? <p className="text-sm text-danger-strong">We could not load your stores.</p> : stores?.length ? (
                <div className="space-y-3">
                  {stores.map((store) => {
                    const connection = connectionByStore.get(store.id);
                    const active = connection?.status === "active";
                    const metadata = connection?.metadata;
                    const shopDomain = metadata && typeof metadata === "object" && !Array.isArray(metadata) && typeof metadata.shop_domain === "string" ? metadata.shop_domain : "";

                    return (
                      <div key={store.id} className="rounded-control border border-border-subtle bg-surface-muted p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface text-brand-strong"><StoreIcon className="size-4" aria-hidden="true" /></span>
                          <div className="min-w-0 flex-1"><p className="font-medium text-ink">{store.name}</p><p className="mt-1 truncate text-xs text-ink-muted">{shopDomain || store.external_store_id || "Shopify"}</p></div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${active ? "bg-success-soft text-success-strong" : "bg-surface text-ink-muted"}`}>{active ? "Connected" : "Disconnected"}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {shopDomain ? <a href={`https://${shopDomain}/admin`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-default px-3 text-xs font-medium text-ink-soft hover:border-brand hover:bg-brand-soft">Open Shopify <ExternalLink className="size-3.5" aria-hidden="true" /></a> : null}
                          {active ? (
                            <form action="/api/integrations/shopify/disconnect" method="post"><input type="hidden" name="store_id" value={store.id} /><Button type="submit" variant="secondary" size="sm">Disconnect</Button></form>
                          ) : shopDomain ? (
                            <a href={`/api/integrations/shopify/connect?shop=${encodeURIComponent(shopDomain)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-brand bg-brand px-3 text-xs font-medium text-on-brand hover:bg-brand-strong">Reconnect</a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-control border border-dashed border-border-default bg-surface-muted px-5 py-8 text-center"><StoreIcon className="mx-auto size-6 text-ink-muted" aria-hidden="true" /><p className="mt-3 text-sm font-medium text-ink">No stores connected yet</p><p className="mt-1 text-sm leading-6 text-ink-soft">Connect Shopify to make real order data available to Doručenie.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
