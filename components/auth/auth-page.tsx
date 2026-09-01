import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthPage({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle" aria-labelledby="auth-title">
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-7xl items-start justify-center px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <Card className="w-full max-w-md shadow-float">
          <CardHeader className="p-6 pb-0 sm:p-8 sm:pb-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              {eyebrow}
            </p>
            <CardTitle id="auth-title" className="mt-3 text-2xl sm:text-3xl">
              {title}
            </CardTitle>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{description}</p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">{children}</CardContent>
          <div className="border-t border-border-subtle px-6 py-5 text-center text-sm text-ink-soft sm:px-8">
            {footer}
          </div>
        </Card>
      </div>
    </section>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand-strong underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
