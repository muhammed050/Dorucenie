import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireOrganizationMember } from "@/lib/auth";
import { encryptShopifyToken, exchangeShopifyCode, fetchShopifyShop, normalizeShopDomain, verifyShopifyCallbackHmac } from "@/lib/integrations/shopify";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(request: Request, code: string) {
  return NextResponse.redirect(new URL(`/stores?error=${encodeURIComponent(code)}`, request.url));
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("dorucenie_shopify_oauth_state")?.value;

  try {
    if (!expectedState || !params.get("state") || params.get("state") !== expectedState) {
      return failure(request, "invalid_state");
    }

    if (!verifyShopifyCallbackHmac(params)) {
      return failure(request, "invalid_hmac");
    }

    const shop = normalizeShopDomain(params.get("shop") || "");
    const code = params.get("code");
    if (!shop || !code) return failure(request, "invalid_callback");

    const { organization } = await requireOrganizationMember();
    const { token, scopes } = await exchangeShopifyCode(shop, code);
    const shopInfo = await fetchShopifyShop(shop, token.accessToken);
    const supabase = await createClient();

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .upsert(
        {
          organization_id: organization.id,
          name: shopInfo.name,
          platform: "shopify",
          external_store_id: shopInfo.id,
        },
        { onConflict: "organization_id,platform,external_store_id" },
      )
      .select("id")
      .single();

    if (storeError || !store) throw new Error("Could not save the Shopify store.");

    const { error: connectionError } = await supabase
      .from("store_connections")
      .upsert(
        {
          organization_id: organization.id,
          store_id: store.id,
          provider: "shopify",
          secret_ref: encryptShopifyToken(token),
          scopes,
          status: "active",
          metadata: {
            shop_domain: shopInfo.myshopifyDomain || shop,
            primary_domain: shopInfo.primaryDomain?.url || null,
            token_type: "expiring_offline",
            token_expires_at: token.expiresAt,
            refresh_token_expires_at: token.refreshTokenExpiresAt,
          },
        },
        { onConflict: "store_id,provider" },
      );

    if (connectionError) throw new Error("Could not save the Shopify connection.");

    const response = NextResponse.redirect(new URL("/stores?connected=shopify", request.url));
    response.cookies.delete("dorucenie_shopify_oauth_state");
    return response;
  } catch (error) {
    console.error("Shopify OAuth callback failed", error);
    const response = failure(request, "connection_failed");
    response.cookies.delete("dorucenie_shopify_oauth_state");
    return response;
  }
}
