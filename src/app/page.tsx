import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ICheck, IDownload, IReceipt, IShare, ISparkle, IWhatsapp } from "@/components/ui/Icon";
import { BILL_TYPE_LABELS } from "@/lib/types";

const FEATURES = [
  {
    icon: <IReceipt />,
    title: "Every bill India needs",
    text: "GST Tax Invoice, Bill of Supply, Proforma, Quotation, Receipt, Delivery Challan and PO — one builder.",
  },
  {
    icon: <ISparkle />,
    title: "5 beautiful templates",
    text: "Classic, Modern, Minimal, Corporate and GST-Compact. Live preview, one-click switch.",
  },
  {
    icon: <IDownload />,
    title: "Instant PDF on-device",
    text: "Client-side generation. No wait, no server round-trip. Works offline as a PWA.",
  },
  {
    icon: <IWhatsapp />,
    title: "WhatsApp & Email share",
    text: "Send the PDF to your client with one tap on mobile. Prefilled message and number.",
  },
  {
    icon: <ICheck />,
    title: "GST-correct out of the box",
    text: "GSTIN validation, place-of-supply CGST/SGST vs IGST, HSN/SAC, amount in words.",
  },
  {
    icon: <IShare />,
    title: "Shareable public link",
    text: "Every bill has a view-only URL. Client opens it in a browser — nothing to install.",
  },
];

