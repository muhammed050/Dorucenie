import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AlertsPage() {
  const { organization } = await requireOrganizationMember();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db.from("alerts").select("id,type,severity,title,message,status,created_at").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(100);
  return <main className="mx-auto max-w-5xl space-y-6 p-6"><header><h1 className="text-3xl font-semibold">Alerts</h1><p className="text-muted-foreground">Operational events that need attention.</p></header><div className="space-y-3">{data?.length ? data.map((alert: Record<string, unknown>) => <article key={String(alert.id)} className="rounded-xl border p-5"><div className="flex items-center justify-between gap-4"><h2 className="font-medium">{String(alert.title)}</h2><span className="text-xs text-muted-foreground">{String(alert.status)}</span></div><p className="mt-1 text-sm text-muted-foreground">{String(alert.message)}</p><p className="mt-3 text-xs text-muted-foreground">{String(alert.type)} · {new Date(String(alert.created_at)).toLocaleString()}</p></article>) : <div className="rounded-2xl border p-10 text-center text-muted-foreground">No alerts have been generated.</div>}</div></main>;
}
