"use client";

import Script from "next/script";

export function WhopCheckout({ planId }: { planId: string }) {
  if (!planId) return <div className="rounded-xl border p-4 text-sm text-muted-foreground">This plan is not configured yet.</div>;
  const environment = process.env.NEXT_PUBLIC_WHOP_ENV === "sandbox" ? "sandbox" : "production";
  return (
    <>
      <Script async defer src="https://js.whop.com/static/checkout/loader.js" />
      <div
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="system"
        data-whop-checkout-return-url={`${window.location.origin}/dashboard/billing?checkout=complete`}
        data-whop-checkout-style-container-padding-x="0"
      />
      <span data-whop-environment={environment} className="sr-only" />
    </>
  );
}
