# Billing

Plans are centralized in `lib/billing/plans.ts`. Plan IDs come only from environment variables.

Whop checkout is embedded in the billing page. The browser callback is informational only. Subscription state is activated/changed from verified Whop Standard Webhooks and deduplicated using `webhook_events`.

Required variables: `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `WHOP_ENV`, `WHOP_PLAN_STARTER`, `WHOP_PLAN_GROWTH`, `WHOP_PLAN_BUSINESS`.

Register `/api/webhooks/whop` in Whop for the required membership/payment events and API version v1.
