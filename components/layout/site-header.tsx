import { ArrowUpRight, PackageCheck } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

const navigation = [
  { label: "Foundation", href: "/#foundation" },
  { label: "Workspace", href: "/#workspace" },
  { label: "Principles", href: "/#principles" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-3 rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label="Doručenie home"
        >
          <span className="flex size-9 items-center justify-center rounded-control bg-brand text-on-brand shadow-button transition-transform duration-fast ease-out group-hover:-rotate-3">
            <PackageCheck className="size-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">Doručenie</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-ink-soft transition-colors duration-fast ease-out hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </ButtonLink>
          <ButtonLink href="/dashboard" size="sm">
            Open workspace
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
