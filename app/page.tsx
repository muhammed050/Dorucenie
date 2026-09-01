import {
  ArrowRight,
  Check,
  Database,
  Gauge,
  LockKeyhole,
  PackageSearch,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const foundations = [
  {
    icon: Workflow,
    title: "A clear application shell",
    description:
      "A focused App Router structure keeps public, authenticated, and server-only concerns ready to separate cleanly as the product grows.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible by default",
    description:
      "Semantic landmarks, keyboard-friendly controls, visible focus, readable contrast, and reduced-motion support are part of the foundation.",
  },
  {
    icon: Database,
    title: "Honest data states",
    description:
      "The first-run workspace makes the absence of connected delivery data explicit instead of presenting invented shipments or metrics.",
  },
] as const;

const principles = [
  "Real delivery data will be connected before performance is reported.",
  "Tenant boundaries and server-side authorization will be established before customer data is introduced.",
  "Every integration can grow behind a stable interface rather than leaking provider details into the UI.",
] as const;

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="border-b border-border-subtle" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="info">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              Foundation ready
            </Badge>
            <h1
              id="hero-title"
              className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl"
            >
              Know which couriers are costing you customers.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-soft">
              Doručenie gives ecommerce teams a clear way to understand delivery performance, SLA risk, and courier reliability before delays become customer complaints.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#workspace" size="lg">
                Start with your data
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#foundation" variant="secondary" size="lg">
                See the foundation
              </ButtonLink>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted">
              <LockKeyhole className="size-4 text-brand" aria-hidden="true" />
              <span>No live delivery data is connected yet.</span>
            </div>
          </div>

          <Card className="relative overflow-hidden shadow-float">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-brand-soft" aria-hidden="true" />
            <CardHeader className="relative flex flex-row items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                  Workspace
                </p>
                <CardTitle className="mt-2 text-xl">Delivery performance</CardTitle>
              </div>
              <Badge variant="neutral">Waiting for data</Badge>
            </CardHeader>
            <CardContent className="relative pt-10">
              <div className="flex min-h-64 flex-col items-center justify-center rounded-panel border border-dashed border-border-default bg-surface-muted px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-panel bg-brand-soft text-brand-strong">
                  <PackageSearch className="size-7" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-ink">Connect a source to begin</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">
                  Once a supported store or courier is connected, this space will surface the delivery signals that matter.
                </p>
              </div>
              <div className="mt-5 flex items-start gap-3 text-sm text-ink-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <p>Historical data will stay scoped to its organization.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="foundation" className="scroll-mt-24" aria-labelledby="foundation-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="The foundation"
            title="Built for signal, not dashboard theatre."
            description="The first milestone establishes the surface area the product needs without pretending that integrations or analytics exist before they are connected."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {foundations.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="h-full">
                  <CardHeader>
                    <div className="flex size-11 items-center justify-center rounded-control bg-brand-soft text-brand-strong">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-5">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <CardDescription className="mt-0">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workspace" className="scroll-mt-24 bg-surface" aria-labelledby="workspace-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.82fr] lg:items-start lg:gap-20 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="First-run workspace"
              title="A clear starting point, not a fake dashboard."
              description="There are no sample shipments, synthetic KPIs, or placeholder integrations in this shell. The next step is to connect real sources and then let the workspace reflect what they report."
            />
            <Card className="mt-8 border-brand/30 bg-canvas">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-brand text-on-brand">
                    <Gauge className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">Monitoring starts with connected data</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      Connect a store, add a courier connection, and define an SLA rule before relying on delivery performance signals.
                    </p>
                  </div>
                </div>
                <ol className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    "Connect a source",
                    "Add a courier",
                    "Define an SLA",
                  ].map((step, index) => (
                    <li key={step} className="flex items-center gap-3 rounded-control border border-border-subtle bg-surface px-3 py-3 text-sm font-medium text-ink-soft">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong" aria-hidden="true">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">What is in place</p>
              <CardTitle className="mt-2 text-xl">A foundation you can trust</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4" aria-label="Foundation capabilities">
                {[
                  "Strict TypeScript boundaries",
                  "Tokenized light and dark themes",
                  "Reusable accessible controls",
                  "Responsive layout primitives",
                  "Secure baseline headers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="principles" className="scroll-mt-24" aria-labelledby="principles-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
            <SectionHeading
              eyebrow="Product principles"
              title="Make the important answer easier to find."
              description="Doručenie is being shaped around trustworthy operational context: what happened, where it happened, and what deserves attention next."
            />
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0">
              {principles.map((principle, index) => (
                <li key={principle} className="flex gap-4 border-b border-border-subtle py-5 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="font-mono text-sm text-brand-strong">0{index + 1}</span>
                  <p className="max-w-xl text-sm leading-7 text-ink-soft">{principle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
