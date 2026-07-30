"use client";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IPlus, ITrash, IEdit, IUser } from "@/components/ui/Icon";
import { localStore } from "@/lib/store/local";
import type { Client } from "@/lib/types";
import { INDIAN_STATES, isGstinValid, parseGstin } from "@/lib/indian";

function emptyClient(): Client {
  return {
    id: nanoid(10), name: "", gstin: "", email: "", phone: "",
    billingAddress: { country: "India" }, shippingAddress: { country: "India" },
  };
}

export default function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const { push } = useToast();

  useEffect(() => setItems(localStore.listClients()), []);

  function save(c: Client) {
    if (!c.name.trim()) { push({ message: "Client name is required", tone: "error" }); return; }
    if (c.gstin && !isGstinValid(c.gstin)) { push({ message: "Invalid GSTIN", tone: "error" }); return; }
    localStore.upsertClient(c);
    setItems(localStore.listClients());
    setEditing(null);
    push({ message: "Client saved", tone: "success" });
  }

  function remove(id: string) {
    if (!confirm("Delete this client?")) return;
    localStore.deleteClient(id);
    setItems(localStore.listClients());
  }

  const filtered = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.gstin ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Button onClick={() => setEditing(emptyClient())}><IPlus width={16} height={16}/> Add client</Button>
      </div>

      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-ink-500">
              <IUser />
              <div className="mt-2 font-medium text-ink-800 dark:text-ink-100">No clients yet</div>
              <div className="text-sm">Add your regulars once — auto-fill on every bill.</div>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((c) => (
                <li key={c.id} className="p-4 sm:p-5 flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink-900 dark:text-ink-50">{c.name}</div>
                    <div className="text-xs text-ink-500 mt-0.5 space-x-2">
                      {c.gstin ? <span>GSTIN {c.gstin}</span> : null}
                      {c.phone ? <span>· {c.phone}</span> : null}
                      {c.email ? <span>· {c.email}</span> : null}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {[c.billingAddress?.line1, c.billingAddress?.city, c.billingAddress?.stateName].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(c)}><IEdit width={14} height={14}/> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><ITrash width={14} height={14}/></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {editing ? (
        <ClientEditor client={editing} onCancel={() => setEditing(null)} onSave={save} />
      ) : null}
    </div>
  );
}

function ClientEditor({ client, onSave, onCancel }: { client: Client; onSave: (c: Client) => void; onCancel: () => void }) {
  const [c, setC] = useState<Client>(client);
  function set<K extends keyof Client>(k: K, v: Client[K]) { setC((prev) => ({ ...prev, [k]: v })); }
  function setAddr(kind: "billing" | "shipping", k: string, v: string) {
    setC((prev) => ({
      ...prev,
      [kind === "billing" ? "billingAddress" : "shippingAddress"]: {
        ...(kind === "billing" ? prev.billingAddress : prev.shippingAddress),
        [k]: v,
      },
    }));
  }
  function onGstinBlur() {
    if (!c.gstin) return;
    const parsed = parseGstin(c.gstin);
    if (parsed?.state && !c.billingAddress?.stateCode) {
      setC((prev) => ({ ...prev, billingAddress: { ...prev.billingAddress, stateCode: parsed.stateCode, stateName: parsed.state?.name } }));
    }
  }
  return (
    <Modal open onClose={onCancel} title={c.name ? `Edit ${c.name}` : "Add client"} size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name *" value={c.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="GSTIN" value={c.gstin ?? ""} onChange={(e) => set("gstin", e.target.value.toUpperCase())} onBlur={onGstinBlur} />
        <Input label="Phone" value={c.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        <Input label="Email" value={c.email ?? ""} onChange={(e) => set("email", e.target.value)} type="email" />
      </div>
      <h4 className="mt-6 font-semibold text-sm">Billing address</h4>
      <div className="grid gap-4 sm:grid-cols-2 mt-2">
        <Input label="Line 1" value={c.billingAddress?.line1 ?? ""} onChange={(e) => setAddr("billing", "line1", e.target.value)} />
        <Input label="Line 2" value={c.billingAddress?.line2 ?? ""} onChange={(e) => setAddr("billing", "line2", e.target.value)} />
        <Input label="City" value={c.billingAddress?.city ?? ""} onChange={(e) => setAddr("billing", "city", e.target.value)} />
        <Select label="State" value={c.billingAddress?.stateCode ?? ""} onChange={(e) => {
          const s = INDIAN_STATES.find((x) => x.code === e.target.value);
          setAddr("billing", "stateCode", e.target.value); setAddr("billing", "stateName", s?.name ?? "");
        }}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </Select>
        <Input label="Pincode" value={c.billingAddress?.pincode ?? ""} onChange={(e) => setAddr("billing", "pincode", e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(c)}>Save</Button>
      </div>
    </Modal>
  );
}
