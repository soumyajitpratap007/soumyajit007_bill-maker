"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { IPlus, IEye, IReceipt, ITrash } from "@/components/ui/Icon";
import { localStore } from "@/lib/store/local";
import { formatINR } from "@/lib/indian";
import { BILL_TYPE_LABELS, type Bill } from "@/lib/types";
import { computeBillTotals, isInterState } from "@/lib/indian/tax";

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => setBills(localStore.listBills()), []);

  function remove(id: string) {
    if (!confirm("Delete this bill?")) return;
    localStore.deleteBill(id);
    setBills(localStore.listBills());
  }
  const filtered = bills.filter((b) =>
    b.number.toLowerCase().includes(search.toLowerCase()) ||
    b.client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input placeholder="Search bills or client…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Link href="/bills/new"><Button><IPlus width={16} height={16}/> New bill</Button></Link>
      </div>
      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-ink-500">
              <IReceipt />
              <div className="mt-2 font-medium text-ink-800 dark:text-ink-100">No bills yet</div>
              <div className="text-sm">Your invoices, quotes and receipts will show up here.</div>
              <Link href="/bills/new" className="inline-block mt-3"><Button><IPlus width={16} height={16}/> Create bill</Button></Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((b) => {
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
                        <div className="font-medium truncate">{b.client.name || "Untitled"}</div>
                        <Badge tone="neutral">{BILL_TYPE_LABELS[b.type]}</Badge>
                        {b.status && b.status !== "draft" ? <Badge tone={b.status === "paid" ? "success" : b.status === "overdue" ? "danger" : "brand"}>{b.status}</Badge> : null}
                      </div>
                      <div className="text-xs text-ink-500 truncate">#{b.number} · {new Date(b.date).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="font-semibold">{formatINR(totals.grandTotal)}</div>
                      <div className="mt-1 flex justify-end gap-1">
                        <Link href={`/bills/${b.id}`}><Button variant="ghost" size="sm"><IEye width={14} height={14}/> Open</Button></Link>
                        <Button variant="ghost" size="sm" onClick={() => remove(b.id)}><ITrash width={14} height={14}/></Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
