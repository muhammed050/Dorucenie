import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { requireOrganizationMember } from "@/lib/auth";
import { buildShopifyAuthorizeUrl, normalizeShopDomain } from "@/lib/integrations/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireOrganizationMember();

    const url = new URL(request.url);
    const shop = normalizeShopDomain(url.searchParams.get("shop") || "");

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
  } catch {
    const url = new URL(request.url);
    return NextResponse.redirect(new URL("/login?next=%2Fstores", url.origin));
  }
}
