/** Core domain types for Bill Maker. */

export type BillType =
  | "gst_invoice"          // Tax Invoice (registered biz)
  | "bill_of_supply"       // Non-GST / exempt / composition
  | "cash_bill"            // Simple cash memo
  | "proforma"             // Pre-sale proforma invoice
  | "quotation"            // Quote / estimate
  | "receipt"              // Payment receipt
  | "delivery_challan"     // Goods dispatch document
  | "purchase_order";      // Buyer to seller

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "corporate"
  | "gst_compact";

export type BusinessDomain =
  | "retail"
  | "manufacturing"
  | "wholesale"
  | "services"
  | "restaurant"
  | "freelance"
  | "ecommerce"
  | "construction"
  | "healthcare"
  | "education"
  | "other";

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  stateName?: string;
  stateCode?: string; // 2-digit GSTIN state code
  pincode?: string;
  country?: string; // default India
}

export interface BankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
}

export interface BusinessProfile {
  id: string;
  ownerUserId?: string;
  name: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  domain?: BusinessDomain;
  logoUrl?: string;
  signatureUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: Address;
  bank?: BankDetails;
  termsDefault?: string;
  invoicePrefix?: string; // e.g. INV-, EST-
  nextInvoiceNumber?: number;
  currency?: "INR";
  defaultTemplate?: TemplateId;
  createdAt?: string;
}

export interface Client {
  id: string;
  ownerUserId?: string;
  name: string;
  gstin?: string;
  email?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  ownerUserId?: string;
  name: string;
  description?: string;
  hsnSac?: string;
  unit?: string; // NOS, KGS, HRS, BOX etc
  rate: number;
  gstRate?: number;
  createdAt?: string;
}

export interface BillLineItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  hsnSac?: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount?: number; // amount OR percent based on discountType
  discountType?: "flat" | "percent";
  gstRate?: number; // 0/5/12/18/28 etc
  cessRate?: number;
}

export interface TaxBreakup {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess?: number;
}

export interface Bill {
  id: string;
  shortId?: string; // for public share URL
  ownerUserId?: string;
  type: BillType;
  templateId: TemplateId;
  number: string; // invoice/quote number
  date: string; // ISO date
  dueDate?: string;
  business: BusinessProfile;
  client: Client;
  placeOfSupplyCode?: string; // 2-digit
  items: BillLineItem[];
  extraDiscount?: number;
  extraDiscountType?: "flat" | "percent";
  shippingCharge?: number;
  roundOff?: boolean;
  notes?: string;
  terms?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paidAmount?: number;
  paymentMode?: string;
  reference?: string; // e.g. PO reference, challan number
  createdAt?: string;
  updatedAt?: string;
}

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  gst_invoice: "GST Tax Invoice",
  bill_of_supply: "Bill of Supply",
  cash_bill: "Cash Bill / Memo",
  proforma: "Proforma Invoice",
  quotation: "Quotation / Estimate",
  receipt: "Payment Receipt",
  delivery_challan: "Delivery Challan",
  purchase_order: "Purchase Order",
};

export const BILL_TYPE_PREFIX: Record<BillType, string> = {
  gst_invoice: "INV",
  bill_of_supply: "BOS",
  cash_bill: "CB",
  proforma: "PI",
  quotation: "QT",
  receipt: "RCP",
  delivery_challan: "DC",
  purchase_order: "PO",
};
