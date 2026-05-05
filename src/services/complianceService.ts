/**
 * complianceService.ts
 * SINGLE SOURCE OF TRUTH for all RAG (Red/Amber/Green) logic.
 * All thresholds are grounded in NAICOM regulatory frameworks cited below.
 */

import type { RAGStatus } from '../types/subsidiary.types';

// ─── NAICOM Regulatory Thresholds ─────────────────────────────────────────────

/**
 * Sources:
 *  - Minimum capital: Insurance Act 2003, s.9 + NAICOM Circular on Recapitalisation 2019
 *  - Solvency margin: NAICOM Risk-Based Supervision Framework 2019 (min 15% of net premium income)
 *  - Prescribed assets: NAICOM Guideline on Investment of Insurance Funds 2019, s.4.1
 *  - Claims paying ability: NAICOM Operational Guidelines (min 100% liquid assets to net claims outstanding)
 */
export const NAICOM_THRESHOLDS = {
  // Minimum paid-up capital (NGN)
  MIN_CAPITAL_LIFE:      8_000_000_000,
  MIN_CAPITAL_GENERAL:   5_000_000_000,
  MIN_CAPITAL_COMPOSITE: 18_000_000_000,

  // Solvency margin (% of net premium income)
  SOLVENCY_MARGIN_RED:   15,
  SOLVENCY_MARGIN_AMBER: 20,

  // Prescribed assets ratio (% of total investment portfolio)
  PRESCRIBED_ASSETS_RED:   50,
  PRESCRIBED_ASSETS_AMBER: 60,

  // Claims paying ability (liquid assets / net claims outstanding × 100)
  CLAIMS_PAYING_ABILITY_RED:   100,
  CLAIMS_PAYING_ABILITY_AMBER: 130,

  // Loss ratios (claims / NEP × 100)
  LOSS_RATIO_GENERAL_RED:   70,
  LOSS_RATIO_GENERAL_AMBER: 60,
  LOSS_RATIO_LIFE_RED:      80,
  LOSS_RATIO_LIFE_AMBER:    70,

  // Management expense ratio (management expenses / NEP × 100)
  MER_RED:   30,
  MER_AMBER: 25,

  // Combined ratio (loss ratio + MER)
  COMBINED_RATIO_RED:   100,
  COMBINED_RATIO_AMBER: 95,
} as const;

// ─── RAG Helper Functions ──────────────────────────────────────────────────────

/**
 * Solvency margin ratio (%).
 * Green ≥ 20%, Amber 15–<20%, Red < 15%.
 */
export function getRagForSolvency(ratio: number): RAGStatus {
  if (ratio >= NAICOM_THRESHOLDS.SOLVENCY_MARGIN_AMBER) return 'Green';
  if (ratio >= NAICOM_THRESHOLDS.SOLVENCY_MARGIN_RED)   return 'Amber';
  return 'Red';
}

/**
 * Prescribed asset ratio (%).
 * Green ≥ 60%, Amber 50–<60%, Red < 50%.
 */
export function getRagForPrescribedAssets(ratio: number): RAGStatus {
  if (ratio >= NAICOM_THRESHOLDS.PRESCRIBED_ASSETS_AMBER) return 'Green';
  if (ratio >= NAICOM_THRESHOLDS.PRESCRIBED_ASSETS_RED)   return 'Amber';
  return 'Red';
}

/**
 * Claims paying ability (%).
 * Green ≥ 130%, Amber 100–<130%, Red < 100%.
 */
export function getRagForClaimsPayingAbility(ratio: number): RAGStatus {
  if (ratio >= NAICOM_THRESHOLDS.CLAIMS_PAYING_ABILITY_AMBER) return 'Green';
  if (ratio >= NAICOM_THRESHOLDS.CLAIMS_PAYING_ABILITY_RED)   return 'Amber';
  return 'Red';
}

/**
 * Loss ratio (%).
 * Life:    Green < 70%, Amber 70–<80%, Red ≥ 80%.
 * General: Green < 60%, Amber 60–<70%, Red ≥ 70%.
 */
export function getRagForLossRatio(ratio: number, isLife: boolean): RAGStatus {
  if (isLife) {
    if (ratio < NAICOM_THRESHOLDS.LOSS_RATIO_LIFE_AMBER) return 'Green';
    if (ratio < NAICOM_THRESHOLDS.LOSS_RATIO_LIFE_RED)   return 'Amber';
    return 'Red';
  }
  if (ratio < NAICOM_THRESHOLDS.LOSS_RATIO_GENERAL_AMBER) return 'Green';
  if (ratio < NAICOM_THRESHOLDS.LOSS_RATIO_GENERAL_RED)   return 'Amber';
  return 'Red';
}

/**
 * Management expense ratio (%).
 * Green < 25%, Amber 25–<30%, Red ≥ 30%.
 */
export function getRagForMER(ratio: number): RAGStatus {
  if (ratio < NAICOM_THRESHOLDS.MER_AMBER) return 'Green';
  if (ratio < NAICOM_THRESHOLDS.MER_RED)   return 'Amber';
  return 'Red';
}

/**
 * Combined ratio (%).
 * Green < 95%, Amber 95–<100%, Red ≥ 100%.
 */
export function getRagForCombinedRatio(ratio: number): RAGStatus {
  if (ratio < NAICOM_THRESHOLDS.COMBINED_RATIO_AMBER) return 'Green';
  if (ratio < NAICOM_THRESHOLDS.COMBINED_RATIO_RED)   return 'Amber';
  return 'Red';
}

/**
 * Minimum capital adequacy.
 * Green: capital ≥ minimum.
 * Amber: capital within 10% below minimum.
 * Red:   capital more than 10% below minimum.
 */
export function getRagForMinCapital(
  capital: number,
  entityType: 'Life' | 'General' | 'Composite',
): RAGStatus {
  const minimumMap: Record<'Life' | 'General' | 'Composite', number> = {
    Life:      NAICOM_THRESHOLDS.MIN_CAPITAL_LIFE,
    General:   NAICOM_THRESHOLDS.MIN_CAPITAL_GENERAL,
    Composite: NAICOM_THRESHOLDS.MIN_CAPITAL_COMPOSITE,
  };
  const minimum = minimumMap[entityType];
  if (capital >= minimum)               return 'Green';
  if (capital >= minimum * 0.9)         return 'Amber';
  return 'Red';
}
