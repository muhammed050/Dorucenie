import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export function createClient() {
  const { url, publishableKey } = getSupabaseEnvironment();

  return createBrowserClient<Database>(url, publishableKey);
}
