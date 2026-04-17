import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { parseCSV, CSVRow, num, bool } from './csvParser';

// ─── Dataset keys ──────────────────────────────────────────────────────────────
export type DatasetKey =
  | 'kpis'
  | 'revenue_trend'
  | 'actuals_budget'
  | 'opex_variance'
  | 'cocoa_prices'
  | 'offtakers'
  | 'export_volume'
  | 'shipments'
  | 'cashflow'
  | 'ar_ageing'
  | 'ap_ageing'
  | 'inventory'
  | 'fx_gainloss'
  | 'fx_exposure'
  | 'forecasts_cf'
  | 'forecasts_price'
  | 'forecasts_fx';

export type PeriodMode = 'monthly' | 'quarterly' | 'yearly';

export interface UploadedFile {
  key: DatasetKey;
  filename: string;
  rowCount: number;
  uploadedAt: string;
}

interface DataContextValue {
  /** Raw parsed rows keyed by dataset */
  datasets: Partial<Record<DatasetKey, CSVRow[]>>;
  /** Upload metadata per dataset */
  uploads: Partial<Record<DatasetKey, UploadedFile>>;
  /** Load a CSV file for a given key */
  loadCSV: (key: DatasetKey, filename: string, text: string) => void;
  /** Remove a loaded dataset */
  removeDataset: (key: DatasetKey) => void;
  /** Convenience: typed row getter with fallback to default */
  getRows: (key: DatasetKey) => CSVRow[] | null;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Partial<Record<DatasetKey, CSVRow[]>>>({});
  const [uploads, setUploads] = useState<Partial<Record<DatasetKey, UploadedFile>>>({});

  const loadCSV = useCallback((key: DatasetKey, filename: string, text: string) => {
    const rows = parseCSV(text);
    setDatasets((prev) => ({ ...prev, [key]: rows }));
    setUploads((prev) => ({
      ...prev,
      [key]: {
        key,
        filename,
        rowCount: rows.length,
        uploadedAt: new Date().toLocaleTimeString(),
      },
    }));
  }, []);

