/**
 * financialService.ts
 * Aggregates the Income Statement GL into a typed financial summary.
 * Pure function — no side effects.
 */

import type { SubsidiaryCode, RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import type { IncomeStatementGLRow } from '../types/financial.types';
import { incomeStatementGL } from '../data/income_statement_gl';
import {
  getRagForLossRatio,
  getRagForCombinedRatio,
  getRagForMER,
} from './complianceService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  period: string;
  gwp: number;
  nep: number;
  claims: number;
  pat: number;
}

export interface PLVarianceRow {
  account: string;
  actual: number;
  budget: number;
  varianceNgn: number;
  variancePct: number;
  priorYear: number;
  yoyPct: number;
  rag: RAGStatus;
}

export interface FinancialResult {
  gwp: number;
  reinsuranceCeded: number;
  netRetentionRatio: number;
  nep: number;
  claimsIncurred: number;
  lossRatio: number;
  managementExpenses: number;
  mer: number;
  combinedRatio: number;
  underwritingProfit: number;
  investmentIncome: number;
  pbt: number;
  tax: number;
  pat: number;
  budgetGwp: number;
  budgetVariancePct: number;
  priorYearGwp: number;
  yoyGrowthPct: number;
  monthlyTrend: MonthlyPoint[];
  plVarianceTable: PLVarianceRow[];
  ragLossRatio: RAGStatus;
  ragCombinedRatio: RAGStatus;
  ragMER: RAGStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const LIFE_SUBS: SubsidiaryCode[] = ['LWL'];

/** Determine whether a subsidiary is classified as life for RAG purposes. */
function isLifeSub(code: SubsidiaryCode): boolean {
  return LIFE_SUBS.includes(code);
}

/** Return the sign-adjusted RAG for a P&L variance row (favourable = Green). */
function ragForVariance(variancePct: number, isRevenueItem: boolean): RAGStatus {
  const favourable = isRevenueItem ? variancePct >= 0 : variancePct <= 0;
  const threshold10 = isRevenueItem ? -10 : 10;
  if (favourable)                                      return 'Green';
  if (Math.abs(variancePct) <= Math.abs(threshold10))  return 'Amber';
  return 'Red';
}

/** Sum a field across rows filtered to a specific account code. */
function sumField(
  rows: IncomeStatementGLRow[],
  accountCode: string,
  field: keyof Pick<
    IncomeStatementGLRow,
    'actual_amount' | 'budget_amount' | 'prior_year_amount' | 'ytd_actual' | 'ytd_budget'
  >,
): number {
  return rows
    .filter(r => r.account_code === accountCode)
    .reduce((acc, r) => acc + r[field], 0);
}

/** Apply currency conversion to a single numeric value. */
function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

/** Filter GL rows to the requested subsidiary/period scope. */
function filterRows(
  rows: IncomeStatementGLRow[],
  subsidiaryCode: SubsidiaryCode,
  period: string,
): IncomeStatementGLRow[] {
  return rows.filter(r => {
    const periodMatch = r.accounting_period === period;
    if (!periodMatch) return false;
    if (subsidiaryCode === 'ALL') return r.intercompany_elimination === 0;
    return r.subsidiary_code === subsidiaryCode;
  });
}

/** Filter GL rows to all periods for a given subsidiary (used for trend). */
function filterRowsAllPeriods(
  rows: IncomeStatementGLRow[],
  subsidiaryCode: SubsidiaryCode,
): IncomeStatementGLRow[] {
  if (subsidiaryCode === 'ALL') return rows.filter(r => r.intercompany_elimination === 0);
  return rows.filter(r => r.subsidiary_code === subsidiaryCode);
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getFinancialSummary(params: ServiceParams): FinancialResult {
  const { subsidiaryCode, period, currency } = params;
  const gl = incomeStatementGL ?? [];

  // ── Period-level rows ─────────────────────────────────────────────────────
  const periodRows = filterRows(gl, subsidiaryCode, period);

  const gwpRaw            = sumField(periodRows, '4001', 'actual_amount');
  const cedRaw            = Math.abs(sumField(periodRows, '4002', 'actual_amount'));
  const nepFromGL         = sumField(periodRows, '4003', 'actual_amount');
  const nep               = nepFromGL > 0 ? nepFromGL : gwpRaw - cedRaw;
  const claims1           = Math.abs(sumField(periodRows, '5001', 'actual_amount'));
  const claims2           = Math.abs(sumField(periodRows, '5002', 'actual_amount'));
  const claimsIncurred    = claims1 + claims2;
  const commissionExp     = sumField(periodRows, '6001', 'actual_amount');
  const mgmtExp           = sumField(periodRows, '6002', 'actual_amount');
  const managementExpenses = commissionExp + mgmtExp;
  const investmentIncome  = sumField(periodRows, '7001', 'actual_amount');
  const otherIncome       = sumField(periodRows, '8001', 'actual_amount');
  const taxRaw            = Math.abs(sumField(periodRows, '9001', 'actual_amount'));

  const lossRatio        = nep > 0 ? (claimsIncurred / nep) * 100 : 0;
  const mer              = nep > 0 ? (managementExpenses / nep) * 100 : 0;
  const combinedRatio    = lossRatio + mer;
  const underwritingProfit = nep - claimsIncurred - managementExpenses;
  const pbt              = underwritingProfit + investmentIncome + otherIncome;
  const pat              = pbt - taxRaw;
  const netRetentionRatio = gwpRaw > 0 ? ((gwpRaw - cedRaw) / gwpRaw) * 100 : 0;

  // ── Budget & prior year ───────────────────────────────────────────────────
  const budgetGwp     = sumField(periodRows, '4001', 'budget_amount');
  const priorYearGwp  = sumField(periodRows, '4001', 'prior_year_amount');
  const budgetVariancePct = budgetGwp > 0 ? ((gwpRaw - budgetGwp) / budgetGwp) * 100 : 0;
  const yoyGrowthPct  = priorYearGwp > 0 ? ((gwpRaw - priorYearGwp) / priorYearGwp) * 100 : 0;

  // ── Monthly trend ─────────────────────────────────────────────────────────
  const allRows = filterRowsAllPeriods(gl, subsidiaryCode);
  const periodSet = [...new Set(allRows.map(r => r.accounting_period))].sort();

  const monthlyTrend: MonthlyPoint[] = periodSet.map(p => {
    const pRows = allRows.filter(r => r.accounting_period === p);
    const tGwp     = sumField(pRows, '4001', 'actual_amount');
    const tNepGL   = sumField(pRows, '4003', 'actual_amount');
    const tCed     = Math.abs(sumField(pRows, '4002', 'actual_amount'));
    const tNep     = tNepGL > 0 ? tNepGL : tGwp - tCed;
    const tClaims  = Math.abs(sumField(pRows, '5001', 'actual_amount'))
                   + Math.abs(sumField(pRows, '5002', 'actual_amount'));
    const tInvInc  = sumField(pRows, '7001', 'actual_amount');
    const tOther   = sumField(pRows, '8001', 'actual_amount');
    const tComm    = sumField(pRows, '6001', 'actual_amount');
    const tMgmt    = sumField(pRows, '6002', 'actual_amount');
    const tTax     = Math.abs(sumField(pRows, '9001', 'actual_amount'));
    const tUW      = tNep - tClaims - (tComm + tMgmt);
    const tPbt     = tUW + tInvInc + tOther;
    const tPat     = tPbt - tTax;

    return {
      period: p,
      gwp:    convert(tGwp,    currency),
      nep:    convert(tNep,    currency),
      claims: convert(tClaims, currency),
      pat:    convert(tPat,    currency),
    };
  });

  // ── P&L variance table ────────────────────────────────────────────────────
  const accountDefs: { code: string; name: string; isRevenue: boolean }[] = [
    { code: '4001', name: 'Gross Written Premium',    isRevenue: true  },
    { code: '4002', name: 'Reinsurance Ceded',        isRevenue: false },
    { code: '4003', name: 'Net Earned Premium',       isRevenue: true  },
    { code: '5001', name: 'Claims Incurred',          isRevenue: false },
    { code: '5002', name: 'IBNR Movement',            isRevenue: false },
    { code: '6001', name: 'Commission Expense',       isRevenue: false },
    { code: '6002', name: 'Management Expenses',      isRevenue: false },
    { code: '7001', name: 'Investment Income',        isRevenue: true  },
    { code: '8001', name: 'Other Income',             isRevenue: true  },
    { code: '9001', name: 'Income Tax',               isRevenue: false },
  ];

  const plVarianceTable: PLVarianceRow[] = accountDefs.map(def => {
    const actual     = sumField(periodRows, def.code, 'actual_amount');
    const budget     = sumField(periodRows, def.code, 'budget_amount');
    const priorYear  = sumField(periodRows, def.code, 'prior_year_amount');
    const variance   = actual - budget;
    const variancePct = budget !== 0 ? (variance / Math.abs(budget)) * 100 : 0;
    const yoyPct     = priorYear !== 0 ? ((actual - priorYear) / Math.abs(priorYear)) * 100 : 0;

    return {
      account:      def.name,
      actual:       convert(actual,    currency),
      budget:       convert(budget,    currency),
      varianceNgn:  convert(variance,  currency),
      variancePct,
      priorYear:    convert(priorYear, currency),
      yoyPct,
      rag:          ragForVariance(variancePct, def.isRevenue),
    };
  });

  // ── RAG ───────────────────────────────────────────────────────────────────
  const isLife = isLifeSub(subsidiaryCode);

  const ragLossRatio    = getRagForLossRatio(lossRatio, isLife);
  const ragCombinedRatio = getRagForCombinedRatio(combinedRatio);
  const ragMER          = getRagForMER(mer);

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    gwp:                  convert(gwpRaw,            currency),
    reinsuranceCeded:     convert(cedRaw,            currency),
    netRetentionRatio,
    nep:                  convert(nep,               currency),
    claimsIncurred:       convert(claimsIncurred,    currency),
    lossRatio,
    managementExpenses:   convert(managementExpenses,currency),
    mer,
    combinedRatio,
    underwritingProfit:   convert(underwritingProfit,currency),
    investmentIncome:     convert(investmentIncome,  currency),
    pbt:                  convert(pbt,               currency),
    tax:                  convert(taxRaw,            currency),
    pat:                  convert(pat,               currency),
    budgetGwp:            convert(budgetGwp,         currency),
    budgetVariancePct,
    priorYearGwp:         convert(priorYearGwp,      currency),
    yoyGrowthPct,
    monthlyTrend,
    plVarianceTable,
    ragLossRatio,
    ragCombinedRatio,
    ragMER,
  };
}
