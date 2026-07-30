/**
 * Indian currency formatting.
 * Uses ₹ with the Indian numbering system (lakh, crore).
 */
export function formatINR(amount: number, opts: { decimals?: number; withSymbol?: boolean } = {}): string {
  const { decimals = 2, withSymbol = true } = opts;
  if (!Number.isFinite(amount)) return withSymbol ? "₹0.00" : "0.00";
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);
  const sign = negative ? "-" : "";
  return `${sign}${withSymbol ? "₹" : ""}${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (Math.abs(amount) >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (Math.abs(amount) >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
  if (Math.abs(amount) >= 1e3) return `₹${(amount / 1e3).toFixed(1)} K`;
  return formatINR(amount, { decimals: 0 });
}

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigit(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function threeDigit(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(ones[h] + " Hundred");
  if (rest) parts.push(twoDigit(rest));
  return parts.join(" ");
}

/** Number to Indian words (crore/lakh/thousand). Handles up to 99,99,99,99,999. */
export function numberToIndianWords(num: number): string {
  if (!Number.isFinite(num)) return "Zero";
  if (num === 0) return "Zero";
  const negative = num < 0;
  const n = Math.floor(Math.abs(num));

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(numberToIndianWords(crore) + " Crore");
  if (lakh) parts.push(twoDigit(lakh) + " Lakh");
  if (thousand) parts.push(twoDigit(thousand) + " Thousand");
  if (hundred) parts.push(threeDigit(hundred));
  return (negative ? "Minus " : "") + parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Format ₹ amount as "Rupees ... and Paise ... Only" */
export function amountInWordsINR(amount: number): string {
  if (!Number.isFinite(amount)) return "Rupees Zero Only";
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);
  const rupeeWords = numberToIndianWords(rupees) || "Zero";
  const paiseWords = paise ? " and " + numberToIndianWords(paise) + " Paise" : "";
  return (negative ? "Minus " : "") + `Rupees ${rupeeWords}${paiseWords} Only`;
}
