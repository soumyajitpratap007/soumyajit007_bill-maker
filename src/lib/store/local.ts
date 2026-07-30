"use client";
/**
 * Local storage layer so the app is fully usable without Supabase configured.
 * Once Supabase is set up, the same repo interface can be swapped for a remote client.
 */
import type { Bill, BusinessProfile, Client, Product } from "@/lib/types";

const KEYS = {
  business: "bm.business",
  clients: "bm.clients",
  products: "bm.products",
  bills: "bm.bills",
};

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

export const localStore = {
  getBusiness(): BusinessProfile | null {
    return read<BusinessProfile | null>(KEYS.business, null);
  },
  saveBusiness(b: BusinessProfile) {
    write(KEYS.business, b);
  },
  listClients(): Client[] {
    return read<Client[]>(KEYS.clients, []);
  },
  upsertClient(c: Client) {
    const all = localStore.listClients();
    const idx = all.findIndex((x) => x.id === c.id);
    if (idx >= 0) all[idx] = c; else all.unshift(c);
    write(KEYS.clients, all);
  },
  deleteClient(id: string) {
    write(KEYS.clients, localStore.listClients().filter((c) => c.id !== id));
  },
  listProducts(): Product[] {
    return read<Product[]>(KEYS.products, []);
  },
  upsertProduct(p: Product) {
    const all = localStore.listProducts();
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) all[idx] = p; else all.unshift(p);
    write(KEYS.products, all);
  },
  deleteProduct(id: string) {
    write(KEYS.products, localStore.listProducts().filter((p) => p.id !== id));
  },
  listBills(): Bill[] {
    return read<Bill[]>(KEYS.bills, []);
  },
  getBill(id: string): Bill | null {
    return localStore.listBills().find((b) => b.id === id) ?? null;
  },
  getBillByShortId(shortId: string): Bill | null {
    return localStore.listBills().find((b) => b.shortId === shortId) ?? null;
  },
  upsertBill(b: Bill) {
    const all = localStore.listBills();
    const idx = all.findIndex((x) => x.id === b.id);
    if (idx >= 0) all[idx] = b; else all.unshift(b);
    write(KEYS.bills, all);
  },
  deleteBill(id: string) {
    write(KEYS.bills, localStore.listBills().filter((b) => b.id !== id));
  },
};
