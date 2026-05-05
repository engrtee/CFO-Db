/**
 * fmt.ts — shared number formatting utilities for the Leadway CFO Dashboard.
 *
 * All monetary values are stored in RAW NAIRA (not billions).
 * Usage:
 *   fmtNGN(45_000_000_000)   → "₦45.00bn"
 *   fmtNGN(900_000_000)      → "₦900.00mn"
 *   fmtPct(34.56)            → "34.6%"
 *   fmtCcy(val,'USD')        → "$29.00m"
 */

const USD_RATE = 1555; // CBN reference rate (NGN per 1 USD)

/** Format a raw Naira value into USD for the currency toggle */
export function fmtUSD(valueNGN: number): string {
  const usd = valueNGN / USD_RATE;
  const abs = Math.abs(usd);
  const sign = usd < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}m`;
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Format based on the active currency toggle */
export function fmtCcy(valueNGN: number, currency: 'NGN' | 'USD'): string {
  return currency === 'USD' ? fmtUSD(valueNGN) : fmtNGN(valueNGN);
}

/** Compact label for chart Y-axis ticks */
export function fmtAxisNGN(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `₦${(abs / 1e9).toFixed(0)}bn`;
  if (abs >= 1e6) return `₦${(abs / 1e6).toFixed(0)}m`;
  return `₦${abs.toFixed(0)}`;
}

/** Days with singular/plural suffix */
export function fmtDays(days: number): string {
  const d = Math.round(days);
  return `${d} ${d === 1 ? 'day' : 'days'}`;
}

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
