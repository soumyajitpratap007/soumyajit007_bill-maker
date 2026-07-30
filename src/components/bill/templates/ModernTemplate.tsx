import type { TemplateProps } from "./types";
import { AmountInWordsRow, billDocumentTitle, formatDate, joinAddress, money } from "./shared";

export function ModernTemplate({ bill, totals, interState }: TemplateProps) {
  const b = bill.business;
  const c = bill.client;
  const showTax = bill.type !== "bill_of_supply" && bill.type !== "cash_bill" && bill.type !== "delivery_challan";
  return (
    <div className="bill-a4 font-sans text-[12px]" style={{ color: "#0f172a" }}>
      {/* Top strip */}
      <div className="bg-teal-700 text-white p-8 flex items-start justify-between rounded-none">
        <div className="flex gap-4 items-center">
          {b.logoUrl ? <div className="h-14 w-14 rounded-xl bg-white p-1"><img src={b.logoUrl} className="h-full w-full object-contain" alt="logo" /></div> : null}
          <div>
            <div className="text-2xl font-semibold">{b.name || "Your Business"}</div>
            <div className="text-[11px] opacity-80">{[b.phone, b.email, b.website].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="uppercase tracking-widest text-[11px] opacity-80">{billDocumentTitle(bill)}</div>
          <div className="text-2xl font-semibold">{bill.number}</div>
          <div className="text-[11px] opacity-80 mt-1">{formatDate(bill.date)}{bill.dueDate ? ` · Due ${formatDate(bill.dueDate)}` : ""}</div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <Party title="From" name={b.name} lines={[
            joinAddress([b.address?.line1, b.address?.line2]),
            joinAddress([b.address?.city, b.address?.stateName, b.address?.pincode]),
            b.gstin ? `GSTIN ${b.gstin}` : "",
          ]}/>
          <Party title="Bill to" name={c.name} lines={[
            joinAddress([c.billingAddress?.line1, c.billingAddress?.line2]),
            joinAddress([c.billingAddress?.city, c.billingAddress?.stateName, c.billingAddress?.pincode]),
            c.gstin ? `GSTIN ${c.gstin}` : "",
            c.phone ?? "",
          ]}/>
          <Party title="Ship to" name={""} lines={[
            joinAddress([c.shippingAddress?.line1 ?? c.billingAddress?.line1, c.shippingAddress?.city ?? c.billingAddress?.city]),
            joinAddress([c.shippingAddress?.stateName ?? c.billingAddress?.stateName, c.shippingAddress?.pincode ?? c.billingAddress?.pincode]),
            bill.placeOfSupplyCode ? `Place of supply: ${bill.placeOfSupplyCode}` : "",
          ]}/>
        </div>

        <table className="w-full text-[11px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-teal-700 uppercase text-[10px] tracking-wider">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">HSN</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              {showTax ? <th className="py-2 text-right">Tax</th> : null}
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it) => (
              <tr key={it.id} className="border-t border-slate-200">
                <td className="py-2 pr-2">
                  <div className="font-medium">{it.name}</div>
                  {it.description ? <div className="text-[10px] text-slate-500">{it.description}</div> : null}
                </td>
                <td className="py-2 text-right">{it.hsnSac ?? "—"}</td>
                <td className="py-2 text-right">{it.quantity} {it.unit ?? ""}</td>
                <td className="py-2 text-right">{money(it.rate)}</td>
                {showTax ? <td className="py-2 text-right">{it.gstRate ?? 0}%</td> : null}
                <td className="py-2 text-right">{money(it.quantity * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between gap-6">
          <div className="flex-1 space-y-2">
            <AmountInWordsRow value={totals.grandTotal} className="text-slate-700"/>
            {b.bank?.bankName || b.bank?.upiId ? (
              <div className="mt-3 rounded-xl bg-teal-50 border border-teal-100 p-3 max-w-sm text-[11px]">
                <div className="font-semibold text-teal-700 mb-1">Pay by bank / UPI</div>
                {b.bank?.bankName ? <div>Bank: {b.bank.bankName} · {b.bank.branch}</div> : null}
                {b.bank?.accountNumber ? <div>A/C: {b.bank.accountNumber} · IFSC {b.bank.ifsc}</div> : null}
                {b.bank?.upiId ? <div>UPI: <b>{b.bank.upiId}</b></div> : null}
              </div>
            ) : null}
            {bill.notes ? <div className="text-[11px]"><b>Notes: </b>{bill.notes}</div> : null}
            {bill.terms ? <div className="text-[11px]"><b>Terms: </b>{bill.terms}</div> : null}
          </div>
          <div className="w-72 text-[12px] bg-slate-50 rounded-xl p-4">
            <Row label="Sub-total" value={money(totals.subtotal)}/>
            {totals.totalDiscount ? <Row label="Discount" value={"-" + money(totals.totalDiscount)}/> : null}
            {showTax && !interState ? (
              <>
                <Row label="CGST" value={money(totals.totalCgst)}/>
                <Row label="SGST" value={money(totals.totalSgst)}/>
              </>
            ) : null}
            {showTax && interState ? <Row label="IGST" value={money(totals.totalIgst)}/> : null}
            {totals.totalCess ? <Row label="Cess" value={money(totals.totalCess)}/> : null}
            {bill.shippingCharge ? <Row label="Shipping" value={money(bill.shippingCharge)}/> : null}
            {totals.extraDiscount ? <Row label="Extra discount" value={"-" + money(totals.extraDiscount)}/> : null}
            {totals.roundOff ? <Row label="Round off" value={money(totals.roundOff)}/> : null}
            <div className="mt-2 border-t border-slate-300 pt-2 flex justify-between font-semibold text-teal-700 text-[14px]">
              <span>Total due</span><span>{money(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 text-[11px] text-slate-600">
          <div className="text-right">
            {b.signatureUrl ? <img src={b.signatureUrl} alt="signature" className="h-12 ml-auto object-contain" /> : <div className="h-12"/>}
            <div className="border-t border-slate-300 pt-1 mt-1">Authorised signatory · {b.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Party({ title, name, lines }: { title: string; name?: string; lines: string[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-teal-700 font-semibold">{title}</div>
      {name ? <div className="mt-1 font-semibold">{name}</div> : null}
      {lines.filter(Boolean).map((l, i) => <div key={i} className="text-[11px] text-slate-700">{l}</div>)}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-0.5"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
