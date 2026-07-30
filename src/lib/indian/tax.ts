import type { BillLineItem, TaxBreakup } from "../types";

/**
 * Decide intra-state (CGST+SGST) vs inter-state (IGST) supply.
 * When state codes differ, IGST applies.
 */
export function isInterState(supplierStateCode: string, placeOfSupplyCode: string): boolean {
  if (!supplierStateCode || !placeOfSupplyCode) return false;
  return supplierStateCode !== placeOfSupplyCode;
}

/** Line-level: taxable = qty × rate − discount. Discount can be % or absolute. */
export function computeLineTaxable(item: BillLineItem): number {
  const gross = item.quantity * item.rate;
  const discount = item.discountType === "percent"
    ? gross * ((item.discount ?? 0) / 100)
    : (item.discount ?? 0);
  return Math.max(0, gross - discount);
}

export function computeLineTax(item: BillLineItem, interState: boolean): TaxBreakup {
  const taxable = computeLineTaxable(item);
  const rate = item.gstRate ?? 0;
  if (interState) {
    const igst = (taxable * rate) / 100;
    return { taxable, cgst: 0, sgst: 0, igst, cess: (taxable * (item.cessRate ?? 0)) / 100 };
  }
  const half = rate / 2;
  const cgst = (taxable * half) / 100;
  const sgst = (taxable * half) / 100;
  return { taxable, cgst, sgst, igst: 0, cess: (taxable * (item.cessRate ?? 0)) / 100 };
}

export interface BillTotals {
  subtotal: number; // pre-tax total (after line discount)
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  totalTax: number;
  extraDiscount: number;
  roundOff: number;
  grandTotal: number;
  taxableByRate: Record<string, { taxable: number; tax: number }>;
}

export function computeBillTotals(
  items: BillLineItem[],
  opts: {
    interState: boolean;
    extraDiscount?: number;
    extraDiscountType?: "percent" | "flat";
    roundOff?: boolean;
    shippingCharge?: number;
  },
): BillTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalCess = 0;
  const taxableByRate: Record<string, { taxable: number; tax: number }> = {};

  for (const item of items) {
    const gross = item.quantity * item.rate;
    const discount = item.discountType === "percent"
      ? gross * ((item.discount ?? 0) / 100)
      : (item.discount ?? 0);
    const taxable = Math.max(0, gross - discount);
    const t = computeLineTax(item, opts.interState);
    subtotal += taxable;
    totalDiscount += discount;
    totalCgst += t.cgst;
    totalSgst += t.sgst;
    totalIgst += t.igst;
    totalCess += t.cess ?? 0;
    const key = String(item.gstRate ?? 0);
    if (!taxableByRate[key]) taxableByRate[key] = { taxable: 0, tax: 0 };
    taxableByRate[key].taxable += taxable;
    taxableByRate[key].tax += t.cgst + t.sgst + t.igst + (t.cess ?? 0);
  }

  const totalTax = totalCgst + totalSgst + totalIgst + totalCess;
  const shipping = opts.shippingCharge ?? 0;
  let extra = 0;
  if (opts.extraDiscount) {
    extra = opts.extraDiscountType === "percent"
      ? (subtotal + totalTax) * (opts.extraDiscount / 100)
      : opts.extraDiscount;
  }
  const rawGrand = subtotal + totalTax + shipping - extra;
  const rounded = opts.roundOff !== false ? Math.round(rawGrand) : rawGrand;
  const roundOff = rounded - rawGrand;

  return {
    subtotal,
    totalDiscount,
    totalCgst,
    totalSgst,
    totalIgst,
    totalCess,
    totalTax,
    extraDiscount: extra,
    roundOff,
    grandTotal: rounded,
    taxableByRate,
  };
}
