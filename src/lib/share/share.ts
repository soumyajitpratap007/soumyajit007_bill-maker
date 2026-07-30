"use client";
import type { Bill } from "@/lib/types";
import { formatINR } from "@/lib/indian";
import { computeBillTotals, isInterState } from "@/lib/indian/tax";

export function billShareMessage(bill: Bill): string {
  const totals = computeBillTotals(bill.items, {
    interState: isInterState(bill.business?.address?.stateCode ?? "", bill.placeOfSupplyCode ?? ""),
    extraDiscount: bill.extraDiscount, extraDiscountType: bill.extraDiscountType,
    shippingCharge: bill.shippingCharge, roundOff: bill.roundOff,
  });
  const lines = [
    `Hi ${bill.client.name?.split(" ")[0] || "there"},`,
    ``,
    `Please find your ${labelFor(bill.type)} #${bill.number} dated ${new Date(bill.date).toLocaleDateString("en-IN")} for a total of ${formatINR(totals.grandTotal)}.`,
    ``,
    `From ${bill.business.name || "us"}.`,
  ];
  return lines.join("\n");
}

function labelFor(t: Bill["type"]): string {
  const map: Record<Bill["type"], string> = {
    gst_invoice: "invoice",
    bill_of_supply: "bill",
    cash_bill: "bill",
    proforma: "proforma invoice",
    quotation: "quotation",
    receipt: "receipt",
    delivery_challan: "delivery challan",
    purchase_order: "purchase order",
  };
  return map[t];
}

export function normalizePhoneForWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits; // default India
  return digits;
}

export function whatsappLink(bill: Bill, publicUrl?: string): string {
  const message = billShareMessage(bill) + (publicUrl ? `\n\nView: ${publicUrl}` : "");
  const phone = normalizePhoneForWhatsapp(bill.client.phone ?? "");
  return `https://wa.me/${phone ? phone : ""}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(bill: Bill, publicUrl?: string): string {
  const subject = `${labelFor(bill.type)[0].toUpperCase() + labelFor(bill.type).slice(1)} #${bill.number} from ${bill.business.name || ""}`.trim();
  const body = billShareMessage(bill) + (publicUrl ? `\n\nView online: ${publicUrl}` : "");
  return `mailto:${bill.client.email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function shareViaWebShareApi(bill: Bill, pdfBlob: Blob, publicUrl?: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  const fileName = `${bill.number}.pdf`;
  const file = new File([pdfBlob], fileName, { type: "application/pdf" });
  const data: ShareData & { files?: File[] } = {
    title: `Bill ${bill.number}`,
    text: billShareMessage(bill),
    files: [file],
  };
  const anyNav = navigator as Navigator & { canShare?: (data: ShareData & { files?: File[] }) => boolean; share: (data: ShareData & { files?: File[] }) => Promise<void> };
  if (anyNav.canShare && !anyNav.canShare(data)) {
    // fall back to link-only share
    await anyNav.share({ title: data.title, text: data.text, url: publicUrl });
    return true;
  }
  try {
    await anyNav.share(data);
    return true;
  } catch (e) {
    // user cancelled or unsupported
    return false;
  }
}
