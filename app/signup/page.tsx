import type { Metadata } from "next";

import { AuthLink, AuthPage } from "@/components/auth/auth-page";
import { SignupForm } from "@/components/auth/auth-forms";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Doručenie workspace for your organization.",
};

type SignupSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SignupSearchParams;
}) {
  const params = await searchParams;
  const next = getSafeRedirectPath(firstParam(params.next));

  return (
    <AuthPage
      eyebrow="Get started"
      title="Create your workspace"
      description="Start with a secure organization workspace. You can connect real delivery sources when you’re ready."
      footer={
        <>
          Already have an account? <AuthLink href={`/login?next=${encodeURIComponent(next)}`}>Log in</AuthLink>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthPage>
  );
}
