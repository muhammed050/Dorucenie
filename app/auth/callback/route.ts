import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", requestUrl));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=callback", requestUrl));
    }
  } catch {
    return NextResponse.redirect(new URL("/login?error=callback", requestUrl));
  }

  return NextResponse.redirect(new URL(next, requestUrl));
}
