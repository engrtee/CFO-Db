import type { ComputedKPIRow } from '../types/financial.types';
import type { RAGStatus } from '../types/subsidiary.types';

const period = '2025-Q1';
const computed = '2025-04-30T06:00:00Z';

const mk = (
  id: string, sub: ComputedKPIRow['subsidiary_code'],
  name: string, value: number, unit: string,
  rag: RAGStatus, tMin: number, tMax: number
): ComputedKPIRow => ({
  kpi_id: id, subsidiary_code: sub, reporting_period: period,
  kpi_name: name, kpi_value: value, kpi_unit: unit,
  rag_status: rag, threshold_min: tMin, threshold_max: tMax,
  last_computed: computed,
});

export const computedKPIStore: ComputedKPIRow[] = [
  // ── LWL ───────────────────────────────────────────────────────────────────
  mk('KPI-001','LWL','loss_ratio',              55.2,  '%',     'Green', 0,    70),
  mk('KPI-002','LWL','expense_ratio',           22.8,  '%',     'Green', 0,    30),
  mk('KPI-003','LWL','combined_ratio',          78.0,  '%',     'Green', 0,   100),
  mk('KPI-004','LWL','solvency_margin_ratio',   22.0,  '%',     'Green', 15,   999),
  mk('KPI-005','LWL','prescribed_assets_ratio', 68.5,  '%',     'Green', 50,   999),
  mk('KPI-006','LWL','claims_paying_ability',   245.0, '%',     'Green', 100,  999),
  mk('KPI-007','LWL','capital_headroom',        18_000_000_000, 'NGN',   'Green', 0, 999_999_999_999),
  mk('KPI-008','LWL','mer',                     11.8,  '%',     'Green', 0,    20),

  // ── LWG ───────────────────────────────────────────────────────────────────
  mk('KPI-009','LWG','loss_ratio',              62.4,  '%',     'Green', 0,    70),
  mk('KPI-010','LWG','expense_ratio',           24.5,  '%',     'Green', 0,    30),
  mk('KPI-011','LWG','combined_ratio',          86.9,  '%',     'Green', 0,   100),
  mk('KPI-012','LWG','solvency_margin_ratio',   19.0,  '%',     'Amber', 15,   999),
  mk('KPI-013','LWG','prescribed_assets_ratio', 61.2,  '%',     'Green', 50,   999),
  mk('KPI-014','LWG','claims_paying_ability',   185.0, '%',     'Green', 100,  999),
  mk('KPI-015','LWG','capital_headroom',        13_000_000_000, 'NGN',   'Amber', 0, 999_999_999_999),
  mk('KPI-016','LWG','mer',                     14.2,  '%',     'Green', 0,    20),

  // ── LWC ───────────────────────────────────────────────────────────────────
  mk('KPI-017','LWC','investment_yield',         17.8, '%',     'Green', 12,   999),
  mk('KPI-018','LWC','aum_growth',               12.4, '%',     'Green', 0,    999),
  mk('KPI-019','LWC','prescribed_assets_ratio',  55.0, '%',     'Green', 0,    999),
  mk('KPI-020','LWC','expense_ratio',            14.8, '%',     'Green', 0,    25),

  // ── LWH ───────────────────────────────────────────────────────────────────
  mk('KPI-021','LWH','loss_ratio',              78.2,  '%',     'Amber', 0,    75),
  mk('KPI-022','LWH','expense_ratio',           18.5,  '%',     'Green', 0,    30),
  mk('KPI-023','LWH','combined_ratio',          96.7,  '%',     'Amber', 0,   100),
  mk('KPI-024','LWH','solvency_margin_ratio',   16.5,  '%',     'Amber', 15,   999),
  mk('KPI-025','LWH','prescribed_assets_ratio', 48.2,  '%',     'Red',   50,   999),
  mk('KPI-026','LWH','claims_paying_ability',   105.0, '%',     'Amber', 100,  999),
  mk('KPI-027','LWH','capital_headroom',        3_000_000_000,  'NGN',   'Amber', 0, 999_999_999_999),
  mk('KPI-028','LWH','mer',                     18.5,  '%',     'Amber', 0,    20),

  // ── LWT ───────────────────────────────────────────────────────────────────
  mk('KPI-029','LWT','revenue_growth',           8.5,  '%',     'Green', 0,    999),
  mk('KPI-030','LWT','ebitda_margin',           22.0,  '%',     'Green', 15,   999),
  mk('KPI-031','LWT','occupancy_rate',          74.5,  '%',     'Green', 60,   999),

  // ── LWP ───────────────────────────────────────────────────────────────────
  mk('KPI-032','LWP','rental_yield',            8.2,   '%',     'Green', 6,    999),
  mk('KPI-033','LWP','portfolio_occupancy',     91.0,  '%',     'Green', 80,   999),
  mk('KPI-034','LWP','revenue_growth',          9.8,   '%',     'Green', 0,    999),

  // ── LWN ───────────────────────────────────────────────────────────────────
  mk('KPI-035','LWN','rbc_ratio',              145.0,  '%',     'Green', 100,  999),
  mk('KPI-036','LWN','aum_growth',              18.2,  '%',     'Green', 0,    999),
  mk('KPI-037','LWN','prescribed_assets_ratio', 72.8,  '%',     'Green', 60,   999),
  mk('KPI-038','LWN','expense_ratio',           12.5,  '%',     'Green', 0,    20),

  // ── Group / Consolidated ──────────────────────────────────────────────────
  mk('KPI-039','ALL','group_gwp_growth',        14.8,  '%',     'Green', 10,   999),
  mk('KPI-040','ALL','group_pat',  8_250_000_000, 'NGN','Green', 0,    999_999_999_999),
  mk('KPI-041','ALL','group_roe',               18.5,  '%',     'Green', 15,   999),
  mk('KPI-042','ALL','group_prescribed_assets', 63.0,  '%',     'Green', 50,   999),
  mk('KPI-043','ALL','group_combined_ratio',    88.5,  '%',     'Green', 0,   100),
];
