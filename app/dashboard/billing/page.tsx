import { requireOrganizationMember } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/billing/access";
import { PLANS } from "@/lib/billing/plans";
import { WhopCheckout } from "@/components/billing/whop-checkout";

export default async function BillingPage() {
  const { organization } = await requireOrganizationMember();
  const plan = await getCurrentPlan(organization.id);
  const shipmentLimit = PLANS[plan].shipments;
  const starter = process.env.WHOP_PLAN_STARTER;
  const growth = process.env.WHOP_PLAN_GROWTH;
  const business = process.env.WHOP_PLAN_BUSINESS;
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header><p className="text-sm text-muted-foreground">Workspace billing</p><h1 className="text-3xl font-semibold">Plans & billing</h1></header>
      <section className="rounded-2xl border p-6"><p className="text-sm text-muted-foreground">Current plan</p><div className="mt-1 text-2xl font-semibold">{plan}</div><p className="mt-2 text-sm">Shipment limit: {Number.isFinite(shipmentLimit) ? shipmentLimit.toLocaleString() : "Unlimited"} / month</p></section>
      <section className="grid gap-6 md:grid-cols-3">
        {([ ["STARTER", starter], ["GROWTH", growth], ["BUSINESS", business] ] as const).map(([key, id]) => (
          <article key={key} className="rounded-2xl border p-5"><h2 className="text-xl font-semibold">{key}</h2><p className="mt-1 text-2xl">${PLANS[key].price}<span className="text-sm text-muted-foreground">/month</span></p><p className="mt-2 text-sm text-muted-foreground">{PLANS[key].shipments.toLocaleString()} shipments/month</p>{id ? <div className="mt-5"><WhopCheckout planId={id} /></div> : <p className="mt-5 text-sm text-amber-600">Configure this Whop plan ID.</p>}</article>
        ))}
      </section>
      <p className="text-xs text-muted-foreground">Payment completion in the browser is not authoritative. The subscription is activated only after a verified Whop webhook is processed.</p>
    </main>
  );
}
