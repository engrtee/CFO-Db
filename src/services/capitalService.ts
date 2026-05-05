/**
 * capitalService.ts
 * Aggregates regulatory capital snapshots and produces solvency / capital metrics.
 * Pure function — no side effects.
 */

import type { SubsidiaryCode, RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import type { RegulatoryCapitalRow } from '../types/regulatory.types';
import { regulatoryCapitalSnapshot } from '../data/regulatory_capital_snapshot';
import {
  getRagForSolvency,
  getRagForMinCapital,
} from './complianceService';
import { getFinancialSummary } from './financialService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface EntityCapital {
  subsidiaryCode: SubsidiaryCode;
  paidUpCapital: number;
  naicomMinimum: number;
  headroom: number;
  solvencyMarginRatio: number;
  totalShareholdersFunds: number;
  ragSolvency: RAGStatus;
  ragMinCapital: RAGStatus;
}

export interface CapitalResult {
  entities: EntityCapital[];
  consolidatedSolvencyRatio: number;
  consolidatedHeadroom: number;
  consolidatedTSF: number;
  groupROE: number;
  groupROA: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

/**
 * Map a subsidiary code to its NAICOM entity type.
 * LWL = Life, LWG = General, LWH = General (HMO treated as general), LWN = General (PFA).
 */
function entityTypeFor(code: SubsidiaryCode): 'Life' | 'General' | 'Composite' {
  if (code === 'LWL') return 'Life';
  return 'General';
}

/**
 * Return the latest capital snapshot for each subsidiary.
 * Snapshots are quarterly; select the highest period string per sub.
 */
function latestSnapshotsPerSub(
  rows: RegulatoryCapitalRow[],
): RegulatoryCapitalRow[] {
  const map: Record<string, RegulatoryCapitalRow> = {};
  for (const r of rows) {
    const key = r.subsidiary_code;
    if (!map[key] || r.reporting_period > map[key].reporting_period) {
      map[key] = r;
    }
  }
  return Object.values(map);
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getCapitalSummary(params: ServiceParams): CapitalResult {
  const { subsidiaryCode, period, currency } = params;
  const snapshots: RegulatoryCapitalRow[] = regulatoryCapitalSnapshot ?? [];

  // ── Determine scope ───────────────────────────────────────────────────────
  const relevant = subsidiaryCode === 'ALL'
    ? snapshots
    : snapshots.filter(r => r.subsidiary_code === subsidiaryCode);

  const latest = latestSnapshotsPerSub(relevant);

  // ── Get group PAT from financial service for ROE / ROA ───────────────────
  const financialParams: ServiceParams = { subsidiaryCode, period, currency: 'NGN' };
  const financials = getFinancialSummary(financialParams);
  const patNGN     = financials.pat;

  // ── Entity-level capital ──────────────────────────────────────────────────
  const entities: EntityCapital[] = latest.map(snap => {
    const entityType = entityTypeFor(snap.subsidiary_code);

    return {
      subsidiaryCode:      snap.subsidiary_code,
      paidUpCapital:       convert(snap.paid_up_capital,          currency),
      naicomMinimum:       convert(snap.naicom_minimum_capital,    currency),
      headroom:            convert(snap.capital_headroom,          currency),
      solvencyMarginRatio: snap.solvency_margin_ratio,
      totalShareholdersFunds: convert(snap.total_shareholders_funds, currency),
      ragSolvency:         getRagForSolvency(snap.solvency_margin_ratio),
      ragMinCapital:       getRagForMinCapital(snap.paid_up_capital, entityType),
    };
  });

  // ── Consolidated metrics ──────────────────────────────────────────────────
  const totalAdmissibleAssets = latest.reduce((s, r) => s + r.total_admissible_assets, 0);
  const totalLiabilities      = latest.reduce((s, r) => s + r.total_liabilities,       0);
  const totalNetPremiumIncome = latest.reduce((s, r) => s + r.net_premium_income,       0);
  const consolidatedTSF       = latest.reduce((s, r) => s + r.total_shareholders_funds, 0);
  const totalHeadroom         = latest.reduce((s, r) => s + r.capital_headroom,         0);

  const solvencyMarginNGN         = totalAdmissibleAssets - totalLiabilities;
  const consolidatedSolvencyRatio = totalNetPremiumIncome > 0
    ? (solvencyMarginNGN / totalNetPremiumIncome) * 100
    : 0;

  // ROE = PAT / TSF × 100
  const groupROE = consolidatedTSF > 0 ? (patNGN / consolidatedTSF) * 100 : 0;
  // ROA = PAT / Total Admissible Assets × 100
  const groupROA = totalAdmissibleAssets > 0 ? (patNGN / totalAdmissibleAssets) * 100 : 0;

  return {
    entities,
    consolidatedSolvencyRatio,
    consolidatedHeadroom:  convert(totalHeadroom,   currency),
    consolidatedTSF:       convert(consolidatedTSF, currency),
    groupROE,
    groupROA,
  };
}
