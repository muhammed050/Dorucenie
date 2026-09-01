import { notFound } from "next/navigation";
import { requireOrganizationMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ShipmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organization } = await requireOrganizationMember();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: shipment } = await db.from("shipments").select("*,courier_connections(name,couriers(name))").eq("id", id).eq("organization_id", organization.id).maybeSingle();
  if (!shipment) notFound();
  const { data: events } = await db.from("shipment_events").select("id,status,occurred_at,location,description").eq("shipment_id", id).eq("organization_id", organization.id).order("occurred_at", { ascending: false });
  return <main className="mx-auto max-w-5xl space-y-8 p-6"><header><p className="text-sm text-muted-foreground">Shipment</p><h1 className="text-3xl font-semibold">{shipment.tracking_number}</h1><p className="mt-2 text-muted-foreground">{shipment.status} · {shipment.destination_country ?? "Unknown destination"}</p></header><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Courier",shipment.courier_connections?.couriers?.name ?? "—"],["Service",shipment.service ?? "—"],["Risk",shipment.risk_level],["SLA deadline",shipment.sla_deadline_at ? new Date(shipment.sla_deadline_at).toLocaleString() : "—"]].map(([k,v])=><div key={k} className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 font-medium">{String(v)}</p></div>)}</section><section className="rounded-2xl border p-6"><h2 className="text-lg font-semibold">Tracking timeline</h2><div className="mt-6 space-y-5">{events?.length ? events.map((event: Record<string, unknown>)=><div key={String(event.id)} className="border-l-2 pl-4"><p className="font-medium">{String(event.status)}</p><p className="text-sm text-muted-foreground">{new Date(String(event.occurred_at)).toLocaleString()} · {String(event.location ?? "")}</p><p className="mt-1 text-sm">{String(event.description ?? "")}</p></div>) : <p className="py-8 text-center text-muted-foreground">No provider events have been received.</p>}</div></section></main>;
}
