/**
 * fmt.ts — shared number formatting utilities for the GTBank CFO Dashboard.
 *
 * All monetary values coming from the GL are in RAW NAIRA (not billions).
 * e.g. Interest income of ₦1,554,000,000,000 should display as ₦1.55tn
 *
 * Usage:
 *   fmtNGN(1_554_000_000_000)   → "₦1.55tn"
 *   fmtNGN(45_000_000_000)      → "₦45.00bn"
 *   fmtNGN(900_000_000)         → "₦900.00mn"
 *   fmtPct(34.56)               → "34.6%"
 *   fmtNum(8_200_000)           → "8.20mn"
 */

/** Format a raw naira amount into the most readable scale (tn / bn / mn) */
export function fmtNGN(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e12) return `${sign}₦${(abs / 1e12).toFixed(decimals)}tn`;
  if (abs >= 1e9)  return `${sign}₦${(abs / 1e9).toFixed(decimals)}bn`;
  if (abs >= 1e6)  return `${sign}₦${(abs / 1e6).toFixed(decimals)}mn`;
  return `${sign}₦${abs.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

/** Format a ratio / percentage value to 1 decimal place */
export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a plain number (customers, headcount etc.) with scale suffix */
export function fmtNum(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}tn`;
  if (abs >= 1e9)  return `${sign}${(abs / 1e9).toFixed(decimals)}bn`;
  if (abs >= 1e6)  return `${sign}${(abs / 1e6).toFixed(decimals)}mn`;
  if (abs >= 1e3)  return `${sign}${(abs / 1e3).toFixed(decimals)}k`;
  return `${sign}${abs.toLocaleString('en-NG')}`;
}

/** Short NGN: no decimals for very large numbers (e.g. panel cards) */
export function fmtNGNShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}₦${(abs / 1e12).toFixed(2)}tn`;
  if (abs >= 1e9)  return `${sign}₦${(abs / 1e9).toFixed(1)}bn`;
  if (abs >= 1e6)  return `${sign}₦${(abs / 1e6).toFixed(1)}mn`;
  return `${sign}₦${abs.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

/** Percentage change between two values */
export function pctChange(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
}
