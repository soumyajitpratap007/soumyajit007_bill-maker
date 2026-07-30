import { forwardRef } from "react";
import type { Bill, TemplateId } from "@/lib/types";
import { computeBillTotals, isInterState } from "@/lib/indian/tax";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { CorporateTemplate } from "./templates/CorporateTemplate";
import { GstCompactTemplate } from "./templates/GstCompactTemplate";

interface Props { bill: Bill; className?: string; }

export const BillRenderer = forwardRef<HTMLDivElement, Props>(function BillRenderer({ bill, className }, ref) {
  const interState = isInterState(bill.business?.address?.stateCode ?? "", bill.placeOfSupplyCode ?? "");
  const totals = computeBillTotals(bill.items, {
    interState,
    extraDiscount: bill.extraDiscount,
    extraDiscountType: bill.extraDiscountType,
    shippingCharge: bill.shippingCharge,
    roundOff: bill.roundOff,
  });
  const props = { bill, totals, interState };
  return (
    <div ref={ref} className={className}>
      {renderByTemplate(bill.templateId, props)}
    </div>
  );
});

function renderByTemplate(id: TemplateId, props: { bill: Bill; totals: ReturnType<typeof computeBillTotals>; interState: boolean }) {
  switch (id) {
    case "modern": return <ModernTemplate {...props} />;
    case "minimal": return <MinimalTemplate {...props} />;
    case "corporate": return <CorporateTemplate {...props} />;
    case "gst_compact": return <GstCompactTemplate {...props} />;
    case "classic":
    default:
      return <ClassicTemplate {...props} />;
  }
}

export const TEMPLATE_OPTIONS: { id: TemplateId; name: string; accent: string }[] = [
  { id: "classic", name: "Classic", accent: "#1e3a8a" },
  { id: "modern", name: "Modern", accent: "#0f766e" },
  { id: "minimal", name: "Minimal", accent: "#334155" },
  { id: "corporate", name: "Corporate", accent: "#9a3412" },
  { id: "gst_compact", name: "GST Compact", accent: "#4c1d95" },
];
