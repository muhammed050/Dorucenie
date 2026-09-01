export function getSafeRedirectPath(value: unknown, fallback = "/dashboard") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\u0000")
  ) {
    return fallback;
  }

  return value;
}

export function getApplicationUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const applicationUrl = new URL(configuredUrl);

  if (!["http:", "https:"].includes(applicationUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTP or HTTPS.");
  }

  return applicationUrl.origin;
}
