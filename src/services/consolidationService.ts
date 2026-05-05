/**
 * consolidationService.ts
 * IFRS 10 full consolidation — sums all subsidiaries, eliminates intercompany balances.
 * Pure function — no side effects.
 */

import type { Currency, RAGStatus } from '../types/subsidiary.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';
import { incomeStatementGL } from '../data/income_statement_gl';
import { regulatoryCapitalSnapshot } from '../data/regulatory_capital_snapshot';
import { investmentHoldings } from '../data/investment_holdings';
import { cashPositionDaily } from '../data/cash_position_daily';
import { subsidiaryMaster } from '../data/subsidiary_master';
import { getRagForSolvency } from './complianceService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Regulated insurance subsidiaries (NAICOM supervised) ─────────────────────
const REGULATED_SUBS: SubsidiaryCode[] = ['LWL', 'LWG', 'LWH', 'LWN'];

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SubsidiaryBreakdownRow {
  code: string;
  name: string;
  gwp: number;
  pat: number;
  roe: number;
  combinedRatio: number;
  capitalStatus: RAGStatus;
  headcount: number;
  ytdVsBudgetPct: number;
}

export interface ConsolidatedResult {
  groupGWP: number;
  groupNEP: number;
  groupPAT: number;
  groupROE: number;
  groupROA: number;
  groupAUM: number;
  groupSolvencyRatio: number;
  groupTSF: number;
  groupCash: number;
  groupLossRatio: number;
  subsidiaryBreakdown: SubsidiaryBreakdownRow[];
  intercompanyEliminations: number;
  prescribedAssetRatioGroup: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: Currency): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

function sumGL(
  rows: typeof incomeStatementGL,
  accountCode: string,
  field: 'actual_amount' | 'budget_amount' | 'ytd_actual',
): number {
  return rows
    .filter(r => r.account_code === accountCode)
    .reduce((s, r) => s + r[field], 0);
}

