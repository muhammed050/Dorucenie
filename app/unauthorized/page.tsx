import type { Metadata } from "next";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Access unavailable",
  description: "You do not have access to this Doručenie workspace.",
};

export default function UnauthorizedPage() {
  return (
    <section className="border-b border-border-subtle" aria-labelledby="unauthorized-title">
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-7xl items-start justify-center px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <Card className="w-full max-w-lg shadow-float">
          <CardContent className="p-8 text-center sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-panel bg-warning-soft text-warning-strong">
              <LockKeyhole className="size-7" aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">Access check</p>
            <h1 id="unauthorized-title" className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              This workspace is unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Your account is not a member of the organization requested by this page. Sign in with another account or return home.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/" variant="secondary">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Return home
              </ButtonLink>
              <ButtonLink href="/login">Sign in</ButtonLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
