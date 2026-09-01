import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { AuthRequiredError, requireOrganizationMember } from "@/lib/auth";
import { buildShopifyAuthorizeUrl, normalizeShopDomain } from "@/lib/integrations/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawShop = url.searchParams.get("shop") || "";

  try {
    await requireOrganizationMember();

    const shop = normalizeShopDomain(rawShop);

    if (!shop) {
      return NextResponse.redirect(new URL("/stores?error=invalid_shop", url.origin));
    }

    const state = randomBytes(32).toString("hex");
    const response = NextResponse.redirect(buildShopifyAuthorizeUrl(shop, state));

    response.cookies.set("dorucenie_shopify_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("next", "/stores");
      return NextResponse.redirect(loginUrl);
    }

    console.error("Shopify connect failed", error);
    return NextResponse.redirect(new URL("/stores?error=connection_failed", url.origin));
  }
}