const TEMPLATES = [
  { id: "classic", name: "Classic", color: "#1e3a8a" },
  { id: "modern", name: "Modern", color: "#0f766e" },
  { id: "minimal", name: "Minimal", color: "#334155" },
  { id: "corporate", name: "Corporate", color: "#7c2d12" },
  { id: "gst_compact", name: "GST Compact", color: "#4c1d95" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-brand-50/40 to-white dark:from-ink-950 dark:to-ink-950">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-900/30" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20" />
        </div>
        <Container className="py-14 sm:py-20 lg:py-24 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <Badge tone="brand" className="w-fit">🇮🇳 India-first · GST-ready · Free forever</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              Bills your customers <span className="text-brand-600">actually admire.</span>
            </h1>
            <p className="text-lg text-ink-600 dark:text-ink-300 max-w-xl">
              Create GST invoices, quotations, receipts, delivery challans and POs — download as PDF or share on WhatsApp in a single tap. Built for chai-tapris, freelancers and factories alike.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/bills/new"><Button size="lg">Create your first bill →</Button></Link>
              <Link href="/#templates"><Button variant="outline" size="lg">See templates</Button></Link>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1"><ICheck width={14} height={14}/> No signup needed to try</span>
              <span className="inline-flex items-center gap-1"><ICheck width={14} height={14}/> Works offline</span>
              <span className="inline-flex items-center gap-1"><ICheck width={14} height={14}/> Install on your phone</span>
            </div>
          </div>

          {/* Sample bill preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
            <Card className="relative rotate-[-1.5deg] hover:rotate-0 transition-transform">
              <CardBody className="p-6">
                <div className="flex items-start justify-between border-b border-ink-100 pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-brand-600 font-semibold">Tax Invoice</div>
                    <div className="mt-1 text-2xl font-bold text-ink-900">Chaayos Cafe</div>
                    <div className="text-xs text-ink-500">GSTIN 07AAACC1234A1Z5</div>
                  </div>
                  <div className="text-right text-xs text-ink-500">
                    <div>Invoice #INV-2026-0421</div>
                    <div>29 Jul 2026</div>
                  </div>
                </div>
                <table className="w-full mt-4 text-sm">
                  <thead className="text-xs text-ink-500 border-b border-ink-100">
                    <tr><th className="text-left py-2">Item</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amt</th></tr>
                  </thead>
                  <tbody className="text-ink-800">
                    <tr className="border-b border-ink-50"><td className="py-2">Masala Chai</td><td className="text-right">3</td><td className="text-right">₹80</td><td className="text-right">₹240</td></tr>
                    <tr className="border-b border-ink-50"><td className="py-2">Veg Sandwich</td><td className="text-right">2</td><td className="text-right">₹150</td><td className="text-right">₹300</td></tr>
                    <tr><td className="py-2">Cheesecake slice</td><td className="text-right">1</td><td className="text-right">₹220</td><td className="text-right">₹220</td></tr>
                  </tbody>
                </table>
                <div className="mt-3 border-t border-ink-100 pt-3 grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-ink-500">Sub-total</span><span className="text-right text-ink-800">₹760.00</span>
                  <span className="text-ink-500">CGST 2.5%</span><span className="text-right text-ink-800">₹19.00</span>
                  <span className="text-ink-500">SGST 2.5%</span><span className="text-right text-ink-800">₹19.00</span>
                  <span className="font-semibold text-ink-900">Grand Total</span><span className="text-right font-semibold text-brand-700">₹798.00</span>
                </div>
                <div className="mt-3 text-[10px] text-ink-500 italic">
                  Rupees Seven Hundred Ninety Eight Only
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <Container>
          <div className="max-w-2xl mb-10">
            <div className="text-sm font-medium text-brand-600 uppercase tracking-wider">Features</div>
            <h2 className="text-3xl sm:text-4xl font-semibold mt-2 text-ink-900 dark:text-ink-50">Everything a billing tool should be. Nothing it shouldn&rsquo;t.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardBody className="flex flex-col gap-3">
                  <div className="h-10 w-10 grid place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {f.icon}
                  </div>
                  <div className="font-semibold text-ink-900 dark:text-ink-50">{f.title}</div>
                  <p className="text-sm text-ink-600 dark:text-ink-300">{f.text}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Bill types */}
      <section className="py-16 bg-ink-50/60 dark:bg-ink-900/40 border-y border-ink-100 dark:border-ink-800">
        <Container>
          <div className="max-w-2xl mb-8">
            <div className="text-sm font-medium text-brand-600 uppercase tracking-wider">Document types</div>
            <h2 className="text-3xl sm:text-4xl font-semibold mt-2 text-ink-900 dark:text-ink-50">One builder. Every Indian document.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(BILL_TYPE_LABELS).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-4 py-3 flex items-center gap-3">
                <span className="h-8 w-8 grid place-items-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <IReceipt width={16} height={16}/>
                </span>
                <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{v}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Templates */}
      <section id="templates" className="py-16">
        <Container>
          <div className="max-w-2xl mb-10">
            <div className="text-sm font-medium text-brand-600 uppercase tracking-wider">Templates</div>
            <h2 className="text-3xl sm:text-4xl font-semibold mt-2 text-ink-900 dark:text-ink-50">Five looks. Pick, preview, print.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="group">
                <div className="aspect-[3/4] rounded-2xl border border-ink-200 dark:border-ink-800 bg-white overflow-hidden shadow-soft group-hover:shadow-card transition-shadow">
                  <div className="h-16 flex items-end p-3" style={{ backgroundColor: t.color }}>
                    <div className="text-white text-xs uppercase tracking-wider">Invoice</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-ink-100 rounded w-2/3" />
                    <div className="h-2 bg-ink-100 rounded w-1/2" />
                    <div className="h-2 bg-ink-100 rounded w-full mt-3" />
                    <div className="h-2 bg-ink-100 rounded w-4/5" />
                    <div className="h-2 bg-ink-100 rounded w-3/5" />
                    <div className="mt-4 h-8 rounded" style={{ backgroundColor: t.color + "22" }} />
                  </div>
                </div>
                <div className="mt-3 text-sm font-medium text-ink-800 dark:text-ink-100">{t.name}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="rounded-3xl bg-ink-900 dark:bg-brand-950 text-white p-10 sm:p-14 flex flex-col items-center text-center gap-5 shadow-card">
            <h2 className="text-3xl sm:text-4xl font-semibold">Ready in 30 seconds. Free forever.</h2>
            <p className="text-ink-300 max-w-xl">No credit card. No email needed to try. Save your business once — every future bill takes 15 seconds.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/bills/new"><Button size="lg" variant="primary">Create your first bill</Button></Link>
              <Link href="/signup"><Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 dark:text-white">Sign up to sync</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
}
