/**
 * Common HSN/SAC starter list to speed up product entry.
 * Extend anytime — this is a UX helper, not a legal source of truth.
 */
export interface HsnEntry {
  code: string;
  description: string;
  gst: number; // default GST rate suggestion
  kind: "HSN" | "SAC";
}

export const HSN_STARTER: HsnEntry[] = [
  { code: "1006", description: "Rice", gst: 5, kind: "HSN" },
  { code: "1701", description: "Sugar", gst: 5, kind: "HSN" },
  { code: "1905", description: "Bakery / Biscuits", gst: 18, kind: "HSN" },
  { code: "2202", description: "Aerated / Bottled beverages", gst: 28, kind: "HSN" },
  { code: "3004", description: "Medicaments", gst: 12, kind: "HSN" },
  { code: "3401", description: "Soap", gst: 18, kind: "HSN" },
  { code: "4820", description: "Stationery / Notebooks", gst: 12, kind: "HSN" },
  { code: "6109", description: "T-shirts, singlets", gst: 12, kind: "HSN" },
  { code: "6403", description: "Footwear", gst: 18, kind: "HSN" },
  { code: "7113", description: "Jewellery of precious metal", gst: 3, kind: "HSN" },
  { code: "8415", description: "Air conditioning machines", gst: 28, kind: "HSN" },
  { code: "8471", description: "Computers / Laptops", gst: 18, kind: "HSN" },
  { code: "8517", description: "Mobile phones", gst: 18, kind: "HSN" },
  { code: "9403", description: "Furniture", gst: 18, kind: "HSN" },
  { code: "9503", description: "Toys", gst: 12, kind: "HSN" },
  // SAC (services)
  { code: "9954", description: "Construction services", gst: 18, kind: "SAC" },
  { code: "9963", description: "Accommodation / Food service", gst: 5, kind: "SAC" },
  { code: "9964", description: "Passenger transport", gst: 5, kind: "SAC" },
  { code: "9965", description: "Goods transport", gst: 5, kind: "SAC" },
  { code: "9971", description: "Financial & related services", gst: 18, kind: "SAC" },
  { code: "9983", description: "Consultancy / Professional services", gst: 18, kind: "SAC" },
  { code: "9984", description: "Telecommunications", gst: 18, kind: "SAC" },
  { code: "9987", description: "Maintenance & repair", gst: 18, kind: "SAC" },
  { code: "998311", description: "IT consulting / Software development", gst: 18, kind: "SAC" },
  { code: "998314", description: "Web / Application design", gst: 18, kind: "SAC" },
  { code: "998399", description: "Other professional services", gst: 18, kind: "SAC" },
];

export const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];
