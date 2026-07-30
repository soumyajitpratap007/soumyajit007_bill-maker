import type { TemplateProps } from "./types";
import { AmountInWordsRow, billDocumentTitle, formatDate, joinAddress, money } from "./shared";

export function MinimalTemplate({ bill, totals, interState }: TemplateProps) {
  const b = bill.business;
  const c = bill.client;
  const showTax = bill.type !== "bill_of_supply" && bill.type !== "cash_bill" && bill.type !== "delivery_challan";
  return (
    <div className="bill-a4 p-10 font-sans text-[12px]" style={{ color: "#111827" }}>
      <div className="flex items-start justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{billDocumentTitle(bill)}</div>
          <div className="text-3xl font-semibold mt-1">{bill.number}</div>
          <div className="text-[11px] text-slate-500 mt-1">{formatDate(bill.date)}{bill.dueDate ? ` · Due ${formatDate(bill.dueDate)}` : ""}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{b.name}</div>
          <div className="text-[11px] text-slate-500">
            {joinAddress([b.address?.city, b.address?.stateName])}
            {b.gstin ? ` · GSTIN ${b.gstin}` : ""}
          </div>
          <div className="text-[11px] text-slate-500">{[b.phone, b.email].filter(Boolean).join(" · ")}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-[11px]">
        <div>
          <div className="text-slate-500 uppercase text-[10px] tracking-wider">Billed to</div>
          <div className="font-semibold mt-1 text-[13px]">{c.name}</div>
          <div className="text-slate-600">{joinAddress([c.billingAddress?.line1, c.billingAddress?.city, c.billingAddress?.stateName, c.billingAddress?.pincode])}</div>
          {c.gstin ? <div className="text-slate-600">GSTIN {c.gstin}</div> : null}
        </div>
        {bill.placeOfSupplyCode ? (
          <div className="text-right">
            <div className="text-slate-500 uppercase text-[10px] tracking-wider">Place of supply</div>
            <div className="mt-1">{bill.placeOfSupplyCode}</div>
          </div>
        ) : null}
      </div>

      <table className="mt-8 w-full text-[11px]">
        <thead>
          <tr className="text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            {showTax ? <th className="py-2 text-right">Tax</th> : null}
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it) => (
            <tr key={it.id} className="border-b border-slate-100">
              <td className="py-3">
                <div className="font-medium">{it.name}</div>
                {it.description ? <div className="text-[10px] text-slate-500">{it.description}</div> : null}
                {it.hsnSac ? <div className="text-[10px] text-slate-400">HSN {it.hsnSac}</div> : null}
              </td>
              <td className="py-3 text-right">{it.quantity} {it.unit ?? ""}</td>
              <td className="py-3 text-right">{money(it.rate)}</td>
              {showTax ? <td className="py-3 text-right">{it.gstRate ?? 0}%</td> : null}
              <td className="py-3 text-right font-medium">{money(it.quantity * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-72 text-[12px] space-y-1">
          <Row label="Sub-total" value={money(totals.subtotal)}/>
          {totals.totalDiscount ? <Row label="Discount" value={"-" + money(totals.totalDiscount)}/> : null}
          {showTax && !interState ? <>
            <Row label="CGST" value={money(totals.totalCgst)}/>
            <Row label="SGST" value={money(totals.totalSgst)}/>
          </> : null}
          {showTax && interState ? <Row label="IGST" value={money(totals.totalIgst)}/> : null}
          {totals.roundOff ? <Row label="Round off" value={money(totals.roundOff)}/> : null}
          <div className="pt-2 mt-2 border-t border-slate-300 flex justify-between font-semibold text-lg">
            <span>Total</span><span>{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[11px] text-slate-600">
        <AmountInWordsRow value={totals.grandTotal} />
      </div>
      {bill.notes ? <p className="mt-4 text-[11px] text-slate-600"><b>Notes:</b> {bill.notes}</p> : null}
      {bill.terms ? <p className="text-[11px] text-slate-600"><b>Terms:</b> {bill.terms}</p> : null}

      <div className="mt-10 flex justify-end items-end text-[11px] text-slate-500">
        <div className="text-right">
          {b.signatureUrl ? <img src={b.signatureUrl} className="h-12 ml-auto" alt="sign"/> : <div className="h-12"/>}
          <div className="border-t border-slate-300 pt-1">For {b.name}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
