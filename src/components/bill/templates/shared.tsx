import { BILL_TYPE_LABELS, type Bill } from "@/lib/types";
import { amountInWordsINR, formatINR } from "@/lib/indian";

export function billDocumentTitle(bill: Bill): string {
  if (bill.type === "gst_invoice") return "Tax Invoice";
  return BILL_TYPE_LABELS[bill.type];
}

export function formatDate(d?: string) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function joinAddress(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(", ");
}

export function AmountInWordsRow({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`text-xs italic ${className}`}>
      <span className="font-semibold not-italic">Amount in words: </span>
      {amountInWordsINR(value)}
    </div>
  );
}

export function money(v: number) { return formatINR(v); }
