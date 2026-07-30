/**
 * Indian States & UTs with GSTIN state codes.
 * Source: CBIC state code list used inside GSTIN (first 2 chars).
 */
export interface IndianState {
  code: string; // 2-digit GSTIN state code
  name: string;
  short: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "01", name: "Jammu and Kashmir", short: "JK" },
  { code: "02", name: "Himachal Pradesh", short: "HP" },
  { code: "03", name: "Punjab", short: "PB" },
  { code: "04", name: "Chandigarh", short: "CH" },
  { code: "05", name: "Uttarakhand", short: "UK" },
  { code: "06", name: "Haryana", short: "HR" },
  { code: "07", name: "Delhi", short: "DL" },
  { code: "08", name: "Rajasthan", short: "RJ" },
  { code: "09", name: "Uttar Pradesh", short: "UP" },
  { code: "10", name: "Bihar", short: "BR" },
  { code: "11", name: "Sikkim", short: "SK" },
  { code: "12", name: "Arunachal Pradesh", short: "AR" },
  { code: "13", name: "Nagaland", short: "NL" },
  { code: "14", name: "Manipur", short: "MN" },
  { code: "15", name: "Mizoram", short: "MZ" },
  { code: "16", name: "Tripura", short: "TR" },
  { code: "17", name: "Meghalaya", short: "ML" },
  { code: "18", name: "Assam", short: "AS" },
  { code: "19", name: "West Bengal", short: "WB" },
  { code: "20", name: "Jharkhand", short: "JH" },
  { code: "21", name: "Odisha", short: "OD" },
  { code: "22", name: "Chhattisgarh", short: "CG" },
  { code: "23", name: "Madhya Pradesh", short: "MP" },
  { code: "24", name: "Gujarat", short: "GJ" },
  { code: "25", name: "Daman and Diu", short: "DD" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu", short: "DN" },
  { code: "27", name: "Maharashtra", short: "MH" },
  { code: "28", name: "Andhra Pradesh (Old)", short: "AP1" },
  { code: "29", name: "Karnataka", short: "KA" },
  { code: "30", name: "Goa", short: "GA" },
  { code: "31", name: "Lakshadweep", short: "LD" },
  { code: "32", name: "Kerala", short: "KL" },
  { code: "33", name: "Tamil Nadu", short: "TN" },
  { code: "34", name: "Puducherry", short: "PY" },
  { code: "35", name: "Andaman and Nicobar Islands", short: "AN" },
  { code: "36", name: "Telangana", short: "TS" },
  { code: "37", name: "Andhra Pradesh", short: "AP" },
  { code: "38", name: "Ladakh", short: "LA" },
  { code: "97", name: "Other Territory", short: "OT" },
  { code: "99", name: "Centre Jurisdiction", short: "CJ" },
];

export function findStateByCode(code: string): IndianState | undefined {
  return INDIAN_STATES.find((s) => s.code === code);
}

export function findStateByName(name: string): IndianState | undefined {
  const n = name.trim().toLowerCase();
  return INDIAN_STATES.find((s) => s.name.toLowerCase() === n || s.short.toLowerCase() === n);
}
