import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Secret references are stored in public tables; plaintext is never returned to
 * browser code. The exact Vault integration is deliberately isolated here so
 * providers cannot accidentally persist credentials themselves.
 */
export async function readSecret(secretRef: string | null): Promise<Record<string, unknown>> {
  if (!secretRef) throw new Error("Integration credentials are not configured");
  const admin = createAdminClient();
  const { data, error } = await admin.from("vault_secrets" as never).select("secret").eq("id", secretRef).maybeSingle();
  if (error) throw new Error(`Unable to read integration secret: ${error.message}`);
  if (!data) throw new Error("Integration secret not found");
  const secret = (data as { secret?: unknown }).secret;
  if (typeof secret === "string") return JSON.parse(secret) as Record<string, unknown>;
  if (secret && typeof secret === "object") return secret as Record<string, unknown>;
  throw new Error("Integration secret has invalid format");
}
