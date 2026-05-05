/**
 * investmentService.ts
 * Aggregates investment holdings and income ledger data.
 * Pure function — no side effects.
 */

import type { RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import type { InvestmentHoldingRow } from '../types/investment.types';
import { investmentHoldings } from '../data/investment_holdings';
import { investmentIncomeLedger } from '../data/investment_income_ledger';
import { getRagForPrescribedAssets } from './complianceService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MonthlyIncomeTrendPoint {
  period: string;
  interest: number;
  dividends: number;
  realisedGains: number;
  unrealisedGains: number;
}

export interface MaturityBucket {
  bucket: string;
  value: number;
}

export interface InvestmentResult {
  totalAUM: number;
  prescribedAssetRatio: number;
  portfolioYield: number;
  unrealisedGainLoss: number;
  durationGap: number;
  byAssetClass: Record<string, number>;
  top10Holdings: InvestmentHoldingRow[];
  concentrationFlags: string[];
  offshoreExposureNGN: number;
  monthlyIncomeTrend: MonthlyIncomeTrendPoint[];
  maturityLadder: MaturityBucket[];
  ragPrescribedAssets: RAGStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

/**
 * Returns months from today until the maturity date.
 */
function monthsUntilMaturity(maturityDate: string): number {
  const now = new Date('2025-04-30'); // use latest data snapshot date
  const mat = new Date(maturityDate);
  return (mat.getFullYear() - now.getFullYear()) * 12 + (mat.getMonth() - now.getMonth());
}

function classifyMaturityBucket(maturityDate: string): string {
  const months = monthsUntilMaturity(maturityDate);
  if (months <= 3)  return '0-3M';
  if (months <= 6)  return '3-6M';
  if (months <= 12) return '6M-1Y';
  if (months <= 36) return '1-3Y';
  if (months <= 60) return '3-5Y';
  return '5Y+';
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getInvestmentSummary(params: ServiceParams): InvestmentResult {
  const { subsidiaryCode, currency } = params;
  const holdings  = investmentHoldings  ?? [];
  const ledger    = investmentIncomeLedger ?? [];

  // ── Filter holdings by subsidiary ─────────────────────────────────────────
  const filteredHoldings: InvestmentHoldingRow[] = subsidiaryCode === 'ALL'
    ? holdings
    : holdings.filter(h => h.subsidiary_code === subsidiaryCode);

  // ── AUM & prescribed asset ratio ─────────────────────────────────────────
  const totalFaceValue      = filteredHoldings.reduce((s, h) => s + h.face_value, 0);
  const prescribedFaceValue = filteredHoldings
    .filter(h => h.prescribed_asset_flag)
    .reduce((s, h) => s + h.face_value, 0);
  const prescribedAssetRatio = totalFaceValue > 0
    ? (prescribedFaceValue / totalFaceValue) * 100
    : 0;

  const totalAUM         = filteredHoldings.reduce((s, h) => s + h.current_market_value, 0);
  const unrealisedGainLoss = filteredHoldings.reduce((s, h) => s + h.unrealised_gain_loss, 0);

  // ── Portfolio yield (weighted average YTM) ────────────────────────────────
  const weightedYTM = filteredHoldings.reduce(
    (s, h) => s + h.yield_to_maturity * h.current_market_value,
    0,
  );
  const portfolioYield = totalAUM > 0 ? weightedYTM / totalAUM : 0;

  // ── Duration gap = weighted avg asset duration – 6 (assumed liability dur) ─
  const weightedDuration = filteredHoldings.reduce(
    (s, h) => s + h.duration_years * h.current_market_value,
    0,
  );
  const avgAssetDuration = totalAUM > 0 ? weightedDuration / totalAUM : 0;
  const durationGap      = avgAssetDuration - 6;

  // ── By asset class ────────────────────────────────────────────────────────
  const byAssetClass: Record<string, number> = {};
  for (const h of filteredHoldings) {
    byAssetClass[h.instrument_type] =
      (byAssetClass[h.instrument_type] ?? 0) + h.current_market_value;
  }

  // ── Top 10 holdings by current market value ───────────────────────────────
  const top10Holdings = [...filteredHoldings]
    .sort((a, b) => b.current_market_value - a.current_market_value)
    .slice(0, 10);

  // ── Concentration flags: issuers > 10% of portfolio ──────────────────────
  const issuerMap: Record<string, number> = {};
  for (const h of filteredHoldings) {
    issuerMap[h.issuer_name] = (issuerMap[h.issuer_name] ?? 0) + h.current_market_value;
  }
  const concentrationFlags = Object.entries(issuerMap)
    .filter(([, v]) => totalAUM > 0 && (v / totalAUM) > 0.1)
    .map(([name]) => name);

  // ── Offshore exposure (face value × exchange_rate where instrument_type = 'Offshore') ──
  const offshoreExposureNGN = filteredHoldings
    .filter(h => h.instrument_type === 'Offshore')
    .reduce((s, h) => {
      // face_value is in local CCY; holdings with currency_code = 'USD' need conversion
      const rateToNGN = h.currency_code === 'USD' ? USD_RATE : 1;
      return s + h.face_value * rateToNGN;
    }, 0);

  // ── Monthly income trend ──────────────────────────────────────────────────
  const filteredLedger = subsidiaryCode === 'ALL'
    ? ledger
    : ledger.filter(l => l.subsidiary_code === subsidiaryCode);

  const periodSet = [...new Set(filteredLedger.map(l => l.accounting_period))].sort();
  const monthlyIncomeTrend: MonthlyIncomeTrendPoint[] = periodSet.map(p => {
    const rows = filteredLedger.filter(l => l.accounting_period === p);
    return {
      period: p,
      interest:        convert(rows.reduce((s, r) => s + r.interest_income, 0),  currency),
      dividends:       convert(rows.reduce((s, r) => s + r.dividend_income, 0),  currency),
      realisedGains:   convert(rows.reduce((s, r) => s + r.realised_gains, 0),   currency),
      unrealisedGains: convert(rows.reduce((s, r) => s + r.unrealised_gains, 0), currency),
    };
  });

  // ── Maturity ladder ───────────────────────────────────────────────────────
  const bucketOrder = ['0-3M', '3-6M', '6M-1Y', '1-3Y', '3-5Y', '5Y+'];
  const bucketMap: Record<string, number> = {};
  for (const h of filteredHoldings) {
    const bucket = classifyMaturityBucket(h.maturity_date);
    bucketMap[bucket] = (bucketMap[bucket] ?? 0) + h.current_market_value;
  }
  const maturityLadder: MaturityBucket[] = bucketOrder.map(b => ({
    bucket: b,
    value:  convert(bucketMap[b] ?? 0, currency),
  }));

  // ── RAG ───────────────────────────────────────────────────────────────────
  const ragPrescribedAssets = getRagForPrescribedAssets(prescribedAssetRatio);

  return {
    totalAUM:             convert(totalAUM,          currency),
    prescribedAssetRatio,
    portfolioYield,
    unrealisedGainLoss:   convert(unrealisedGainLoss, currency),
    durationGap,
    byAssetClass:         Object.fromEntries(
      Object.entries(byAssetClass).map(([k, v]) => [k, convert(v, currency)]),
    ),
    top10Holdings,
    concentrationFlags,
    offshoreExposureNGN:  convert(offshoreExposureNGN, currency),
    monthlyIncomeTrend,
    maturityLadder,
    ragPrescribedAssets,
  };
}
