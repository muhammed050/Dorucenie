import Link from "next/link";
import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ShipmentsPage() {
  const { organization } = await requireOrganizationMember();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db.from("shipments").select("id,tracking_number,status,service,destination_country,risk_level,sla_deadline_at,updated_at,courier_connections(name,couriers(name))").eq("organization_id", organization.id).order("updated_at", { ascending: false }).limit(100);
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header><p className="text-sm text-muted-foreground">Delivery operations</p><h1 className="text-3xl font-semibold">Shipments</h1></header>
      <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[900px] text-sm"><thead className="bg-muted/50"><tr>{["Tracking","Courier","Status","Destination","SLA","Risk","Updated"].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr></thead><tbody>{error ? <tr><td colSpan={7} className="p-6 text-red-600">Unable to load shipments.</td></tr> : data?.length ? data.map((shipment: Record<string, unknown>) => <tr key={String(shipment.id)} className="border-t"><td className="px-4 py-3"><Link className="font-medium underline-offset-4 hover:underline" href={`/dashboard/shipments/${shipment.id}`}>{String(shipment.tracking_number)}</Link></td><td className="px-4 py-3">{String(((shipment.courier_connections as Record<string, unknown> | null)?.couriers as Record<string, unknown> | null)?.name ?? "—")}</td><td className="px-4 py-3">{String(shipment.status)}</td><td className="px-4 py-3">{String(shipment.destination_country ?? "—")}</td><td className="px-4 py-3">{shipment.sla_deadline_at ? new Date(String(shipment.sla_deadline_at)).toLocaleString() : "—"}</td><td className="px-4 py-3">{String(shipment.risk_level)}</td><td className="px-4 py-3">{new Date(String(shipment.updated_at)).toLocaleString()}</td></tr>) : <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No real shipments are connected yet.</td></tr>}</tbody></table></div>
    </main>
  );
}
