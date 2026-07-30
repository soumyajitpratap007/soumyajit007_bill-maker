import type { TemplateProps } from "./types";
import { AmountInWordsRow, billDocumentTitle, formatDate, joinAddress, money } from "./shared";
import { computeLineTax } from "@/lib/indian/tax";

export function GstCompactTemplate({ bill, totals, interState }: TemplateProps) {
  const b = bill.business;
  const c = bill.client;
  return (
    <div className="bill-a4 p-6 font-sans text-[11px]" style={{ color: "#111827" }}>
      {/* Header block */}
      <div className="border-2 border-purple-900">
        <div className="p-3 flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-purple-900">{b.name}</div>
            <div className="text-[10px]">{joinAddress([b.address?.line1, b.address?.city, b.address?.stateName, b.address?.pincode])}</div>
            <div className="text-[10px]">{[b.phone && `Ph: ${b.phone}`, b.email].filter(Boolean).join(" · ")}</div>
            <div className="text-[10px] mt-0.5"><b>GSTIN:</b> {b.gstin ?? "—"} {b.pan ? `· PAN: ${b.pan}` : ""}</div>
          </div>
          <div className="text-right">
            <div className="uppercase text-[10px] tracking-wider">Original for recipient</div>
            <div className="text-lg font-semibold text-purple-900">{billDocumentTitle(bill)}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 border-t border-purple-900 text-[10px]">
          <Cell label="Invoice no." value={bill.number}/>
          <Cell label="Date" value={formatDate(bill.date)}/>
          <Cell label="Due date" value={bill.dueDate ? formatDate(bill.dueDate) : "—"}/>
          <Cell label="Place of supply" value={bill.placeOfSupplyCode ?? "—"} last/>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 border-x-2 border-b-2 border-purple-900">
        <div className="p-3 border-r-2 border-purple-900">
          <div className="text-[10px] uppercase tracking-wider text-purple-900 font-semibold">Billed to</div>
          <div className="font-semibold">{c.name}</div>
          <div>{joinAddress([c.billingAddress?.line1, c.billingAddress?.line2])}</div>
          <div>{joinAddress([c.billingAddress?.city, c.billingAddress?.stateName, c.billingAddress?.pincode])}</div>
          {c.gstin ? <div><b>GSTIN:</b> {c.gstin}</div> : null}
          {c.phone ? <div>Ph: {c.phone}</div> : null}
        </div>
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wider text-purple-900 font-semibold">Shipped to</div>
          <div>{joinAddress([c.shippingAddress?.line1 ?? c.billingAddress?.line1, c.shippingAddress?.city ?? c.billingAddress?.city, c.shippingAddress?.stateName ?? c.billingAddress?.stateName, c.shippingAddress?.pincode ?? c.billingAddress?.pincode])}</div>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full border-2 border-t-0 border-purple-900 text-[10px] border-collapse">
        <thead className="bg-purple-900 text-white">
          <tr>
            <th className="p-1 border-r border-white/30">#</th>
            <th className="p-1 border-r border-white/30 text-left">Item</th>
            <th className="p-1 border-r border-white/30">HSN</th>
            <th className="p-1 border-r border-white/30">Qty</th>
            <th className="p-1 border-r border-white/30">Rate</th>
            <th className="p-1 border-r border-white/30">Taxable</th>
            {interState ? (
              <>
                <th className="p-1 border-r border-white/30" colSpan={2}>IGST</th>
              </>
            ) : (
              <>
                <th className="p-1 border-r border-white/30" colSpan={2}>CGST</th>
                <th className="p-1 border-r border-white/30" colSpan={2}>SGST</th>
              </>
            )}
            <th className="p-1">Amount</th>
          </tr>
          <tr className="bg-purple-800 text-white text-[9px]">
            <th></th><th></th><th></th><th></th><th></th><th></th>
            {interState ? <><th>%</th><th>Amt</th></> : <><th>%</th><th>Amt</th><th>%</th><th>Amt</th></>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it, i) => {
            const t = computeLineTax(it, interState);
            const half = (it.gstRate ?? 0) / 2;
            const amt = t.taxable + t.cgst + t.sgst + t.igst + (t.cess ?? 0);
            return (
              <tr key={it.id} className="border-t border-purple-900 text-center">
                <td className="p-1 border-r border-purple-900">{i + 1}</td>
                <td className="p-1 border-r border-purple-900 text-left">
                  <div className="font-medium">{it.name}</div>
                  {it.description ? <div className="text-[9px] text-slate-500">{it.description}</div> : null}
                </td>
                <td className="p-1 border-r border-purple-900">{it.hsnSac ?? "—"}</td>
                <td className="p-1 border-r border-purple-900">{it.quantity}{it.unit ? ` ${it.unit}` : ""}</td>
                <td className="p-1 border-r border-purple-900">{money(it.rate)}</td>
                <td className="p-1 border-r border-purple-900 text-right">{money(t.taxable)}</td>
                {interState ? (
                  <>
                    <td className="p-1 border-r border-purple-900">{it.gstRate ?? 0}%</td>
                    <td className="p-1 border-r border-purple-900 text-right">{money(t.igst)}</td>
                  </>
                ) : (
                  <>
                    <td className="p-1 border-r border-purple-900">{half}%</td>
                    <td className="p-1 border-r border-purple-900 text-right">{money(t.cgst)}</td>
                    <td className="p-1 border-r border-purple-900">{half}%</td>
                    <td className="p-1 border-r border-purple-900 text-right">{money(t.sgst)}</td>
                  </>
                )}
                <td className="p-1 text-right">{money(amt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals + words */}
      <div className="grid grid-cols-[1fr_260px] border-2 border-t-0 border-purple-900">
        <div className="p-3 border-r-2 border-purple-900 text-[10px]">
          <AmountInWordsRow value={totals.grandTotal}/>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {Object.entries(totals.taxableByRate).map(([rate, v]) => (
              <div key={rate} className="border border-purple-900 p-1 text-center">
                <div className="font-semibold">GST {rate}%</div>
                <div>Taxable {money(v.taxable)}</div>
                <div>Tax {money(v.tax)}</div>
              </div>
            ))}
          </div>
          {b.bank?.accountNumber ? (
            <div className="mt-2 border border-purple-900 p-2">
              <div className="font-semibold text-purple-900">Bank details</div>
              <div>{b.bank.bankName} · A/C {b.bank.accountNumber} · IFSC {b.bank.ifsc}</div>
              {b.bank.upiId ? <div>UPI: {b.bank.upiId}</div> : null}
            </div>
          ) : null}
          {bill.terms ? <div className="mt-2"><b>Terms:</b> {bill.terms}</div> : null}
          {bill.notes ? <div><b>Notes:</b> {bill.notes}</div> : null}
        </div>
        <div className="p-3 text-[11px]">
          <Row label="Taxable value" value={money(totals.subtotal)}/>
          {!interState ? <><Row label="CGST" value={money(totals.totalCgst)}/><Row label="SGST" value={money(totals.totalSgst)}/></> : <Row label="IGST" value={money(totals.totalIgst)}/>}
          {totals.totalCess ? <Row label="Cess" value={money(totals.totalCess)}/> : null}
          {bill.shippingCharge ? <Row label="Shipping" value={money(bill.shippingCharge)}/> : null}
          {totals.extraDiscount ? <Row label="Extra discount" value={"-" + money(totals.extraDiscount)}/> : null}
          {totals.roundOff ? <Row label="Round off" value={money(totals.roundOff)}/> : null}
          <div className="mt-2 border-t border-purple-900 pt-2 flex justify-between font-bold text-purple-900">
            <span>Grand total</span><span>{money(totals.grandTotal)}</span>
          </div>
          <div className="mt-6 text-right">
            {b.signatureUrl ? <img src={b.signatureUrl} className="h-10 ml-auto" alt="sign"/> : <div className="h-10"/>}
            <div className="border-t border-purple-900 pt-1 text-[10px]">Authorised signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`p-2 ${last ? "" : "border-r border-purple-900"}`}>
      <div className="text-[9px] uppercase tracking-wider text-purple-900 font-semibold">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
