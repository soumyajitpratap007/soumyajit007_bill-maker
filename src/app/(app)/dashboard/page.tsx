"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IPlus, IReceipt, IUser, IBriefcase, IEye, IDownload } from "@/components/ui/Icon";
import { localStore } from "@/lib/store/local";
import { formatCompactINR, formatINR } from "@/lib/indian";
import { BILL_TYPE_LABELS, type Bill } from "@/lib/types";
import { computeBillTotals, isInterState } from "@/lib/indian/tax";

export default function DashboardPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    setBills(localStore.listBills());
    setClientCount(localStore.listClients().length);
    setProductCount(localStore.listProducts().length);
    setHasBusiness(!!localStore.getBusiness());
  }, []);

  const stats = useMemo(() => {
    let month = 0, total = 0, paid = 0;
    const now = new Date();
    for (const b of bills) {
      const totals = computeBillTotals(b.items, {
        interState: isInterState(b.business?.address?.stateCode ?? "", b.placeOfSupplyCode ?? ""),
        extraDiscount: b.extraDiscount,
        extraDiscountType: b.extraDiscountType,
        shippingCharge: b.shippingCharge,
        roundOff: b.roundOff,
      });
      total += totals.grandTotal;
      if (b.status === "paid") paid += totals.grandTotal;
      const d = new Date(b.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += totals.grandTotal;
    }
    return { month, total, paid, count: bills.length };
  }, [bills]);

  return (
    <div className="space-y-6">
      {!hasBusiness ? (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="font-semibold text-amber-900 dark:text-amber-200">Set up your business profile first.</div>
              <div className="text-sm text-amber-800/80 dark:text-amber-300/80">Your business name, GSTIN, logo and bank details appear on every bill.</div>
            </div>
            <Link href="/business"><Button variant="secondary">Set up now →</Button></Link>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value={formatINR(stats.month)} tone="brand" />
        <StatCard label="Lifetime billed" value={formatCompactINR(stats.total)} />
        <StatCard label="Received" value={formatCompactINR(stats.paid)} tone="success" />
        <StatCard label="Total bills" value={String(stats.count)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-5 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
            <h3 className="font-semibold">Recent bills</h3>
            <Link href="/bills"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          <CardBody className="p-0">
            {bills.length === 0 ? (
              <EmptyState
                icon={<IReceipt />}
                title="No bills yet"
                description="Create your first invoice — it takes about 30 seconds."
                cta={<Link href="/bills/new"><Button><IPlus width={16} height={16}/> Create bill</Button></Link>}
              />
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {bills.slice(0, 8).map((b) => {
                  const totals = computeBillTotals(b.items, {
                    interState: isInterState(b.business?.address?.stateCode ?? "", b.placeOfSupplyCode ?? ""),
                    extraDiscount: b.extraDiscount, extraDiscountType: b.extraDiscountType,
                    shippingCharge: b.shippingCharge, roundOff: b.roundOff,
                  });
                  return (
                    <li key={b.id} className="p-4 sm:p-5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0"><IReceipt/></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-medium text-ink-900 dark:text-ink-50 truncate">{b.client.name || "Untitled client"}</div>
                          <Badge tone="neutral">{BILL_TYPE_LABELS[b.type]}</Badge>
                          {b.status && b.status !== "draft" ? <Badge tone={b.status === "paid" ? "success" : b.status === "overdue" ? "danger" : "brand"}>{b.status}</Badge> : null}
                        </div>
                        <div className="text-xs text-ink-500 truncate">#{b.number} · {new Date(b.date).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-ink-900 dark:text-ink-50">{formatINR(totals.grandTotal)}</div>
                        <div className="flex gap-1 justify-end mt-1">
                          <Link href={`/bills/${b.id}`}><Button variant="ghost" size="sm"><IEye width={14} height={14}/> Open</Button></Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="p-5 border-b border-ink-100 dark:border-ink-800"><h3 className="font-semibold">Quick actions</h3></div>
          <CardBody className="space-y-2">
            <Link href="/bills/new" className="block"><Button variant="primary" className="w-full justify-start"><IPlus width={16} height={16}/> New bill</Button></Link>
            <Link href="/clients" className="block"><Button variant="outline" className="w-full justify-start"><IUser width={16} height={16}/> Add client ({clientCount})</Button></Link>
            <Link href="/products" className="block"><Button variant="outline" className="w-full justify-start"><IDownload width={16} height={16}/> Manage products ({productCount})</Button></Link>
            <Link href="/business" className="block"><Button variant="outline" className="w-full justify-start"><IBriefcase width={16} height={16}/> Edit business</Button></Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "brand" | "success" }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${tone === "brand" ? "text-brand-700" : tone === "success" ? "text-emerald-700" : "text-ink-900 dark:text-ink-50"}`}>
          {value}
        </div>
      </CardBody>
    </Card>
  );
}

function EmptyState({ icon, title, description, cta }: { icon: React.ReactNode; title: string; description: string; cta?: React.ReactNode }) {
  return (
    <div className="p-10 flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center">{icon}</div>
      <div className="font-semibold text-ink-900 dark:text-ink-50">{title}</div>
      <p className="text-sm text-ink-500 max-w-sm">{description}</p>
      {cta}
    </div>
  );
}
