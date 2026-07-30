"use client";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IPlus, ITrash, IEdit, IFile } from "@/components/ui/Icon";
import { localStore } from "@/lib/store/local";
import type { Product } from "@/lib/types";
import { GST_RATES, HSN_STARTER } from "@/lib/indian";
import { formatINR } from "@/lib/indian/currency";

function emptyProduct(): Product {
  return { id: nanoid(10), name: "", rate: 0, gstRate: 18, unit: "NOS" };
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const { push } = useToast();

  useEffect(() => setItems(localStore.listProducts()), []);

  function save(p: Product) {
    if (!p.name.trim()) { push({ message: "Product name is required", tone: "error" }); return; }
    localStore.upsertProduct(p);
    setItems(localStore.listProducts());
    setEditing(null);
    push({ message: "Product saved", tone: "success" });
  }
  function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    localStore.deleteProduct(id);
    setItems(localStore.listProducts());
  }
  const filtered = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.hsnSac ?? "").includes(search));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input placeholder="Search products & services…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Button onClick={() => setEditing(emptyProduct())}><IPlus width={16} height={16}/> Add product</Button>
      </div>
      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-ink-500">
              <IFile />
              <div className="mt-2 font-medium text-ink-800 dark:text-ink-100">No products yet</div>
              <div className="text-sm">Save your catalog once — auto-suggest in every bill.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-ink-500 border-b border-ink-100 dark:border-ink-800">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4 hidden sm:table-cell">HSN/SAC</th>
                    <th className="text-left p-4 hidden md:table-cell">Unit</th>
                    <th className="text-right p-4">Rate</th>
                    <th className="text-right p-4 hidden sm:table-cell">GST</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0">
                      <td className="p-4">
                        <div className="font-medium text-ink-900 dark:text-ink-50">{p.name}</div>
                        {p.description ? <div className="text-xs text-ink-500 truncate max-w-xs">{p.description}</div> : null}
                      </td>
                      <td className="p-4 hidden sm:table-cell">{p.hsnSac ?? "—"}</td>
                      <td className="p-4 hidden md:table-cell">{p.unit ?? "—"}</td>
                      <td className="p-4 text-right">{formatINR(p.rate)}</td>
                      <td className="p-4 text-right hidden sm:table-cell">{p.gstRate ?? 0}%</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><IEdit width={14} height={14}/></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><ITrash width={14} height={14}/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {editing ? <ProductEditor product={editing} onCancel={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [p, setP] = useState<Product>(product);
  function set<K extends keyof Product>(k: K, v: Product[K]) { setP((prev) => ({ ...prev, [k]: v })); }
  return (
    <Modal open onClose={onCancel} title={p.name ? `Edit ${p.name}` : "Add product / service"} size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name *" value={p.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="Description" value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        <div>
          <Input label="HSN / SAC" value={p.hsnSac ?? ""} onChange={(e) => set("hsnSac", e.target.value)} hint="Type or pick from suggestions" list="hsn-list" />
          <datalist id="hsn-list">
            {HSN_STARTER.map((h) => <option key={h.code} value={h.code}>{h.description} · {h.gst}%</option>)}
          </datalist>
        </div>
        <Select label="Unit" value={p.unit ?? "NOS"} onChange={(e) => set("unit", e.target.value)}>
          {["NOS", "PCS", "KGS", "GMS", "LTR", "MTR", "BOX", "HRS", "DZN", "SET"].map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
        <Input label="Rate (₹) *" type="number" step="0.01" value={p.rate} onChange={(e) => set("rate", Number(e.target.value))} />
        <Select label="GST %" value={p.gstRate ?? 18} onChange={(e) => set("gstRate", Number(e.target.value))}>
          {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
        </Select>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(p)}>Save</Button>
      </div>
    </Modal>
  );
}
