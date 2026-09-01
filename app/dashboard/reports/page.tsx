import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const { organization } = await requireOrganizationMember();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db.from("reports").select("id,type,period_start,period_end,generated_at,summary").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(50);
  return <main className="mx-auto max-w-5xl space-y-6 p-6"><header><h1 className="text-3xl font-semibold">Reports</h1><p className="text-muted-foreground">Daily, weekly and monthly performance reports.</p></header><div className="space-y-3">{data?.length ? data.map((report: Record<string,unknown>)=><article key={String(report.id)} className="rounded-xl border p-5"><div className="flex justify-between"><h2 className="font-medium">{String(report.type)}</h2><span className="text-sm text-muted-foreground">{String(report.period_start)} → {String(report.period_end)}</span></div></article>) : <div className="rounded-2xl border p-10 text-center text-muted-foreground">No reports have been generated yet.</div>}</div></main>;
}
