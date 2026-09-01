import type { Metadata } from "next";
import { ArrowRight, Check, CircleHelp, Database, Gauge, LogOut, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import {
  AuthRequiredError,
  OrganizationAccessError,
  requireOrganizationMember,
} from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your authenticated Doručenie delivery workspace.",
};

export const dynamic = "force-dynamic";

const firstRunSteps = [
  {
    icon: Database,
    title: "Connect a source",
    description: "Bring in a real store or order source before delivery data appears here.",
  },
  {
    icon: ShieldCheck,
    title: "Add a courier",
    description: "Set up a supported courier connection when the source is ready.",
  },
  {
    icon: Gauge,
    title: "Define an SLA",
    description: "Choose the delivery promise you want the workspace to monitor.",
  },
] as const;

export default async function DashboardPage() {
  let access;

  try {
    access = await requireOrganizationMember();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect("/login?next=%2Fdashboard");
    }

    if (error instanceof OrganizationAccessError) {
      redirect("/unauthorized");
    }

    throw error;
  }

  const { organization, user } = access;
  const displayName = user.user_metadata.full_name;
  const greeting = typeof displayName === "string" && displayName.trim() ? displayName : "there";

  return (
    <div className="border-b border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="success">
              <span className="size-2 rounded-full bg-success" aria-hidden="true" />
              Workspace secured
            </Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Welcome, {greeting}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
              {organization.name} is ready for its first connected delivery signal. This workspace will only show data belonging to your organization.
            </p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Card className="border-brand/30">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                First run
              </p>
              <CardTitle className="mt-2 text-xl">Connect real data to begin</CardTitle>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                There are no sample shipments or invented performance metrics here. Once a source is connected, the workspace can surface what your couriers actually report.
              </p>
            </CardHeader>
            <CardContent>
              <ol className="mt-2 grid gap-3">
                {firstRunSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <li
                      key={step.title}
                      className="flex items-start gap-4 rounded-control border border-border-subtle bg-surface-muted px-4 py-4"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand-strong">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          <span className="mr-2 font-mono text-xs text-brand-strong">0{index + 1}</span>
                          {step.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-ink-soft">{step.description}</p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your organization</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <dl className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink-muted">Organization</dt>
                    <dd className="text-right font-medium text-ink">{organization.name}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink-muted">Your role</dt>
                    <dd className="text-right font-medium capitalize text-ink">{organization.membership.role}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink-muted">Signed in as</dt>
                    <dd className="max-w-[14rem] break-words text-right font-medium text-ink">{user.email}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card className="bg-surface-muted">
              <CardContent>
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink">What happens next?</h2>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">
                      Integrations and billing are intentionally not enabled in this phase. Your workspace will stay honest until real delivery sources are available.
                    </p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                  {["Your account is verified by Supabase Auth", "Your organization is scoped by membership", "No tenant data is loaded from the browser"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-success" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
