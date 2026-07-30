import type { TemplateProps } from "./types";
import { AmountInWordsRow, billDocumentTitle, formatDate, joinAddress, money } from "./shared";

export function ClassicTemplate({ bill, totals, interState }: TemplateProps) {
  const b = bill.business;
  const c = bill.client;
  const showTax = bill.type !== "bill_of_supply" && bill.type !== "cash_bill" && bill.type !== "delivery_challan";
  return (
    <div className="bill-a4 p-10 font-sans text-[12px] leading-relaxed" style={{ color: "#0f172a" }}>
      {/* Header */}
      <div className="border-b-2 border-blue-900 pb-4 flex items-start justify-between">
        <div className="flex gap-4 items-start">
          {b.logoUrl ? <img src={b.logoUrl} alt="logo" className="h-16 w-16 object-contain" /> : null}
          <div>
            <div className="text-2xl font-bold text-blue-900">{b.name || "Your Business"}</div>
            {b.legalName ? <div className="text-[11px] text-slate-500">{b.legalName}</div> : null}
            <div className="text-[11px] mt-1 text-slate-700">
              {joinAddress([b.address?.line1, b.address?.line2, b.address?.city, b.address?.stateName, b.address?.pincode])}
            </div>
            <div className="text-[11px] text-slate-700">
              {[b.phone && `Phone: ${b.phone}`, b.email, b.website].filter(Boolean).join(" · ")}
            </div>
            {b.gstin ? <div className="text-[11px] mt-1"><b>GSTIN:</b> {b.gstin}</div> : null}
            {b.pan ? <span className="text-[11px] ml-3"><b>PAN:</b> {b.pan}</span> : null}
          </div>
        </div>
        <div className="text-right">
          <div className="uppercase tracking-wider text-blue-900 font-bold text-lg">{billDocumentTitle(bill)}</div>
          <table className="mt-2 text-[11px] text-right">
            <tbody>
              <tr><td className="pr-2 text-slate-500">No.</td><td className="font-semibold">{bill.number}</td></tr>
              <tr><td className="pr-2 text-slate-500">Date</td><td>{formatDate(bill.date)}</td></tr>
              {bill.dueDate ? <tr><td className="pr-2 text-slate-500">Due</td><td>{formatDate(bill.dueDate)}</td></tr> : null}
              {bill.reference ? <tr><td className="pr-2 text-slate-500">Ref</td><td>{bill.reference}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parties */}
      <div className="mt-5 grid grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Bill to</div>
          <div className="mt-1 text-[13px] font-semibold">{c.name}</div>
          <div className="text-[11px] text-slate-700">
            {joinAddress([c.billingAddress?.line1, c.billingAddress?.line2, c.billingAddress?.city, c.billingAddress?.stateName, c.billingAddress?.pincode])}
          </div>
          {c.gstin ? <div className="text-[11px]"><b>GSTIN:</b> {c.gstin}</div> : null}
          {c.phone ? <div className="text-[11px]">Phone: {c.phone}</div> : null}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ship to</div>
          <div className="text-[11px] text-slate-700 mt-1">
            {joinAddress([c.shippingAddress?.line1 ?? c.billingAddress?.line1, c.shippingAddress?.city ?? c.billingAddress?.city, c.shippingAddress?.stateName ?? c.billingAddress?.stateName, c.shippingAddress?.pincode ?? c.billingAddress?.pincode])}
          </div>
          {bill.placeOfSupplyCode ? <div className="text-[11px] mt-1"><b>Place of supply:</b> {bill.placeOfSupplyCode}</div> : null}
        </div>
      </div>

      {/* Items */}
      <table className="mt-6 w-full text-[11px] border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white text-left">
            <th className="py-2 px-2 w-8">#</th>
            <th className="py-2 px-2">Item</th>
            <th className="py-2 px-2 text-right w-16">HSN</th>
            <th className="py-2 px-2 text-right w-12">Qty</th>
            <th className="py-2 px-2 text-right w-16">Rate</th>
            {showTax ? <th className="py-2 px-2 text-right w-12">GST%</th> : null}
            <th className="py-2 px-2 text-right w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it, i) => {
            const gross = it.quantity * it.rate;
            return (
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
                <td className="py-2 px-2 text-right">{money(gross)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-5 flex justify-between gap-8">
        <div className="flex-1 text-[11px] text-slate-700 space-y-2">
          <AmountInWordsRow value={totals.grandTotal} />
          {b.bank?.bankName ? (
            <div className="mt-3 border border-slate-200 rounded p-3 max-w-sm">
              <div className="font-semibold text-blue-900 mb-1">Bank details</div>
              {b.bank.bankName ? <div>Bank: {b.bank.bankName}</div> : null}
              {b.bank.accountName ? <div>A/C name: {b.bank.accountName}</div> : null}
              {b.bank.accountNumber ? <div>A/C no: {b.bank.accountNumber}</div> : null}
              {b.bank.ifsc ? <div>IFSC: {b.bank.ifsc}</div> : null}
              {b.bank.upiId ? <div>UPI: {b.bank.upiId}</div> : null}
            </div>
          ) : null}
          {bill.notes ? <div className="mt-3"><b>Notes: </b>{bill.notes}</div> : null}
          {bill.terms ? <div><b>Terms: </b>{bill.terms}</div> : null}
        </div>
        <div className="w-72 text-[12px]">
          <Row label="Sub-total" value={money(totals.subtotal)} />
          {totals.totalDiscount ? <Row label="Discount" value={"-" + money(totals.totalDiscount)} /> : null}
          {showTax && !interState ? (
            <>
              <Row label="CGST" value={money(totals.totalCgst)} />
              <Row label="SGST" value={money(totals.totalSgst)} />
            </>
          ) : null}
          {showTax && interState ? <Row label="IGST" value={money(totals.totalIgst)} /> : null}
          {totals.totalCess ? <Row label="Cess" value={money(totals.totalCess)} /> : null}
          {bill.shippingCharge ? <Row label="Shipping" value={money(bill.shippingCharge)} /> : null}
          {totals.extraDiscount ? <Row label="Additional discount" value={"-" + money(totals.extraDiscount)} /> : null}
          {totals.roundOff ? <Row label="Round off" value={money(totals.roundOff)} /> : null}
          <div className="mt-2 border-t-2 border-blue-900 pt-2 flex justify-between font-bold text-blue-900 text-[14px]">
            <span>Grand Total</span>
            <span>{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-10 grid grid-cols-2 items-end text-[11px] text-slate-600">
        <div>
          {bill.type === "delivery_challan" ? (
            <div>
              <div className="border-t border-slate-300 pt-1 mt-8">Receiver&rsquo;s signature</div>
            </div>
          ) : null}
        </div>
        <div className="text-right">
          {b.signatureUrl ? <img src={b.signatureUrl} alt="signature" className="ml-auto h-14 object-contain" /> : <div className="h-14" />}
          <div className="border-t border-slate-300 pt-1 mt-1">For {b.name || "your business"}</div>
        </div>
      </div>

      <div className="mt-4 text-center text-[10px] text-slate-400">This is a computer-generated document.</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
