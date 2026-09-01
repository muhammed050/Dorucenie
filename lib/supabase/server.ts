import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function authCookieOptions(name: string, options: Record<string, unknown> = {}) {
  if (!name.includes("-auth-token")) {
    return options;
  }

  return {
    ...options,
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

function isReadonlyCookieError(error: unknown) {
  return (
    error instanceof Error &&
    /cookies can only be modified|readonly|read-only/i.test(error.message)
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, authCookieOptions(name, options)),
          );
        } catch (error) {
          if (!isReadonlyCookieError(error)) {
            throw error;
          }
        }
      },
    },
  });
}
