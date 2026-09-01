import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnvironment } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url } = getSupabaseEnvironment();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