function latestSnapshotForSub(
  snapshots: typeof regulatoryCapitalSnapshot,
  code: SubsidiaryCode,
) {
  return snapshots
    .filter(s => s.subsidiary_code === code)
    .sort((a, b) => (b.reporting_period > a.reporting_period ? 1 : -1))[0];
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getConsolidatedSummary(period: string, currency: Currency): ConsolidatedResult {
  const gl       = incomeStatementGL        ?? [];
  const snapshots = regulatoryCapitalSnapshot ?? [];
  const holdings  = investmentHoldings       ?? [];
  const cashRows  = cashPositionDaily        ?? [];
  const subMaster = subsidiaryMaster         ?? [];

  // ── Filter GL to the requested period ─────────────────────────────────────
  const periodGL = gl.filter(r => r.accounting_period === period);

  // ── IFRS 10: include all subsidiaries, then remove intercompany amounts ────
  // consolidated_amount = actual_amount - intercompany_elimination (pre-computed in data)
  const groupGWP_raw   = periodGL
    .filter(r => r.account_code === '4001')
    .reduce((s, r) => s + r.consolidated_amount, 0);

  const groupNEPGL     = periodGL
    .filter(r => r.account_code === '4003')
    .reduce((s, r) => s + r.consolidated_amount, 0);
  const groupCeded     = Math.abs(periodGL
    .filter(r => r.account_code === '4002')
    .reduce((s, r) => s + r.consolidated_amount, 0));
  const groupNEP_raw   = groupNEPGL > 0 ? groupNEPGL : groupGWP_raw - groupCeded;

  const groupClaims    = Math.abs(
    periodGL.filter(r => r.account_code === '5001').reduce((s, r) => s + r.consolidated_amount, 0),
  ) + Math.abs(
    periodGL.filter(r => r.account_code === '5002').reduce((s, r) => s + r.consolidated_amount, 0),
  );

  const groupCommission = periodGL
    .filter(r => r.account_code === '6001')
    .reduce((s, r) => s + r.consolidated_amount, 0);
  const groupMgmt       = periodGL
    .filter(r => r.account_code === '6002')
    .reduce((s, r) => s + r.consolidated_amount, 0);
  const groupMgmtTotal  = groupCommission + groupMgmt;

  const groupInvIncome  = periodGL
    .filter(r => r.account_code === '7001')
    .reduce((s, r) => s + r.consolidated_amount, 0);
  const groupOtherInc   = periodGL
    .filter(r => r.account_code === '8001')
    .reduce((s, r) => s + r.consolidated_amount, 0);
  const groupTax        = Math.abs(
    periodGL.filter(r => r.account_code === '9001').reduce((s, r) => s + r.consolidated_amount, 0),
  );

  const groupUW   = groupNEP_raw - groupClaims - groupMgmtTotal;
  const groupPBT  = groupUW + groupInvIncome + groupOtherInc;
  const groupPAT_raw = groupPBT - groupTax;

  const groupLossRatio = groupNEP_raw > 0 ? (groupClaims / groupNEP_raw) * 100 : 0;

  // ── Intercompany eliminations (sum of elimination amounts across all GL) ──
  const intercompanyEliminations = periodGL.reduce(
    (s, r) => s + Math.abs(r.intercompany_elimination),
    0,
  );

  // ── Group AUM = sum of all investment holdings ─────────────────────────────
  const groupAUM_raw = holdings.reduce((s, h) => s + h.current_market_value, 0);

  // ── Prescribed asset ratio at group level ─────────────────────────────────
  const totalFaceValue      = holdings.reduce((s, h) => s + h.face_value, 0);
  const prescribedFaceValue = holdings
    .filter(h => h.prescribed_asset_flag)
    .reduce((s, h) => s + h.face_value, 0);
  const prescribedAssetRatioGroup = totalFaceValue > 0
    ? (prescribedFaceValue / totalFaceValue) * 100
    : 0;

  // ── Group cash (latest snapshot, no intercompany) ──────────────────────────
  const latestDate = cashRows.reduce(
    (max, r) => (r.position_date > max ? r.position_date : max),
    '',
  );
  const groupCash_raw = cashRows
    .filter(r => r.position_date === latestDate && !r.intercompany_flag)
    .reduce((s, r) => s + r.balance_ngn, 0);

  // ── Consolidated capital (NAICOM-regulated subs only) ─────────────────────
  let totalAdmissible = 0;
  let totalLiabilities = 0;
  let totalNetPremium  = 0;
  let totalTSF         = 0;

  for (const code of REGULATED_SUBS) {
    const snap = latestSnapshotForSub(snapshots, code);
    if (snap) {
      totalAdmissible  += snap.total_admissible_assets;
      totalLiabilities += snap.total_liabilities;
      totalNetPremium  += snap.net_premium_income;
      totalTSF         += snap.total_shareholders_funds;
    }
  }

  const solvencyMarginNGN    = totalAdmissible - totalLiabilities;
  const groupSolvencyRatio   = totalNetPremium > 0
    ? (solvencyMarginNGN / totalNetPremium) * 100
    : 0;

  const groupROE = totalTSF        > 0 ? (groupPAT_raw / totalTSF)         * 100 : 0;
  const groupROA = totalAdmissible > 0 ? (groupPAT_raw / totalAdmissible)  * 100 : 0;

  // ── Per-subsidiary breakdown ───────────────────────────────────────────────
  const allSubCodes: SubsidiaryCode[] = ['LWL', 'LWG', 'LWC', 'LWH', 'LWT', 'LWP', 'LWN'];

  const subsidiaryBreakdown: SubsidiaryBreakdownRow[] = allSubCodes.map(code => {
    const subPeriodGL = periodGL.filter(r => r.subsidiary_code === code);

    const sGWP    = sumGL(subPeriodGL, '4001', 'actual_amount');
    const sCeded  = Math.abs(sumGL(subPeriodGL, '4002', 'actual_amount'));
    const sNEPGL  = sumGL(subPeriodGL, '4003', 'actual_amount');
    const sNEP    = sNEPGL > 0 ? sNEPGL : sGWP - sCeded;
    const sCl1    = Math.abs(sumGL(subPeriodGL, '5001', 'actual_amount'));
    const sCl2    = Math.abs(sumGL(subPeriodGL, '5002', 'actual_amount'));
    const sClaims = sCl1 + sCl2;
    const sComm   = sumGL(subPeriodGL, '6001', 'actual_amount');
    const sMgmt   = sumGL(subPeriodGL, '6002', 'actual_amount');
    const sInv    = sumGL(subPeriodGL, '7001', 'actual_amount');
    const sOther  = sumGL(subPeriodGL, '8001', 'actual_amount');
    const sTax    = Math.abs(sumGL(subPeriodGL, '9001', 'actual_amount'));

    const sLossRatio    = sNEP > 0 ? (sClaims / sNEP) * 100 : 0;
    const sMER          = sNEP > 0 ? ((sComm + sMgmt) / sNEP) * 100 : 0;
    const sCombinedRatio = sLossRatio + sMER;
    const sUW           = sNEP - sClaims - (sComm + sMgmt);
    const sPAT          = sUW + sInv + sOther - sTax;

    const snap = latestSnapshotForSub(snapshots, code);
    const sTSF = snap?.total_shareholders_funds ?? 1;
    const sROE = sTSF > 0 ? (sPAT / sTSF) * 100 : 0;

    // Capital RAG
    let capitalStatus: RAGStatus = 'Green';
    if (snap) {
      capitalStatus = getRagForSolvency(snap.solvency_margin_ratio);
    }

    // Budget variance
    const sGWPBudget     = sumGL(subPeriodGL, '4001', 'budget_amount');
    const ytdVsBudgetPct = sGWPBudget > 0
      ? ((sGWP - sGWPBudget) / sGWPBudget) * 100
      : 0;

    const subInfo = subMaster.find(s => s.code === code);

    return {
      code,
      name:           subInfo?.name ?? code,
      gwp:            convert(sGWP,          currency),
      pat:            convert(sPAT,          currency),
      roe:            sROE,
      combinedRatio:  sCombinedRatio,
      capitalStatus,
      headcount:      subInfo?.headcount ?? 0,
      ytdVsBudgetPct,
    };
  });

  return {
    groupGWP:                   convert(groupGWP_raw,              currency),
    groupNEP:                   convert(groupNEP_raw,              currency),
    groupPAT:                   convert(groupPAT_raw,              currency),
    groupROE,
    groupROA,
    groupAUM:                   convert(groupAUM_raw,              currency),
    groupSolvencyRatio,
    groupTSF:                   convert(totalTSF,                  currency),
    groupCash:                  convert(groupCash_raw,             currency),
    groupLossRatio,
    subsidiaryBreakdown,
    intercompanyEliminations:   convert(intercompanyEliminations,  currency),
    prescribedAssetRatioGroup,
  };
}
