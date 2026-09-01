import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { AuthLink, AuthPage } from "@/components/auth/auth-page";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Doručenie account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <AuthPage
      eyebrow="Account recovery"
      title={user ? "Choose a new password" : "Reset link unavailable"}
      description={
        user
          ? "Choose a new password for your Doručenie account."
          : "This reset link is invalid or has expired. Request a new link to continue."
      }
      footer={
        <>
          Need another link? <AuthLink href="/forgot-password">Request a reset</AuthLink>
        </>
      }
    >
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="rounded-control border border-warning-strong/30 bg-warning-soft px-3 py-3 text-sm leading-6 text-warning-strong" role="alert">
          No active recovery session was found. Reset links can only be used once and expire for your security.
        </div>
      )}
    </AuthPage>
  );
}
