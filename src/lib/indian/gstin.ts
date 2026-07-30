/**
 * GSTIN utilities.
 *
 * GSTIN is 15 chars: 2 state code + 10 PAN + 1 entity + 1 'Z' + 1 checksum
 * Checksum is base-36 mod 36 over the first 14 chars.
 */
import { findStateByCode, type IndianState } from "./states";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isGstinFormatValid(gstin: string): boolean {
  return GSTIN_REGEX.test(gstin.toUpperCase());
}

export function computeGstinChecksum(gstin14: string): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  const upper = gstin14.toUpperCase();
  for (let i = 0; i < 14; i++) {
    const value = chars.indexOf(upper[i]);
    if (value < 0) return "";
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const remainder = sum % 36;
  const checkCode = (36 - remainder) % 36;
  return chars[checkCode];
}

export function isGstinValid(gstin: string): boolean {
  const g = gstin.toUpperCase().trim();
  if (!isGstinFormatValid(g)) return false;
  return computeGstinChecksum(g.slice(0, 14)) === g[14];
}

export interface ParsedGstin {
  gstin: string;
  stateCode: string;
  state?: IndianState;
  pan: string;
  entityCode: string;
  checkCode: string;
  valid: boolean;
}

export function parseGstin(gstin: string): ParsedGstin | null {
  const g = gstin.toUpperCase().trim();
  if (g.length !== 15) return null;
  return {
    gstin: g,
    stateCode: g.slice(0, 2),
    state: findStateByCode(g.slice(0, 2)),
    pan: g.slice(2, 12),
    entityCode: g.slice(12, 13),
    checkCode: g.slice(14),
    valid: isGstinValid(g),
  };
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export function isPanValid(pan: string): boolean {
  return PAN_REGEX.test(pan.toUpperCase().trim());
}
