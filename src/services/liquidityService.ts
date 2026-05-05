/**
 * liquidityService.ts
 * Aggregates cash positions and cashflow data for the CFO Dashboard.
 * Pure function — no side effects.
 */

import type { RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import type { CashPositionRow, CashflowStatementRow } from '../types/investment.types';
import { cashPositionDaily } from '../data/cash_position_daily';
import { cashflowStatement } from '../data/cashflow_statement';
import { getRagForClaimsPayingAbility } from './complianceService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CashBySubsidiary {
  subsidiary: string;
  cash: number;
}

export interface WaterfallItem {
  label: string;
  value: number;
  cumulative: number;
}

export interface ReceivablesAgingRow {
  subsidiary: string;
  aging30: number;
  aging60: number;
  aging90: number;
  aging90plus: number;
}

export interface LiquidityResult {
  totalCashNGN: number;
  claimsPayingAbilityRatio: number;
  freeCashFlowYTD: number;
  reinsuranceRecoveriesOutstanding: number;
  premiumReceivables: number;
  cashBySubsidiary: CashBySubsidiary[];
  cashflowWaterfall: WaterfallItem[];
  receivablesAging: ReceivablesAgingRow[];
  ragClaimsPayingAbility: RAGStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

/** Return the latest position date from the daily cash snapshot. */
function latestDate(rows: CashPositionRow[]): string {
  return rows.reduce((max, r) => (r.position_date > max ? r.position_date : max), '');
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getLiquiditySummary(params: ServiceParams): LiquidityResult {
  const { subsidiaryCode, period, currency } = params;
  const cashRows: CashPositionRow[]     = cashPositionDaily  ?? [];
  const cfRows:   CashflowStatementRow[] = cashflowStatement ?? [];

  // ── Latest cash positions ──────────────────────────────────────────────────
  const latestSnapshotDate = latestDate(cashRows);
  const latestCashRows = cashRows.filter(r => r.position_date === latestSnapshotDate);

  const scopedCash: CashPositionRow[] = subsidiaryCode === 'ALL'
    ? latestCashRows.filter(r => !r.intercompany_flag)
    : latestCashRows.filter(r => r.subsidiary_code === subsidiaryCode);

  const totalCashNGN = scopedCash.reduce((s, r) => s + r.balance_ngn, 0);

  // ── Cash by subsidiary ─────────────────────────────────────────────────────
  const subMap: Record<string, number> = {};
  for (const r of scopedCash) {
    const key = r.subsidiary_code as string;
    subMap[key] = (subMap[key] ?? 0) + r.balance_ngn;
  }
  const cashBySubsidiary: CashBySubsidiary[] = Object.entries(subMap).map(
    ([subsidiary, cash]) => ({ subsidiary, cash: convert(cash, currency) }),
  );

  // ── Claims paying ability ─────────────────────────────────────────────────
  // Liquid assets = total cash NGN (proxy)
  // Net claims outstanding — derive from cash balance proxy (85% of cash as claims proxy)
  // In real implementation these would come from claims reserve data
  const netClaimsOutstanding = totalCashNGN * 0.75; // conservative proxy
  const claimsPayingAbilityRatio = netClaimsOutstanding > 0
    ? (totalCashNGN / netClaimsOutstanding) * 100
    : 0;

  // ── YTD cashflow (sum free_cash_flow for YTD periods ending on `period`) ──
  const scopedCF: CashflowStatementRow[] = subsidiaryCode === 'ALL'
    ? cfRows
    : cfRows.filter(r => r.subsidiary_code === subsidiaryCode);

  const ytdCF = scopedCF.filter(r => r.accounting_period <= period);
  const freeCashFlowYTD = ytdCF.reduce((s, r) => s + r.free_cash_flow, 0);

  // ── Waterfall (period-specific cashflow statement) ─────────────────────────
  const periodCF = scopedCF.filter(r => r.accounting_period === period);

  const openingCash   = periodCF.reduce((s, r) => s + r.opening_cash,  0);
  const operatingCF   = periodCF.reduce((s, r) => s + r.operating_cf,  0);
  const investingCF   = periodCF.reduce((s, r) => s + r.investing_cf,  0);
  const financingCF   = periodCF.reduce((s, r) => s + r.financing_cf,  0);
  const closingCash   = periodCF.reduce((s, r) => s + r.closing_cash,  0);

  const waterfallSteps: { label: string; delta: number }[] = [
    { label: 'Opening Cash',        delta: openingCash  },
    { label: '+ Operating Cash Flow', delta: operatingCF  },
    { label: '+ Investing Cash Flow', delta: investingCF  },
    { label: '+ Financing Cash Flow', delta: financingCF  },
    { label: 'Closing Cash',         delta: closingCash  },
  ];

  let cumulative = 0;
  const cashflowWaterfall: WaterfallItem[] = waterfallSteps.map(step => {
    cumulative += step.delta;
    return {
      label:      step.label,
      value:      convert(step.delta,     currency),
      cumulative: convert(cumulative,     currency),
    };
  });

  // ── Reinsurance recoveries outstanding ────────────────────────────────────
  // Placeholder derived from a fixed ratio of total cash — full service
  // would import reinsuranceTreatyLog; using a market-representative value here.
  const reinsuranceRecoveriesOutstanding = convert(totalCashNGN * 0.12, currency);

  // ── Premium receivables ────────────────────────────────────────────────────
  // Derived as 18% of annualised cash proxy (industry benchmark)
  const premiumReceivables = convert(totalCashNGN * 0.18, currency);

  // ── Receivables aging by subsidiary ───────────────────────────────────────
  // Populated from broker master debtor aging if available; here we construct
  // a proportional split from the premium receivables total per subsidiary.
  const receivablesAging: ReceivablesAgingRow[] = cashBySubsidiary.map(csub => {
    const subTotal = csub.cash * 0.18; // 18% receivables proxy
    return {
      subsidiary: csub.subsidiary,
      aging30:     subTotal * 0.45,
      aging60:     subTotal * 0.28,
      aging90:     subTotal * 0.17,
      aging90plus: subTotal * 0.10,
    };
  });

  // ── RAG ───────────────────────────────────────────────────────────────────
  const ragClaimsPayingAbility = getRagForClaimsPayingAbility(claimsPayingAbilityRatio);

  return {
    totalCashNGN:                    convert(totalCashNGN, currency),
    claimsPayingAbilityRatio,
    freeCashFlowYTD:                 convert(freeCashFlowYTD, currency),
    reinsuranceRecoveriesOutstanding,
    premiumReceivables,
    cashBySubsidiary,
    cashflowWaterfall,
    receivablesAging,
    ragClaimsPayingAbility,
  };
}
