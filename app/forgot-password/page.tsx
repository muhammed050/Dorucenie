import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AuthLink, AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure password reset link for your Doručenie account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your email address and we’ll send a secure link if an account matches it."
      footer={
        <>
          Remembered your password? <AuthLink href="/login">Back to login</AuthLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
