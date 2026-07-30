"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IPlus, ITrash, IDownload, IShare, IWhatsapp, IMail, IEye, ICheck } from "@/components/ui/Icon";
import { localStore } from "@/lib/store/local";
import {
  BILL_TYPE_LABELS, BILL_TYPE_PREFIX,
  type Bill, type BillLineItem, type BillType, type Client, type Product, type TemplateId,
} from "@/lib/types";
import { INDIAN_STATES, GST_RATES, HSN_STARTER, isGstinValid, parseGstin } from "@/lib/indian";
import { formatINR } from "@/lib/indian/currency";
import { computeBillTotals, isInterState } from "@/lib/indian/tax";
import { BillRenderer, TEMPLATE_OPTIONS } from "./BillRenderer";
import { generatePdfBlob, downloadBlob } from "@/lib/pdf/exportPdf";
import { mailtoLink, shareViaWebShareApi, whatsappLink } from "@/lib/share/share";

function emptyItem(): BillLineItem {
  return { id: nanoid(8), name: "", quantity: 1, rate: 0, gstRate: 18, unit: "NOS", discountType: "flat" };
}

function defaultBill(business: Bill["business"], type: BillType = "gst_invoice"): Bill {
  const prefix = business.invoicePrefix || BILL_TYPE_PREFIX[type];
  const seq = business.nextInvoiceNumber ?? 1;
  const yr = new Date().getFullYear().toString().slice(-2);
  return {
    id: nanoid(12),
    shortId: nanoid(8),
    type,
    templateId: (business.defaultTemplate as TemplateId) ?? "classic",
    number: `${prefix}-${yr}${String(seq).padStart(4, "0")}`,
    date: new Date().toISOString().slice(0, 10),
    dueDate: undefined,
    business,
    client: { id: nanoid(8), name: "", billingAddress: { country: "India" }, shippingAddress: { country: "India" } },
    placeOfSupplyCode: business.address?.stateCode ?? "",
    items: [emptyItem()],
    extraDiscount: 0,
    extraDiscountType: "flat",
    shippingCharge: 0,
    roundOff: true,
    notes: "",
    terms: business.termsDefault ?? "",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function BillBuilder({ initialBill, mode = "edit" }: { initialBill?: Bill; mode?: "create" | "edit" }) {
  const router = useRouter();
  const { push } = useToast();
  const [bill, setBill] = useState<Bill>(() => {
    if (initialBill) return initialBill;
    const biz = localStore.getBusiness() ?? {
      id: "biz-1", name: "", invoicePrefix: "INV", nextInvoiceNumber: 1,
      currency: "INR", defaultTemplate: "classic", address: { country: "India" }, bank: {},
    };
    return defaultBill(biz);
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<null | "download" | "share" | "whatsapp" | "email">(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(localStore.listProducts());
    setClients(localStore.listClients());
  }, []);

  const interState = isInterState(bill.business?.address?.stateCode ?? "", bill.placeOfSupplyCode ?? "");
  const totals = useMemo(() => computeBillTotals(bill.items, {
    interState,
    extraDiscount: bill.extraDiscount, extraDiscountType: bill.extraDiscountType,
    shippingCharge: bill.shippingCharge, roundOff: bill.roundOff,
  }), [bill.items, interState, bill.extraDiscount, bill.extraDiscountType, bill.shippingCharge, bill.roundOff]);

  function set<K extends keyof Bill>(k: K, v: Bill[K]) { setBill((b) => ({ ...b, [k]: v, updatedAt: new Date().toISOString() })); }
  function setClient(patch: Partial<Client>) { setBill((b) => ({ ...b, client: { ...b.client, ...patch } })); }
  function setClientAddr(kind: "billing" | "shipping", k: string, v: string) {
    setBill((b) => ({
      ...b,
      client: {
        ...b.client,
        [kind === "billing" ? "billingAddress" : "shippingAddress"]: {
          ...(kind === "billing" ? b.client.billingAddress : b.client.shippingAddress),
          [k]: v,
        },
      },
    }));
  }
  function updateItem(id: string, patch: Partial<BillLineItem>) {
    setBill((b) => ({ ...b, items: b.items.map((it) => it.id === id ? { ...it, ...patch } : it) }));
  }
  function addItem() { setBill((b) => ({ ...b, items: [...b.items, emptyItem()] })); }
  function removeItem(id: string) { setBill((b) => ({ ...b, items: b.items.length > 1 ? b.items.filter((it) => it.id !== id) : b.items })); }

  function pickClient(c: Client) {
    setBill((b) => ({ ...b, client: { ...c }, placeOfSupplyCode: c.billingAddress?.stateCode || b.placeOfSupplyCode }));
    setClientPickerOpen(false);
  }

  function pickProductForRow(rowId: string, p: Product) {
    updateItem(rowId, {
      productId: p.id, name: p.name, description: p.description,
      hsnSac: p.hsnSac, unit: p.unit, rate: p.rate, gstRate: p.gstRate,
    });
  }

  function onClientGstinBlur() {
    if (!bill.client.gstin) return;
    const parsed = parseGstin(bill.client.gstin);
    if (parsed?.state && !bill.client.billingAddress?.stateCode) {
      setClientAddr("billing", "stateCode", parsed.stateCode);
      setClientAddr("billing", "stateName", parsed.state.name);
      set("placeOfSupplyCode", parsed.stateCode);
    }
  }

  function save(): Bill {
    setSaving(true);
    const toSave = { ...bill, updatedAt: new Date().toISOString() };
    localStore.upsertBill(toSave);
    // If it's a new bill, bump invoice number on business
    if (mode === "create") {
      const biz = localStore.getBusiness();
      if (biz) localStore.saveBusiness({ ...biz, nextInvoiceNumber: (biz.nextInvoiceNumber ?? 1) + 1 });
    }
    setSaving(false);
    push({ message: "Bill saved", tone: "success" });
    return toSave;
  }

  function saveAndOpen() {
    const s = save();
    if (mode === "create") router.replace(`/bills/${s.id}`);
  }

  function saveClientToBook() {
    if (!bill.client.name) { push({ message: "Add a client name first", tone: "error" }); return; }
    localStore.upsertClient({ ...bill.client, id: bill.client.id || nanoid(8) });
    setClients(localStore.listClients());
    push({ message: "Client saved to your address book", tone: "success" });
  }

  async function renderPdf(): Promise<Blob | null> {
    if (!previewRef.current) return null;
    return generatePdfBlob(previewRef.current, { fileName: `${bill.number}.pdf` });
  }

  async function onDownload() {
    setExporting("download");
    save();
    const blob = await renderPdf();
    if (blob) downloadBlob(blob, `${bill.number}.pdf`);
    setExporting(null);
  }

  async function onWebShare() {
    setExporting("share");
    save();
    const blob = await renderPdf();
    if (!blob) { setExporting(null); return; }
    const ok = await shareViaWebShareApi(bill, blob, publicShareUrl(bill));
    if (!ok) push({ message: "Share cancelled or not supported. Downloading instead.", tone: "info" }), downloadBlob(blob, `${bill.number}.pdf`);
    setExporting(null);
  }

  async function onWhatsapp() {
    setExporting("whatsapp");
    save();
    const blob = await renderPdf();
    if (blob) downloadBlob(blob, `${bill.number}.pdf`);
    // Try Web Share first for direct WhatsApp attachment (mobile)
    if (blob && typeof navigator !== "undefined" && "share" in navigator) {
      await shareViaWebShareApi(bill, blob, publicShareUrl(bill));
    }
    window.open(whatsappLink(bill, publicShareUrl(bill)), "_blank");
    setExporting(null);
  }

  async function onEmail() {
    setExporting("email");
    save();
    const blob = await renderPdf();
    if (blob) downloadBlob(blob, `${bill.number}.pdf`);
    window.location.href = mailtoLink(bill, publicShareUrl(bill));
    setExporting(null);
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,900px)] gap-6">
      {/* Left column: form */}
      <div className="space-y-5 min-w-0">
        {/* Meta */}
        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Bill details</h3>
              <p className="text-sm text-ink-500">Choose document type, number and date.</p>
            </div>
          </div>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Select label="Document type" value={bill.type} onChange={(e) => set("type", e.target.value as BillType)}>
              {Object.entries(BILL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Input label={`${BILL_TYPE_LABELS[bill.type]} number`} value={bill.number} onChange={(e) => set("number", e.target.value)} />
            <Input label="Date" type="date" value={bill.date} onChange={(e) => set("date", e.target.value)} />
            {(bill.type === "gst_invoice" || bill.type === "bill_of_supply" || bill.type === "proforma" || bill.type === "quotation") ? (
              <Input label="Due date" type="date" value={bill.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
            ) : null}
            {(bill.type === "delivery_challan" || bill.type === "purchase_order") ? (
              <Input label="Reference" value={bill.reference ?? ""} onChange={(e) => set("reference", e.target.value)} placeholder="PO / Order ref" />
            ) : null}
            <Select label="Template" value={bill.templateId} onChange={(e) => set("templateId", e.target.value as TemplateId)}>
              {TEMPLATE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </CardBody>
        </Card>

        {/* Client */}
        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Client</h3>
              <p className="text-sm text-ink-500">Pick a saved client, or fill new details.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setClientPickerOpen(true)}>Pick from book</Button>
              <Button variant="ghost" size="sm" onClick={saveClientToBook}>Save to book</Button>
            </div>
          </div>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Client name *" value={bill.client.name} onChange={(e) => setClient({ name: e.target.value })} />
            <Input label="GSTIN" value={bill.client.gstin ?? ""} onChange={(e) => setClient({ gstin: e.target.value.toUpperCase() })} onBlur={onClientGstinBlur} />
            <Input label="Phone" value={bill.client.phone ?? ""} onChange={(e) => setClient({ phone: e.target.value })} placeholder="+91 …" />
            <Input label="Email" value={bill.client.email ?? ""} onChange={(e) => setClient({ email: e.target.value })} type="email" />
            <Input label="Billing address" value={bill.client.billingAddress?.line1 ?? ""} onChange={(e) => setClientAddr("billing", "line1", e.target.value)} />
            <Input label="City" value={bill.client.billingAddress?.city ?? ""} onChange={(e) => setClientAddr("billing", "city", e.target.value)} />
            <Select label="Client state" value={bill.client.billingAddress?.stateCode ?? ""} onChange={(e) => {
              const s = INDIAN_STATES.find((x) => x.code === e.target.value);
              setClientAddr("billing", "stateCode", e.target.value);
              setClientAddr("billing", "stateName", s?.name ?? "");
              set("placeOfSupplyCode", e.target.value);
            }}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
            <Input label="Pincode" value={bill.client.billingAddress?.pincode ?? ""} onChange={(e) => setClientAddr("billing", "pincode", e.target.value)} />
          </CardBody>
          <div className="px-5 pb-4 -mt-2 text-[11px] text-ink-500">
            {interState ? (
              <span className="inline-flex items-center gap-1 text-amber-700"><ICheck width={12} height={12}/> Inter-state supply → IGST will apply.</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-700"><ICheck width={12} height={12}/> Intra-state supply → CGST + SGST will apply.</span>
            )}
          </div>
        </Card>

        {/* Items */}
        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
            <div><h3 className="font-semibold">Items</h3><p className="text-sm text-ink-500">Add products, services or notes.</p></div>
            <Button size="sm" onClick={addItem}><IPlus width={16} height={16}/> Add row</Button>
          </div>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 dark:bg-ink-900 text-[11px] uppercase text-ink-500">
                  <tr>
                    <th className="text-left p-2 sm:p-3">Item</th>
                    <th className="text-left p-2 sm:p-3 w-24">HSN/SAC</th>
                    <th className="text-right p-2 sm:p-3 w-20">Qty</th>
                    <th className="text-right p-2 sm:p-3 w-24">Rate</th>
                    <th className="text-right p-2 sm:p-3 w-16">GST</th>
                    <th className="text-right p-2 sm:p-3 w-24">Amount</th>
                    <th className="p-2 sm:p-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((it) => (
                    <tr key={it.id} className="border-t border-ink-100 dark:border-ink-800 align-top">
                      <td className="p-2 sm:p-3">
                        <input
                          className="w-full bg-transparent outline-none font-medium placeholder:text-ink-400"
                          placeholder="Item / service"
                          value={it.name}
                          onChange={(e) => updateItem(it.id, { name: e.target.value })}
                          list={`prod-${it.id}`}
                          onBlur={(e) => {
                            const p = products.find((x) => x.name.toLowerCase() === e.target.value.toLowerCase());
                            if (p) pickProductForRow(it.id, p);
                          }}
                        />
                        <datalist id={`prod-${it.id}`}>
                          {products.map((p) => <option key={p.id} value={p.name}>{formatINR(p.rate)} · {p.gstRate}%</option>)}
                        </datalist>
                        <input
                          className="w-full mt-1 bg-transparent outline-none text-[11px] text-ink-500 placeholder:text-ink-400"
                          placeholder="Description (optional)"
                          value={it.description ?? ""}
                          onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          className="w-24 bg-transparent outline-none text-sm"
                          value={it.hsnSac ?? ""}
                          onChange={(e) => updateItem(it.id, { hsnSac: e.target.value })}
                          list={`hsn-${it.id}`}
                          placeholder="HSN"
                        />
                        <datalist id={`hsn-${it.id}`}>
                          {HSN_STARTER.map((h) => <option key={h.code} value={h.code}>{h.description}</option>)}
                        </datalist>
                      </td>
                      <td className="p-2 sm:p-3">
                        <input type="number" step="0.01" className="w-20 text-right bg-transparent outline-none" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })} />
                        <div className="text-[10px] text-ink-400 text-right">{it.unit ?? "NOS"}</div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <input type="number" step="0.01" className="w-24 text-right bg-transparent outline-none" value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} />
                      </td>
                      <td className="p-2 sm:p-3">
                        <select className="w-16 bg-transparent outline-none text-right text-sm" value={it.gstRate ?? 18} onChange={(e) => updateItem(it.id, { gstRate: Number(e.target.value) })}>
                          {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="p-2 sm:p-3 text-right font-medium">{formatINR(it.quantity * it.rate)}</td>
                      <td className="p-2 sm:p-3 text-right">
                        <button className="text-ink-400 hover:text-red-600" onClick={() => removeItem(it.id)} aria-label="Remove"><ITrash width={16} height={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-ink-100 dark:border-ink-800">
              <Button variant="outline" size="sm" onClick={addItem}><IPlus width={14} height={14}/> Add another item</Button>
            </div>
          </CardBody>
        </Card>

        {/* Charges & totals */}
        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Charges & totals</h3></div>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Shipping charge (₹)" type="number" step="0.01" value={bill.shippingCharge ?? 0} onChange={(e) => set("shippingCharge", Number(e.target.value))} />
            <div className="grid grid-cols-[1fr_120px] gap-2 items-end">
              <Input label="Extra discount" type="number" step="0.01" value={bill.extraDiscount ?? 0} onChange={(e) => set("extraDiscount", Number(e.target.value))} />
              <Select label="Type" value={bill.extraDiscountType ?? "flat"} onChange={(e) => set("extraDiscountType", e.target.value as "flat" | "percent")}>
                <option value="flat">₹ Flat</option>
                <option value="percent">% Percent</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 mt-1 text-sm sm:col-span-2">
              <input type="checkbox" checked={!!bill.roundOff} onChange={(e) => set("roundOff", e.target.checked)} className="h-4 w-4"/>
              Round off grand total
            </label>

            <div className="sm:col-span-2 mt-2 rounded-xl bg-ink-50 dark:bg-ink-900 p-4 grid grid-cols-2 gap-y-1 text-sm">
              <span className="text-ink-500">Sub-total</span><span className="text-right">{formatINR(totals.subtotal)}</span>
              {!interState ? <>
                <span className="text-ink-500">CGST</span><span className="text-right">{formatINR(totals.totalCgst)}</span>
                <span className="text-ink-500">SGST</span><span className="text-right">{formatINR(totals.totalSgst)}</span>
              </> : <>
                <span className="text-ink-500">IGST</span><span className="text-right">{formatINR(totals.totalIgst)}</span>
              </>}
              {totals.totalCess ? <><span className="text-ink-500">Cess</span><span className="text-right">{formatINR(totals.totalCess)}</span></> : null}
              {bill.shippingCharge ? <><span className="text-ink-500">Shipping</span><span className="text-right">{formatINR(bill.shippingCharge)}</span></> : null}
              {totals.extraDiscount ? <><span className="text-ink-500">Extra discount</span><span className="text-right">-{formatINR(totals.extraDiscount)}</span></> : null}
              {totals.roundOff ? <><span className="text-ink-500">Round off</span><span className="text-right">{formatINR(totals.roundOff)}</span></> : null}
              <span className="text-base font-semibold text-ink-900 dark:text-ink-50 border-t border-ink-200 pt-2 mt-2">Grand total</span>
              <span className="text-base font-semibold text-brand-700 border-t border-ink-200 pt-2 mt-2 text-right">{formatINR(totals.grandTotal)}</span>
            </div>
          </CardBody>
        </Card>

        {/* Notes & terms */}
        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Notes & terms</h3></div>
          <CardBody className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Notes</label>
              <textarea className="mt-1.5 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-3 text-sm outline-none focus:border-brand-500" rows={2} value={bill.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Thanks for your business!"/>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Terms & conditions</label>
              <textarea className="mt-1.5 w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-3 text-sm outline-none focus:border-brand-500" rows={2} value={bill.terms ?? ""} onChange={(e) => set("terms", e.target.value)} placeholder="Payment within 15 days…"/>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right column: preview + actions */}
      <div className="space-y-4 min-w-0">
        <Card className="sticky top-16">
          <div className="p-4 border-b border-ink-100 dark:border-ink-800 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={saveAndOpen} loading={saving}>{mode === "create" ? "Save draft" : "Save"}</Button>
            <Button size="sm" variant="outline" onClick={onDownload} loading={exporting === "download"}><IDownload width={14} height={14}/> PDF</Button>
            <Button size="sm" variant="outline" onClick={onWebShare} loading={exporting === "share"}><IShare width={14} height={14}/> Share</Button>
            <Button size="sm" variant="outline" onClick={onWhatsapp} loading={exporting === "whatsapp"}><IWhatsapp width={14} height={14}/> WhatsApp</Button>
            <Button size="sm" variant="outline" onClick={onEmail} loading={exporting === "email"}><IMail width={14} height={14}/> Email</Button>
            <a href={publicShareUrl(bill)} target="_blank" rel="noopener noreferrer" className="ml-auto">
              <Button size="sm" variant="ghost"><IEye width={14} height={14}/> Public link</Button>
            </a>
          </div>
          <Tabs defaultValue="preview" className="p-4">
            <TabsList>
              <TabsTrigger value="preview">Live preview</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <div className="rounded-xl bg-ink-100 dark:bg-ink-900 p-4 overflow-x-auto">
                <div className="mx-auto shadow-card" style={{ width: 794 }}>
                  <BillRenderer bill={bill} ref={previewRef} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="template" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATE_OPTIONS.map((t) => {
                  const active = bill.templateId === t.id;
                  return (
                    <button key={t.id} onClick={() => set("templateId", t.id)} className={`text-left rounded-2xl border p-3 transition-all ${active ? "border-brand-500 ring-4 ring-brand-500/20" : "border-ink-200 hover:border-ink-400"}`}>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white border border-ink-200">
                        <div className="h-8" style={{ backgroundColor: t.accent }}/>
                        <div className="p-2 space-y-1">
                          <div className="h-1.5 bg-ink-100 rounded w-2/3"/>
                          <div className="h-1.5 bg-ink-100 rounded w-1/2"/>
                          <div className="h-1.5 bg-ink-100 rounded w-full mt-2"/>
                          <div className="h-1.5 bg-ink-100 rounded w-3/4"/>
                          <div className="h-1.5 bg-ink-100 rounded w-2/3"/>
                          <div className="mt-2 h-4 rounded" style={{ backgroundColor: t.accent + "22" }}/>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{t.name}</span>
                        {active ? <span className="text-brand-600 text-xs inline-flex items-center gap-1"><ICheck width={12} height={12}/> Selected</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Client picker */}
      {clientPickerOpen ? (
        <Modal open onClose={() => setClientPickerOpen(false)} title="Pick a client" size="md">
          {clients.length === 0 ? (
            <div className="text-sm text-ink-500">No saved clients yet. Fill the client form and hit &ldquo;Save to book&rdquo; to store them.</div>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800 max-h-80 overflow-auto">
              {clients.map((c) => (
                <li key={c.id}>
                  <button onClick={() => pickClient(c)} className="w-full text-left py-3 px-2 hover:bg-ink-50 dark:hover:bg-ink-800 rounded-lg">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-ink-500">{[c.gstin, c.phone, c.email].filter(Boolean).join(" · ")}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

function publicShareUrl(bill: Bill): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/b/${bill.shortId ?? bill.id}`;
}
