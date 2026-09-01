import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

function authRedirect(request: NextRequest, error?: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  if (error) {
    loginUrl.searchParams.set("error", error);
  }

  const response = NextResponse.redirect(loginUrl);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  let supabase;

  try {
    const { url, publishableKey } = getSupabaseEnvironment();
    supabase = createServerClient<Database>(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    });
  } catch {
    if (isProtectedRoute) {
      return authRedirect(request, "auth-unavailable");
    }

    return response;
  }

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error && isProtectedRoute) {
      return authRedirect(request, "auth-unavailable");
    }

    if (!data?.claims && isProtectedRoute) {
      return authRedirect(request);
    }
  } catch {
    if (isProtectedRoute) {
      return authRedirect(request, "auth-unavailable");
    }
  }

  return response;
}
