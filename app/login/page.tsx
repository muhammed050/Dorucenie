import type { Metadata } from "next";

import { AuthLink, AuthPage } from "@/components/auth/auth-page";
import { LoginForm } from "@/components/auth/auth-forms";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Doručenie workspace.",
};

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusMessage(error: string | undefined, success: string | undefined) {
  if (error === "callback") {
    return "That verification link is invalid or has expired. Request a new one if needed.";
  }

  if (error === "auth-unavailable") {
    return "The authentication service is temporarily unavailable. Please try again shortly.";
  }

  if (error === "logout") {
    return "We couldn't complete sign out. Please try again.";
  }

  if (success === "check-email") {
    return "Account created. Check your email to verify your address before logging in.";
  }

  if (success === "password-updated") {
    return "Password updated. Log in with your new password.";
  }

  if (success === "signed-out") {
    return "You have been signed out.";
  }

  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const next = getSafeRedirectPath(firstParam(params.next));
  const status = statusMessage(firstParam(params.error), firstParam(params.success));

  return (
    <AuthPage
      eyebrow="Welcome back"
      title="Log in to your workspace"
      description="Use your Doručenie account to continue to your organization’s delivery workspace."
      footer={
        <>
          Don&apos;t have an account? <AuthLink href={`/signup?next=${encodeURIComponent(next)}`}>Create one</AuthLink>
        </>
      }
    >
      {status ? (
        <p
          className="mb-5 rounded-control border border-brand/30 bg-brand-soft px-3 py-3 text-sm leading-6 text-brand-strong"
          role="status"
        >
          {status}
        </p>
      ) : null}
      <LoginForm next={next} />
    </AuthPage>
  );
}
