import { NextResponse } from "next/server";

import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);

  try {
    const { organization } = await requireOrganizationMember();
    const formData = await request.formData();
    const storeId = String(formData.get("store_id") || "").trim();

    if (!storeId) {
      return NextResponse.redirect(new URL("/stores?error=invalid_store", url.origin));
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("store_connections")
      .update({
        status: "disconnected",
        secret_ref: null,
        metadata: {},
        scopes: [],
      })
      .eq("organization_id", organization.id)
      .eq("store_id", storeId)
      .eq("provider", "shopify");

    if (error) throw error;

    return NextResponse.redirect(new URL("/stores?disconnected=shopify", url.origin));
  } catch (error) {
    console.error("Shopify disconnect failed", error);
    return NextResponse.redirect(new URL("/stores?error=disconnect_failed", url.origin));
  }
}
