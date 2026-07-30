import type { Bill } from "@/lib/types";
import type { BillTotals } from "@/lib/indian/tax";

export interface TemplateProps {
  bill: Bill;
  totals: BillTotals;
  interState: boolean;
}
