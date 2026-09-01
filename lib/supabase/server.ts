import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

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
            cookieStore.set(name, value, options),
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
