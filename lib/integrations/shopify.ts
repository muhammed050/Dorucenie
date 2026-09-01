import { createHmac, timingSafeEqual } from "node:crypto";

import { encryptSecret } from "@/lib/crypto";

export const SHOPIFY_SCOPES = ["read_orders", "read_fulfillments"] as const;
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";

export type ShopifyToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string | null;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getShopifyClientId() {
  return required("SHOPIFY_CLIENT_ID");
}

export function getShopifyClientSecret() {
  return required("SHOPIFY_CLIENT_SECRET");
}

export function getShopifyAppUrl() {
  return required("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

export function getShopifyRedirectUri() {
  return `${getShopifyAppUrl()}/api/integrations/shopify/callback`;
}

export function normalizeShopDomain(value: string) {
  const shop = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) return null;
  return shop;
}

export function verifyShopifyCallbackHmac(params: URLSearchParams) {
  const provided = params.get("hmac");
  if (!provided) return false;

  const message = [...params.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = createHmac("sha256", getShopifyClientSecret()).update(message).digest("hex");
  const providedBuffer = Buffer.from(provided, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");

  return (
    providedBuffer.length === digestBuffer.length &&
    timingSafeEqual(providedBuffer, digestBuffer)
  );
}

export function encryptShopifyToken(token: ShopifyToken) {
  return encryptSecret(JSON.stringify(token));
}

export function buildShopifyAuthorizeUrl(shop: string, state: string) {
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", getShopifyClientId());
  url.searchParams.set("scope", SHOPIFY_SCOPES.join(","));
  url.searchParams.set("redirect_uri", getShopifyRedirectUri());
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeShopifyCode(shop: string, code: string) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: getShopifyClientId(),
      client_secret: getShopifyClientSecret(),
      code,
      expiring: "1",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Shopify token exchange failed.");

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    expires_in?: number;
    refresh_token_expires_in?: number;
  };

  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("Shopify returned an incomplete access token response.");
  }

  const now = Date.now();
  return {
    token: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(now + data.expires_in * 1000).toISOString(),
      refreshTokenExpiresAt: data.refresh_token_expires_in
        ? new Date(now + data.refresh_token_expires_in * 1000).toISOString()
        : null,
    } satisfies ShopifyToken,
    scopes: (data.scope || "").split(",").map((scope) => scope.trim()).filter(Boolean),
  };
}

export async function fetchShopifyShop(shop: string, accessToken: string) {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `query ShopIdentity { shop { id name myshopifyDomain primaryDomain { url } } }`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Could not read the Shopify store.");

  const data = (await response.json()) as {
    data?: { shop?: { id: string; name: string; myshopifyDomain: string; primaryDomain?: { url: string } | null } };
    errors?: Array<{ message?: string }>;
  };

  if (data.errors?.length || !data.data?.shop) {
    throw new Error(data.errors?.[0]?.message || "Could not read the Shopify store.");
  }

  return data.data.shop;
}