  const removeDataset = useCallback((key: DatasetKey) => {
    setDatasets((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const getRows = useCallback((key: DatasetKey): CSVRow[] | null => {
    return datasets[key] ?? null;
  }, [datasets]);

  return (
    <DataContext.Provider value={{ datasets, uploads, loadCSV, removeDataset, getRows }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

// ─── Period filter utilities ─────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Parse month name or number to 1-12 */
function parseMonthNum(r: CSVRow): number {
  if (r.month_num) return num(r.month_num);
  if (r.month) {
    const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === String(r.month).toLowerCase().slice(0,3));
    return idx >= 0 ? idx + 1 : 0;
  }
  return 0;
}

/**
 * Filter rows by period, year, month/quarter.
 * Rows without year/quarter/month_num columns pass through in 'yearly' mode.
 */
export function filterByPeriod(
  rows: CSVRow[],
  mode: PeriodMode,
  year: number,
  month: number,
  quarter: number
): CSVRow[] {
  if (mode === 'yearly') {
    // Show all rows for the selected year; if no year column, show all
    return rows.filter(r => !r.year || num(r.year) === year);
  }
  if (mode === 'quarterly') {
    return rows.filter(r => {
      if (r.year && num(r.year) !== year) return false;
      if (r.quarter) return num(r.quarter) === quarter;
      // Fall back to month_num quartile derivation
      const m = parseMonthNum(r);
      return m > 0 ? Math.ceil(m / 3) === quarter : true;
    });
  }
  // monthly
  return rows.filter(r => {
    if (r.year && num(r.year) !== year) return false;
    const m = parseMonthNum(r);
    return m > 0 ? m === month : true;
  });
}

/**
 * For trend charts: returns the N months ending at [year, month] from combined data.
 * Useful for "last 6 months" slice of a monthly dataset.
 */
export function lastNMonths(rows: CSVRow[], year: number, month: number, n: number): CSVRow[] {
  // Build a sorted timeline index
  const indexed = rows
    .map(r => ({
      r,
      y: r.year ? num(r.year) : year,
      m: parseMonthNum(r),
    }))
    .filter(x => x.m > 0)
    .sort((a, b) => a.y !== b.y ? a.y - b.y : a.m - b.m);

  // Find the end index (latest month <= selected year/month)
  let end = indexed.length - 1;
  for (let i = indexed.length - 1; i >= 0; i--) {
    if (indexed[i].y < year || (indexed[i].y === year && indexed[i].m <= month)) {
      end = i;
      break;
    }
  }
  const start = Math.max(0, end - n + 1);
  return indexed.slice(start, end + 1).map(x => x.r);
}

/**
 * For trend charts in quarterly mode: returns 3 months of the quarter.
 */
export function quarterMonths(rows: CSVRow[], year: number, quarter: number): CSVRow[] {
  return rows.filter(r => {
    if (r.year && num(r.year) !== year) return false;
    if (r.quarter) return num(r.quarter) === quarter;
    const m = parseMonthNum(r);
    return m > 0 ? Math.ceil(m / 3) === quarter : true;
  }).sort((a, b) => parseMonthNum(a) - parseMonthNum(b));
}

// ─── Typed mappers — convert raw CSV rows to typed arrays ─────────────────────

export interface KPIRow {
  title: string; value: string; change: string; isPositive: boolean;
  subtitle: string; mtd: string; ytd: string; yoy: string;
}
export function mapKPIs(rows: CSVRow[]): KPIRow[] {
  return rows.map((r) => ({
    title: r.metric ?? '',
    value: r.value ?? '',
    change: r.change ?? '',
    isPositive: bool(r.is_positive),
    subtitle: r.subtitle ?? '',
    mtd: r.mtd ?? '',
    ytd: r.ytd ?? '',
    yoy: r.yoy ?? '',
  }));
}

export interface TrendRow { month: string; revenue: number; ebitda: number }
export function mapRevenueTrend(rows: CSVRow[]): TrendRow[] {
  return rows.map((r) => ({ month: r.month, revenue: num(r.revenue), ebitda: num(r.ebitda) }));
}

export interface BudgetRow { metric: string; actual: number; budget: number; sply: number }
export function mapActualsBudget(rows: CSVRow[]): BudgetRow[] {
  return rows.map((r) => ({ metric: r.metric, actual: num(r.actual), budget: num(r.budget), sply: num(r.sply) }));
}

export interface OpexRow { category: string; variance: number; overspend: boolean }
export function mapOpexVariance(rows: CSVRow[]): OpexRow[] {
  return rows.map((r) => ({ category: r.category, variance: num(r.variance), overspend: bool(r.overspend) }));
}

export interface PriceRow { month: string; global: number; company: number; margin?: number }
export function mapCocoaPrices(rows: CSVRow[]): PriceRow[] {
  return rows.map((r) => ({
    month: r.month, global: num(r.global), company: num(r.company),
    margin: r.margin ? num(r.margin) : undefined,
  }));
}

export interface OfftakerRow { name: string; volume: number; revenue: number }
export function mapOfftakers(rows: CSVRow[]): OfftakerRow[] {
  return rows.map((r) => ({ name: r.name, volume: num(r.volume), revenue: num(r.revenue) }));
}

export interface ExportVolumeRow { month: string; volume: number }
export function mapExportVolume(rows: CSVRow[]): ExportVolumeRow[] {
  return rows.map((r) => ({ month: r.month, volume: num(r.volume) }));
}

export interface ShipmentRow { month: string; dispatched: number; delayed: number }
export function mapShipments(rows: CSVRow[]): ShipmentRow[] {
  return rows.map((r) => ({ month: r.month, dispatched: num(r.dispatched), delayed: num(r.delayed) }));
}

export interface CashflowRow { name: string; value: number; base: number; color: string; isTotal?: boolean }
export function mapCashflow(rows: CSVRow[]): CashflowRow[] {
  return rows.map((r) => ({
    name: r.name, value: num(r.value), base: num(r.base),
    color: r.color || '#3b82f6', isTotal: bool(r.is_total),
  }));
}

export interface AgeingRow { bucket: string; amount: number }
export function mapAgeing(rows: CSVRow[]): AgeingRow[] {
  return rows.map((r) => ({ bucket: r.bucket, amount: num(r.amount) }));
}

export interface InventoryRow { category: string; stock: number; demand: number; value: number }
export function mapInventory(rows: CSVRow[]): InventoryRow[] {
  return rows.map((r) => ({ category: r.category, stock: num(r.stock), demand: num(r.demand), value: num(r.value) }));
}

export interface FxGainLossRow { month: string; realized: number; unrealized: number }
export function mapFxGainLoss(rows: CSVRow[]): FxGainLossRow[] {
  return rows.map((r) => ({ month: r.month, realized: num(r.realized), unrealized: num(r.unrealized) }));
}

export interface FxExposureRow { name: string; value: number; color: string }
export function mapFxExposure(rows: CSVRow[]): FxExposureRow[] {
  return rows.map((r) => ({ name: r.name, value: num(r.value), color: r.color || '#10b981' }));
}

export interface ForecastRow { month: string; base: number; high: number; low: number }
export function mapForecast(rows: CSVRow[]): ForecastRow[] {
  return rows.map((r) => ({ month: r.month, base: num(r.base), high: num(r.high), low: num(r.low) }));
}
