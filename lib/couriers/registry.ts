import type { CourierAdapter } from "./types";

const adapters = new Map<string, CourierAdapter>();

export function registerCourier(adapter: CourierAdapter) { adapters.set(adapter.slug, adapter); }
export function getCourierAdapter(slug: string) {
  const adapter = adapters.get(slug);
  if (!adapter) throw new Error(`Courier adapter '${slug}' is not registered`);
  return adapter;
}
export function listCourierAdapters() { return [...adapters.values()]; }
