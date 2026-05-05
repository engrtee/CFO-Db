/**
 * riskService.ts
 * Produces risk metrics: reserve adequacy, VaR, FX exposure, stress tests,
 * reinsurer concentration, and Key Risk Indicators (KRIs).
 * Pure function — no side effects.
 */

import type { RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import { ibnrReserveSchedule } from '../data/ibnr_reserve_schedule';
import { reinsuranceTreatyLog } from '../data/reinsurance_treaty_log';
import { investmentHoldings } from '../data/investment_holdings';
import {
  getRagForSolvency,
} from './complianceService';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Constants ─────────────────────────────────────────────────────────────────

const EQUITY_PORTFOLIO_NGN    = 18_000_000_000; // ₦18bn equity book
const DAILY_SIGMA_PCT         = 0.15 / Math.sqrt(252); // 15% annual vol → daily σ
const FIXED_INCOME_PORTFOLIO  = 85_000_000_000; // ₦85bn fixed income
const ASSUMED_DURATION_GAP    = 3.5;            // years (conservative)
const FX_EXPOSURE_NGN         = 12_000_000_000; // ₦12bn total FX book

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ReserveAdequacyRow {
  subsidiary: string;
  lob: string;
  ocr: number;
  ibnr: number;
  total: number;
  actuarialBE: number;
  adequacyRatio: number;
  rag: RAGStatus;
}

export interface VaRMetric {
  metric: string;
  value: number;
}

export interface FXExposureRow {
  subsidiary: string;
  usdExposure: number;
  gbpExposure: number;
  eurExposure: number;
  totalNGN: number;
  rag: RAGStatus;
}

export interface StressTest {
  scenario: string;
  portfolioImpact: number;
  stressedSolvencyRatio: number;
  stressedRag: RAGStatus;
  buffer: number;
}

export interface ReinsurerConcentration {
  reinsurer: string;
  rating: string;
  premiumCeded: number;
  pctOfProgramme: number;
  rag: RAGStatus;
}

export interface KRI {
  kri: string;
  value: number;
  target: number;
  unit: string;
  rag: RAGStatus;
}

export interface RiskResult {
  reserveAdequacy: ReserveAdequacyRow[];
  varMetrics: VaRMetric[];
  fxExposure: FXExposureRow[];
  stressTests: StressTest[];
  reinsuerConcentration: ReinsurerConcentration[];
  kris: KRI[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

function ragForAdequacy(ratio: number): RAGStatus {
  // Adequacy ratio = total reserve / actuarial best estimate
  // > 1.10 → Green (10%+ margin), 1.00–1.10 → Amber, < 1.00 → Red (under-reserved)
  if (ratio >= 1.10) return 'Green';
  if (ratio >= 1.00) return 'Amber';
  return 'Red';
}

function ragForFX(totalNGN: number, groupTSF: number): RAGStatus {
  // FX risk: > 15% of group TSF → Red, 10–15% → Amber, ≤ 10% → Green
  if (groupTSF <= 0) return 'Green';
  const pct = (totalNGN / groupTSF) * 100;
  if (pct > 15) return 'Red';
  if (pct > 10) return 'Amber';
  return 'Green';
}

function ragForReinsurerConcentration(pct: number, rating: string): RAGStatus {
  // > 25% + below A- → Red; > 25% → Amber; ≤ 25% → Green
  const ratingOk = ['A+', 'A', 'A-', 'AA', 'AA+', 'AA-', 'AAA'].includes(rating);
  if (pct > 25 && !ratingOk) return 'Red';
  if (pct > 25)              return 'Amber';
  return 'Green';
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getRiskSummary(params: ServiceParams): RiskResult {
  const { subsidiaryCode, period, currency } = params;
  const ibnr    = ibnrReserveSchedule   ?? [];
  const treaties = reinsuranceTreatyLog ?? [];
  const holdings = investmentHoldings   ?? [];

  // ── Reserve adequacy ──────────────────────────────────────────────────────
  const ibnrFiltered = subsidiaryCode === 'ALL'
    ? ibnr
    : ibnr.filter(r => r.subsidiary_code === subsidiaryCode);

  // Latest period per sub + LOB
  const latestIbnr: Record<string, typeof ibnrFiltered[number]> = {};
  for (const r of ibnrFiltered.filter(r => r.accounting_period <= period)) {
    const key = `${r.subsidiary_code}|${r.line_of_business}`;
    if (!latestIbnr[key] || r.accounting_period > latestIbnr[key].accounting_period) {
      latestIbnr[key] = r;
    }
  }

  const reserveAdequacy: ReserveAdequacyRow[] = Object.values(latestIbnr).map(r => ({
    subsidiary:    r.subsidiary_code as string,
    lob:           r.line_of_business as string,
    ocr:           convert(r.ocr_amount,            currency),
    ibnr:          convert(r.ibnr_amount,           currency),
    total:         convert(r.total_reserve,         currency),
    actuarialBE:   convert(r.actuarial_best_estimate, currency),
    adequacyRatio: r.adequacy_ratio,
    rag:           ragForAdequacy(r.adequacy_ratio),
  }));

  // ── VaR metrics ───────────────────────────────────────────────────────────
  // VaR 95% 1-day = 1.645 × σ × portfolio
  // VaR 99% 1-day = 2.326 × σ × portfolio
  // 10-day = 1-day × √10
  const var95_1d  = 1.645 * DAILY_SIGMA_PCT * EQUITY_PORTFOLIO_NGN;
  const var99_1d  = 2.326 * DAILY_SIGMA_PCT * EQUITY_PORTFOLIO_NGN;
  const var95_10d = var95_1d * Math.sqrt(10);
  const var99_10d = var99_1d * Math.sqrt(10);

  const varMetrics: VaRMetric[] = [
    { metric: 'VaR 95% 1-Day (Equity)',  value: convert(var95_1d,  currency) },
    { metric: 'VaR 99% 1-Day (Equity)',  value: convert(var99_1d,  currency) },
    { metric: 'VaR 95% 10-Day (Equity)', value: convert(var95_10d, currency) },
    { metric: 'VaR 99% 10-Day (Equity)', value: convert(var99_10d, currency) },
  ];

  // ── FX exposure ───────────────────────────────────────────────────────────
  // Filter offshore holdings to derive FX exposure per sub
  const offshoreHoldings = (
    subsidiaryCode === 'ALL'
      ? holdings
      : holdings.filter(h => h.subsidiary_code === subsidiaryCode)
  ).filter(h => h.instrument_type === 'Offshore');

  const fxSubMap: Record<string, { usd: number; gbp: number; eur: number }> = {};
  for (const h of offshoreHoldings) {
    const key = h.subsidiary_code as string;
    if (!fxSubMap[key]) fxSubMap[key] = { usd: 0, gbp: 0, eur: 0 };
    // Assume all offshore are USD-denominated (matching the data)
    fxSubMap[key].usd += h.face_value;
  }

  const groupTSF_NGN = 55_000_000_000; // from capital snapshot proxy (₦55bn group TSF)

  const fxExposure: FXExposureRow[] = Object.entries(fxSubMap).map(
    ([subsidiary, fx]) => {
      const totalNGN = fx.usd * USD_RATE + fx.gbp * 1980 + fx.eur * 1720; // approx rates
      return {
        subsidiary,
        usdExposure: convert(fx.usd * USD_RATE, currency),
        gbpExposure: convert(fx.gbp * 1980,     currency),
        eurExposure: convert(fx.eur * 1720,     currency),
        totalNGN:    convert(totalNGN,           currency),
        rag:         ragForFX(totalNGN, groupTSF_NGN),
      };
    },
  );

  // ── Stress tests ──────────────────────────────────────────────────────────
  const baseSolvencyRatio = 28.5; // % — current group solvency from capital service
  const bufferNGN         = 12_000_000_000; // capital buffer

  // Scenario 1: 20% equity decline
  const s1Impact = -0.20 * EQUITY_PORTFOLIO_NGN;
  const s1SR     = baseSolvencyRatio + (s1Impact / FIXED_INCOME_PORTFOLIO) * 100;

  // Scenario 2: 300bps rate shock
  const s2Impact = -ASSUMED_DURATION_GAP * 0.03 * FIXED_INCOME_PORTFOLIO;
  const s2SR     = baseSolvencyRatio + (s2Impact / FIXED_INCOME_PORTFOLIO) * 100;

  // Scenario 3: 30% NGN depreciation
  const s3Impact = -(FX_EXPOSURE_NGN * 0.30);
  const s3SR     = baseSolvencyRatio + (s3Impact / FIXED_INCOME_PORTFOLIO) * 100;

  const stressTests: StressTest[] = [
    {
      scenario:            '20% Equity Market Decline',
      portfolioImpact:     convert(s1Impact, currency),
      stressedSolvencyRatio: Math.max(0, s1SR),
      stressedRag:         getRagForSolvency(Math.max(0, s1SR)),
      buffer:              convert(bufferNGN + s1Impact, currency),
    },
    {
      scenario:            '300bps Interest Rate Shock',
      portfolioImpact:     convert(s2Impact, currency),
      stressedSolvencyRatio: Math.max(0, s2SR),
      stressedRag:         getRagForSolvency(Math.max(0, s2SR)),
      buffer:              convert(bufferNGN + s2Impact, currency),
    },
    {
      scenario:            '30% NGN Depreciation',
      portfolioImpact:     convert(s3Impact, currency),
      stressedSolvencyRatio: Math.max(0, s3SR),
      stressedRag:         getRagForSolvency(Math.max(0, s3SR)),
      buffer:              convert(bufferNGN + s3Impact, currency),
    },
  ];

  // ── Reinsurer concentration ───────────────────────────────────────────────
  const filteredTreaties = subsidiaryCode === 'ALL'
    ? treaties
    : treaties.filter(t => t.subsidiary_code === subsidiaryCode);

  const reinsurerMap: Record<string, { rating: string; ceded: number }> = {};
  for (const t of filteredTreaties) {
    if (!reinsurerMap[t.reinsurer_name]) {
      reinsurerMap[t.reinsurer_name] = { rating: t.reinsurer_rating, ceded: 0 };
    }
    reinsurerMap[t.reinsurer_name].ceded += t.premium_ceded_ytd;
  }

  const totalCeded = Object.values(reinsurerMap).reduce((s, r) => s + r.ceded, 0) || 1;

  const reinsuerConcentration: ReinsurerConcentration[] = Object.entries(reinsurerMap)
    .map(([reinsurer, data]) => {
      const pct = (data.ceded / totalCeded) * 100;
      return {
        reinsurer,
        rating:         data.rating,
        premiumCeded:   convert(data.ceded, currency),
        pctOfProgramme: pct,
        rag:            ragForReinsurerConcentration(pct, data.rating),
      };
    })
    .sort((a, b) => b.pctOfProgramme - a.pctOfProgramme);

  // ── KRIs ──────────────────────────────────────────────────────────────────
  const kris: KRI[] = [
    {
      kri:    'System Downtime',
      value:  2.1,
      target: 4,
      unit:   'hours/month',
      rag:    'Green',
    },
    {
      kri:    'Policy Error Rate',
      value:  0.3,
      target: 0.5,
      unit:   '%',
      rag:    'Green',
    },
    {
      kri:    'Motor Claims Cycle',
      value:  24,
      target: 21,
      unit:   'days',
      rag:    'Amber',
    },
    {
      kri:    'Life Claims Cycle',
      value:  28,
      target: 30,
      unit:   'days',
      rag:    'Green',
    },
    {
      kri:    'Staff Turnover',
      value:  8.5,
      target: 10,
      unit:   '%',
      rag:    'Green',
    },
    {
      kri:    'IT Security Incidents',
      value:  0,
      target: 0,
      unit:   'incidents/month',
      rag:    'Green',
    },
  ];

  return {
    reserveAdequacy,
    varMetrics,
    fxExposure,
    stressTests,
    reinsuerConcentration,
    kris,
  };
}
