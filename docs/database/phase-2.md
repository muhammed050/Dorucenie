# Phase 2 database contract

The migration `supabase/migrations/20260901000000_phase_2_identity_and_tenancy.sql` establishes the Supabase Auth identity and organization tenancy boundary. No Phase 3 domain tables are included.

## Tables

### `public.profiles`

| Column | Contract |
| --- | --- |
| `id` | UUID primary key and `auth.users(id)` foreign key with cascade delete |
| `display_name` | Optional text, at most 160 characters after trimming |
| `avatar_url` | Optional text, at most 2048 characters |
| `created_at`, `updated_at` | Non-null `timestamptz` values |

The authenticated user can read and update only their own profile. Profile creation is performed by the auth signup trigger.

### `public.organizations`

| Column | Contract |
| --- | --- |
| `id` | UUID primary key with database-generated UUID |
| `name` | Required non-blank text, at most 160 characters after trimming |
| `created_by` | Optional UUID foreign key to `auth.users(id)`, set null when that user is deleted |
| `created_at`, `updated_at` | Non-null `timestamptz` values |

Members can read their organizations. Members with `owner` or `admin` role can update the name. Direct client inserts and deletes are intentionally not granted.

### `public.organization_members`

| Column | Contract |
| --- | --- |
| `id` | UUID primary key with database-generated UUID |
| `organization_id` | Required foreign key to `organizations(id)` with cascade delete |
| `user_id` | Required foreign key to `auth.users(id)` with cascade delete |
| `role` | Required `owner`, `admin`, or `member` value; defaults to `member` |
| `created_at`, `updated_at` | Non-null `timestamptz` values |

`organization_id` plus `user_id` is unique. A partial unique index permits at most one owner per organization. The signup bootstrap creates the initial owner. Client-side role management cannot edit or delete an owner row; ownership transfer is a controlled server-side operation for a later milestone.

## Indexes

Primary-key indexes support direct identity lookups and foreign-key checks. The `(organization_id, user_id)` unique index supports tenant membership checks and prevents duplicate memberships. The partial owner index enforces the one-owner rule. The `(user_id, organization_id)` index supports loading all organizations for an authenticated user, which is the reverse access pattern not covered by the uniqueness index.

## Authorization contract

The RLS policies are granted only to `authenticated`. They resolve access from the JWT user returned by `auth.uid()` and the membership rows in `organization_members`. The RLS membership queries live in the non-exposed `private` schema; the public helper functions are invoker-security wrappers around those checks:

- `profiles`: own-row read/update only.
- `organizations`: member read; owner/admin update.
- `organization_members`: member read; admins can add members; owners can add or manage admins; owner rows are protected from client updates/deletes.

Every table has RLS enabled and forced. No policy authorizes access from a browser-supplied `organization_id` alone. An organization ID may be used as a selector only after the membership helper verifies the authenticated user.

The `service_role` retains the normal Supabase server-side bypass and table privileges. It is not exposed to browser code. Internal trigger and timestamp functions live in the non-exposed `private` schema and have no public execute privilege. The authorization helper functions are executable only by `authenticated` and `service_role`.

## Signup bootstrap

The `profiles_on_auth_user_created` trigger runs after an `auth.users` insert. It atomically creates:

1. a profile keyed to the new auth user;
2. an organization named from the optional `company_name` metadata, or `Doručenie organization`;
3. an `owner` membership for that user.

The trigger uses the auth row's UUID rather than request-supplied organization ownership. If any step fails, the auth insert fails as one transaction. Existing auth users created before this migration are not backfilled automatically.

## RLS verification scenarios

There is no live Supabase or local Postgres test harness in the Phase 1 repository, so these scenarios are documentation for the first database-enabled test run rather than claimed execution results.

Use two authenticated test sessions, user A and user B, and two organizations, A and B:

1. A can select organization A and its memberships, but cannot select organization B or B's memberships.
2. B cannot update organization A's name.
3. A cannot insert a membership into organization B, even when A supplies B's UUID.
4. A cannot update or delete a membership in organization B.
5. A cannot select or update B's profile; profile access is restricted to the profile owner.
6. An authenticated client cannot insert or delete an organization directly.
7. A non-admin member cannot insert, update, or delete memberships.
8. An admin can add a `member` but cannot grant `admin`; an owner can grant `admin`.
9. An owner membership cannot be changed or deleted through the client RLS path.
10. A service-side operation using the isolated `service_role` can perform controlled maintenance, while `anon` has no table or helper-function privileges.

Static checks for every migration review should confirm that each exposed tenant table has both `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`, that policy predicates call membership helpers, and that no policy uses an organization ID without membership verification.

## Migration verification status

The repository has no Supabase CLI, local Postgres instance, or live Supabase test project configured, so this migration has not been applied or rolled back here. Supabase migrations are forward-only; the CLI does not interpret a paired down file. Local rollback should use `supabase db reset` against a disposable database after the CLI is added, and production changes should be reversed only by a separately reviewed forward migration.
