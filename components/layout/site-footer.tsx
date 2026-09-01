import { PackageCheck } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <PackageCheck className="size-4 text-brand" aria-hidden="true" />
          Doručenie
        </Link>
        <p className="max-w-md text-sm leading-6 text-ink-muted">
          Delivery performance monitoring for teams that need a clear view of what happens after checkout.
        </p>
      </div>
    </footer>
  );
}
