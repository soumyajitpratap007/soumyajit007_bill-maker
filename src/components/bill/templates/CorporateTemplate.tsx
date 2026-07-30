import type { TemplateProps } from "./types";
import { AmountInWordsRow, billDocumentTitle, formatDate, joinAddress, money } from "./shared";

export function CorporateTemplate({ bill, totals, interState }: TemplateProps) {
  const b = bill.business;
  const c = bill.client;
  const showTax = bill.type !== "bill_of_supply" && bill.type !== "cash_bill" && bill.type !== "delivery_challan";
  return (
    <div className="bill-a4 font-sans text-[12px]" style={{ color: "#111827" }}>
      <div className="grid grid-cols-[6px_1fr] min-h-[1123px]">
        <div className="bg-orange-800" />
        <div className="p-8">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div className="flex gap-3 items-center">
              {b.logoUrl ? <img src={b.logoUrl} className="h-14 w-14 object-contain" alt="logo"/> : null}
              <div>
                <div className="text-xl font-bold text-orange-800">{b.name}</div>
                {b.legalName ? <div className="text-[11px] text-slate-500">{b.legalName}</div> : null}
                <div className="text-[11px] text-slate-600 mt-0.5">{joinAddress([b.address?.line1, b.address?.city, b.address?.stateName, b.address?.pincode])}</div>
                <div className="text-[11px] text-slate-600">{[b.phone && `T ${b.phone}`, b.email, b.website].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="uppercase tracking-widest text-[10px] text-slate-500">{billDocumentTitle(bill)}</div>
              <div className="text-xl font-semibold mt-1">{bill.number}</div>
              <div className="text-[11px] text-slate-600">{formatDate(bill.date)}</div>
              {b.gstin ? <div className="text-[11px] mt-1"><b>GSTIN</b> {b.gstin}</div> : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px]">
              <div className="text-[10px] uppercase tracking-wider text-orange-800 font-semibold">Customer</div>
              <div className="font-semibold mt-0.5">{c.name}</div>
              <div className="text-slate-600">{joinAddress([c.billingAddress?.line1, c.billingAddress?.city, c.billingAddress?.stateName, c.billingAddress?.pincode])}</div>
              {c.gstin ? <div>GSTIN {c.gstin}</div> : null}
              {c.phone ? <div>Phone {c.phone}</div> : null}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px]">
              <div className="text-[10px] uppercase tracking-wider text-orange-800 font-semibold">Invoice details</div>
              {bill.dueDate ? <div>Due: {formatDate(bill.dueDate)}</div> : null}
              {bill.placeOfSupplyCode ? <div>Place of supply: {bill.placeOfSupplyCode}</div> : null}
              {bill.reference ? <div>Reference: {bill.reference}</div> : null}
              <div>Currency: INR</div>
            </div>
          </div>

          <table className="mt-5 w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-left">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-2">Item / description</th>
                <th className="py-2 px-2 text-right w-16">HSN</th>
                <th className="py-2 px-2 text-right w-12">Qty</th>
                <th className="py-2 px-2 text-right w-16">Rate</th>
                {showTax ? <th className="py-2 px-2 text-right w-12">GST</th> : null}
                <th className="py-2 px-2 text-right w-20">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((it, i) => (
                <tr key={it.id} className="border-b border-slate-200 align-top">
                  <td className="py-2 px-2 text-slate-500">{i + 1}</td>
                  <td className="py-2 px-2">
                    <div className="font-medium">{it.name}</div>
                    {it.description ? <div className="text-[10px] text-slate-500">{it.description}</div> : null}
                  </td>
                  <td className="py-2 px-2 text-right">{it.hsnSac ?? "—"}</td>
                  <td className="py-2 px-2 text-right">{it.quantity} {it.unit ?? ""}</td>
                  <td className="py-2 px-2 text-right">{money(it.rate)}</td>
                  {showTax ? <td className="py-2 px-2 text-right">{it.gstRate ?? 0}%</td> : null}
                  <td className="py-2 px-2 text-right font-medium">{money(it.quantity * it.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between gap-6 items-start">
            <div className="flex-1 text-[11px] text-slate-700 space-y-2">
              <AmountInWordsRow value={totals.grandTotal}/>
              {b.bank?.accountNumber ? (
                <div className="mt-2 border border-slate-200 rounded p-3 max-w-sm">
                  <div className="font-semibold text-orange-800 mb-1">Bank / UPI</div>
                  <div>{b.bank.bankName} · {b.bank.branch}</div>
                  <div>A/C {b.bank.accountNumber} · IFSC {b.bank.ifsc}</div>
                  {b.bank.upiId ? <div>UPI {b.bank.upiId}</div> : null}
                </div>
              ) : null}
            </div>
            <div className="w-72 text-[12px]">
              <Row label="Sub-total" value={money(totals.subtotal)}/>
              {totals.totalDiscount ? <Row label="Discount" value={"-" + money(totals.totalDiscount)}/> : null}
              {showTax && !interState ? <><Row label="CGST" value={money(totals.totalCgst)}/><Row label="SGST" value={money(totals.totalSgst)}/></> : null}
              {showTax && interState ? <Row label="IGST" value={money(totals.totalIgst)}/> : null}
              {totals.totalCess ? <Row label="Cess" value={money(totals.totalCess)}/> : null}
              {bill.shippingCharge ? <Row label="Shipping" value={money(bill.shippingCharge)}/> : null}
              {totals.extraDiscount ? <Row label="Additional discount" value={"-" + money(totals.extraDiscount)}/> : null}
              {totals.roundOff ? <Row label="Round off" value={money(totals.roundOff)}/> : null}
              <div className="mt-2 border-t border-slate-300 pt-2 flex justify-between font-semibold text-orange-800 text-[14px]">
                <span>Grand total</span><span>{money(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {bill.terms ? <div className="mt-4 text-[10px] text-slate-500"><b>Terms & conditions:</b> {bill.terms}</div> : null}
          {bill.notes ? <div className="text-[10px] text-slate-500"><b>Notes:</b> {bill.notes}</div> : null}

          <div className="mt-8 flex justify-end">
            <div className="text-right text-[11px] text-slate-500">
              {b.signatureUrl ? <img src={b.signatureUrl} className="h-12 ml-auto" alt="sign"/> : <div className="h-12"/>}
              <div className="border-t border-slate-300 pt-1">Authorised signatory · {b.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-0.5"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
