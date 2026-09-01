# Doručenie

Doručenie is a Next.js App Router foundation for a production courier performance and delivery SLA monitoring product. The application is intentionally data-free until real delivery sources are connected, while Phase 2 provides Supabase email/password identity, organization bootstrap, and protected workspace routing.

## Stack

- Next.js App Router
- React and strict TypeScript
- Tailwind CSS v4 through PostCSS
- Lucide icons
- Vitest for unit tests

## Local development

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` for local configuration. The example file contains empty placeholders only. Public variables are limited to values intended for browser-safe use; service-role keys, provider credentials, webhook secrets, and worker secrets must remain server-side.

Phase 2 initializes Supabase Auth through `@supabase/ssr`. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_URL` in `.env.local`. Add `${NEXT_PUBLIC_APP_URL}/auth/callback` to the Supabase Auth redirect allow list. The signup trigger in `supabase/migrations/20260901000000_phase_2_identity_and_tenancy.sql` creates the profile, organization, and owner membership; the application never accepts an organization ownership or membership decision from the browser.

Whop, Shopify, courier APIs, Resend, and Sentry are not initialized. Those integrations should be added behind their server-side boundaries in later milestones, using the variables already reserved in `.env.example`.

## UI foundation

Design tokens live in `app/globals.css` as semantic CSS variables with light and dark system themes. Reusable controls are in `components/ui`, and the root shell is composed from semantic landmarks with visible keyboard focus, a skip link, responsive layout behavior, and reduced-motion support.
