"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="border-b border-border-subtle" aria-labelledby="error-title">
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-7xl items-start justify-center px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <Card className="w-full max-w-lg shadow-float">
          <CardContent className="p-8 text-center sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-panel bg-danger-soft text-danger-strong">
              <AlertTriangle className="size-7" aria-hidden="true" />
            </div>
            <h1 id="error-title" className="mt-6 text-2xl font-semibold tracking-tight text-ink">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              We couldn&apos;t load this page. Try again, and contact your administrator if the problem continues.
            </p>
            <Button type="button" className="mt-8" onClick={reset}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
