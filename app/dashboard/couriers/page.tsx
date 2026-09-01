import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CouriersPage() {
  const { organization } = await requireOrganizationMember();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db.from("courier_daily_metrics").select("metric_date,shipments,delivered,late,failed,exceptions,avg_delivery_minutes,sla_compliance,couriers(name)").eq("organization_id", organization.id).order("metric_date", { ascending: false }).limit(100);
  return <main className="mx-auto max-w-6xl space-y-6 p-6"><header><h1 className="text-3xl font-semibold">Courier performance</h1><p className="text-muted-foreground">Aggregated delivery performance from real shipment data.</p></header><div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[800px] text-sm"><thead className="bg-muted/50"><tr>{["Courier","Date","Shipments","Delivered","Late","Failed","SLA %","Avg minutes"].map((h)=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody>{data?.length ? data.map((row: Record<string, unknown>,i:number)=><tr key={`${row.metric_date}-${i}`} className="border-t"><td className="px-4 py-3">{String((row.couriers as Record<string,unknown>|null)?.name ?? "—")}</td><td className="px-4 py-3">{String(row.metric_date)}</td><td className="px-4 py-3">{String(row.shipments)}</td><td className="px-4 py-3">{String(row.delivered)}</td><td className="px-4 py-3">{String(row.late)}</td><td className="px-4 py-3">{String(row.failed)}</td><td className="px-4 py-3">{row.sla_compliance == null ? "—" : `${row.sla_compliance}%`}</td><td className="px-4 py-3">{String(row.avg_delivery_minutes ?? "—")}</td></tr>) : <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Metrics will appear after real shipments are processed.</td></tr>}</tbody></table></div></main>;
}
