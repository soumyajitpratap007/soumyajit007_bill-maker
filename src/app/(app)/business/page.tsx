"use client";
import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { localStore } from "@/lib/store/local";
import { INDIAN_STATES, isGstinValid, parseGstin } from "@/lib/indian";
import type { BusinessProfile } from "@/lib/types";

const EMPTY: BusinessProfile = {
  id: "biz-1",
  name: "",
  gstin: "",
  domain: "retail",
  invoicePrefix: "INV",
  nextInvoiceNumber: 1,
  currency: "INR",
  defaultTemplate: "classic",
  address: { country: "India" },
  bank: {},
};

export default function BusinessPage() {
  const [b, setB] = useState<BusinessProfile>(EMPTY);
  const { push } = useToast();

  useEffect(() => {
    const saved = localStore.getBusiness();
    if (saved) setB(saved);
  }, []);

  function set<K extends keyof BusinessProfile>(k: K, v: BusinessProfile[K]) {
    setB((prev) => ({ ...prev, [k]: v }));
  }
  function setAddress(k: string, v: string) {
    setB((prev) => ({ ...prev, address: { ...prev.address, [k]: v } }));
  }
  function setBank(k: string, v: string) {
    setB((prev) => ({ ...prev, bank: { ...prev.bank, [k]: v } }));
  }

  function onGstinBlur() {
    if (!b.gstin) return;
    const parsed = parseGstin(b.gstin);
    if (parsed?.state && !b.address?.stateCode) {
      setB((prev) => ({ ...prev, address: { ...prev.address, stateName: parsed.state?.name, stateCode: parsed.stateCode } }));
    }
  }

  function onSave() {
    if (!b.name.trim()) { push({ message: "Business name is required", tone: "error" }); return; }
    if (b.gstin && !isGstinValid(b.gstin)) {
      push({ message: "GSTIN format looks off — please recheck.", tone: "error" });
      return;
    }
    localStore.saveBusiness(b);
    push({ message: "Business saved", tone: "success" });
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logoUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSignature(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("signatureUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <div className="p-5 border-b border-ink-100 dark:border-ink-800">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Business identity</h2>
          <p className="text-sm text-ink-500">Appears on every bill you generate.</p>
        </div>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name *" value={b.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chaayos Cafe" />
          <Input label="Legal name" value={b.legalName ?? ""} onChange={(e) => set("legalName", e.target.value)} placeholder="Registered name (optional)" />
          <Input label="GSTIN" value={b.gstin ?? ""} onChange={(e) => set("gstin", e.target.value.toUpperCase())} onBlur={onGstinBlur} placeholder="27ABCDE1234F1Z5" hint="Format: 15 chars — leave blank if unregistered" />
          <Input label="PAN" value={b.pan ?? ""} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
          <Select label="Business domain" value={b.domain ?? "retail"} onChange={(e) => set("domain", e.target.value as BusinessProfile["domain"])}>
            {["retail","manufacturing","wholesale","services","restaurant","freelance","ecommerce","construction","healthcare","education","other"].map((d) => (
              <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>
            ))}
          </Select>
          <Input label="Phone" value={b.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
          <Input label="Email" value={b.email ?? ""} onChange={(e) => set("email", e.target.value)} type="email" />
          <Input label="Website" value={b.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
        </CardBody>
      </Card>

      <Card>
        <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Address</h3></div>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Address line 1" value={b.address?.line1 ?? ""} onChange={(e) => setAddress("line1", e.target.value)} />
          <Input label="Address line 2" value={b.address?.line2 ?? ""} onChange={(e) => setAddress("line2", e.target.value)} />
          <Input label="City" value={b.address?.city ?? ""} onChange={(e) => setAddress("city", e.target.value)} />
          <Select label="State" value={b.address?.stateCode ?? ""} onChange={(e) => {
            const s = INDIAN_STATES.find((x) => x.code === e.target.value);
            setAddress("stateCode", e.target.value);
            setAddress("stateName", s?.name ?? "");
          }}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </Select>
          <Input label="Pincode" value={b.address?.pincode ?? ""} onChange={(e) => setAddress("pincode", e.target.value)} />
          <Input label="Country" value={b.address?.country ?? "India"} onChange={(e) => setAddress("country", e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Bank details (optional)</h3></div>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Bank name" value={b.bank?.bankName ?? ""} onChange={(e) => setBank("bankName", e.target.value)} />
          <Input label="Account holder" value={b.bank?.accountName ?? ""} onChange={(e) => setBank("accountName", e.target.value)} />
          <Input label="Account number" value={b.bank?.accountNumber ?? ""} onChange={(e) => setBank("accountNumber", e.target.value)} />
          <Input label="IFSC" value={b.bank?.ifsc ?? ""} onChange={(e) => setBank("ifsc", e.target.value.toUpperCase())} />
          <Input label="Branch" value={b.bank?.branch ?? ""} onChange={(e) => setBank("branch", e.target.value)} />
          <Input label="UPI ID" value={b.bank?.upiId ?? ""} onChange={(e) => setBank("upiId", e.target.value)} placeholder="yourname@upi" />
        </CardBody>
      </Card>

      <Card>
        <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Branding & defaults</h3></div>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Logo</label>
            <div className="mt-1.5 flex items-center gap-4">
              {b.logoUrl ? <img src={b.logoUrl} alt="Logo" className="h-16 w-16 rounded-xl object-contain bg-white border border-ink-200"/> : <div className="h-16 w-16 rounded-xl bg-ink-100 border border-ink-200 grid place-items-center text-xs text-ink-400">No logo</div>}
              <input type="file" accept="image/*" onChange={onLogo} className="text-xs" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Signature</label>
            <div className="mt-1.5 flex items-center gap-4">
              {b.signatureUrl ? <img src={b.signatureUrl} alt="Sign" className="h-16 w-32 object-contain bg-white border border-ink-200 rounded-xl"/> : <div className="h-16 w-32 rounded-xl bg-ink-100 border border-ink-200 grid place-items-center text-xs text-ink-400">No signature</div>}
              <input type="file" accept="image/*" onChange={onSignature} className="text-xs" />
            </div>
          </div>
          <Input label="Invoice prefix" value={b.invoicePrefix ?? "INV"} onChange={(e) => set("invoicePrefix", e.target.value.toUpperCase())} />
          <Input label="Next invoice number" type="number" value={b.nextInvoiceNumber ?? 1} onChange={(e) => set("nextInvoiceNumber", Number(e.target.value))} />
          <Select label="Default template" value={b.defaultTemplate ?? "classic"} onChange={(e) => set("defaultTemplate", e.target.value as BusinessProfile["defaultTemplate"])}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="corporate">Corporate</option>
            <option value="gst_compact">GST Compact</option>
          </Select>
          <Input label="Default terms" value={b.termsDefault ?? ""} onChange={(e) => set("termsDefault", e.target.value)} placeholder="Payment within 15 days…" />
        </CardBody>
      </Card>

      <div className="sticky bottom-16 lg:bottom-4 z-10 flex justify-end">
        <Button size="lg" onClick={onSave}>Save business profile</Button>
      </div>
    </div>
  );
}
