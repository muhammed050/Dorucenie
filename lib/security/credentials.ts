import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** Secret references are stored in tenant tables; plaintext never crosses to browser code. */
export async function readSecret(secretRef: string | null): Promise<Record<string, unknown>> {
  if (!secretRef) throw new Error("Integration credentials are not configured");
  const admin = createAdminClient();
  const { data, error } = await admin.schema("vault").from("decrypted_secrets").select("id,name,secret").eq("id", secretRef).maybeSingle();
  if (error) throw new Error(`Unable to read integration secret: ${error.message}`);
  if (!data?.secret) throw new Error("Integration secret not found");
  if (typeof data.secret !== "string") throw new Error("Integration secret has invalid format");
  return JSON.parse(data.secret) as Record<string, unknown>;
}
