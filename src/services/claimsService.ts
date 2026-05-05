/**
 * claimsService.ts
 * Aggregates claims register and IBNR reserve schedules.
 * Pure function — no side effects.
 */

import type { RAGStatus } from '../types/subsidiary.types';
import type { ServiceParams } from '../types/subsidiary.types';
import type { ClaimsRegisterRow } from '../types/claims.types';
import type { IBNRReserveRow } from '../types/claims.types';
import type { LineOfBusiness } from '../types/financial.types';
import { claimsRegister } from '../data/claims_register';
import { ibnrReserveSchedule } from '../data/ibnr_reserve_schedule';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── SLA Targets (days) ────────────────────────────────────────────────────────

const SLA_TARGETS: Record<LineOfBusiness, number> = {
  'Motor':          21,
  'Health':         14,
  'Life Individual':30,
  'Life Group':     45,
  'Marine':         60,
  'Fire & Property':90,
  'Engineering':   120,
  'Oil & Gas':     180,
  'Aviation':       90,
  'Annuities':      30,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ClaimsByLOB {
  lob: string;
  count: number;
  grossValue: number;
  avgValue: number;
}

export interface SettlementCycleByLOB {
  lob: string;
  avgDays: number;
  slaTarget: number;
  ragStatus: RAGStatus;
}

export interface ClaimsResult {
  totalGrossClaims: number;
  totalNetClaims: number;
  riRecoveryRate: number;
  avgSettlementDays: number;
  openCount: number;
  settledCount: number;
  litigationCount: number;
  largeLossItems: ClaimsRegisterRow[];
  fraudItems: ClaimsRegisterRow[];
  claimsByLOB: ClaimsByLOB[];
  reserveAdequacy: IBNRReserveRow[];
  settlementCycleByLOB: SettlementCycleByLOB[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

function ragForSettlementCycle(avgDays: number, slaTarget: number): RAGStatus {
  if (avgDays <= slaTarget)          return 'Green';
  if (avgDays <= slaTarget * 1.25)   return 'Amber';
  return 'Red';
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getClaimsSummary(params: ServiceParams): ClaimsResult {
  const { subsidiaryCode, period, currency } = params;
  const claims: ClaimsRegisterRow[] = claimsRegister  ?? [];
  const ibnr:   IBNRReserveRow[]    = ibnrReserveSchedule ?? [];

  // ── Filter by subsidiary ──────────────────────────────────────────────────
  const filtered: ClaimsRegisterRow[] = subsidiaryCode === 'ALL'
    ? claims
    : claims.filter(c => c.subsidiary_code === subsidiaryCode);

  // ── Filter by period (date_of_loss within the accounting period) ──────────
  const periodFiltered = filtered.filter(c => {
    if (!period) return true;
    const claimMonth = c.date_of_loss.substring(0, 7); // 'YYYY-MM'
    return claimMonth <= period;
  });

  // ── Aggregates ────────────────────────────────────────────────────────────
  const totalGrossClaims = periodFiltered.reduce((s, c) => s + c.gross_claim_amount, 0);
  const totalNetClaims   = periodFiltered.reduce((s, c) => s + c.net_claim_amount,   0);
  const totalRI          = periodFiltered.reduce((s, c) => s + c.reinsurance_recovery, 0);

  const riRecoveryRate = totalGrossClaims > 0
    ? (totalRI / totalGrossClaims) * 100
    : 0;

  const settledClaims = periodFiltered.filter(c => c.claim_status === 'Settled');
  const settlementDays = settledClaims
    .map(c => c.settlement_days)
    .filter((d): d is number => d !== null);

  const avgSettlementDays = settlementDays.length > 0
    ? settlementDays.reduce((s, d) => s + d, 0) / settlementDays.length
    : 0;

  const openCount      = periodFiltered.filter(c => c.claim_status === 'Open').length;
  const settledCount   = settledClaims.length;
  const litigationCount = periodFiltered.filter(c => c.claim_status === 'Litigation').length;

  // ── Large loss & fraud items ──────────────────────────────────────────────
  const largeLossItems = periodFiltered.filter(c => c.large_loss_flag);
  const fraudItems     = periodFiltered.filter(c => c.fraud_flag);

  // ── Claims by LOB ─────────────────────────────────────────────────────────
  const lobMap: Record<string, { count: number; grossValue: number }> = {};
  for (const c of periodFiltered) {
    if (!lobMap[c.line_of_business]) {
      lobMap[c.line_of_business] = { count: 0, grossValue: 0 };
    }
    lobMap[c.line_of_business].count      += 1;
    lobMap[c.line_of_business].grossValue += c.gross_claim_amount;
  }

  const claimsByLOB: ClaimsByLOB[] = Object.entries(lobMap).map(([lob, data]) => ({
    lob,
    count:      data.count,
    grossValue: convert(data.grossValue, currency),
    avgValue:   convert(data.count > 0 ? data.grossValue / data.count : 0, currency),
  }));

  // ── Reserve adequacy (IBNR) ───────────────────────────────────────────────
  const ibnrFiltered = subsidiaryCode === 'ALL'
    ? ibnr.filter(r => r.accounting_period <= period)
    : ibnr.filter(r => r.subsidiary_code === subsidiaryCode && r.accounting_period <= period);

  // Keep the latest period per sub+LOB
  const ibnrLatest: Record<string, IBNRReserveRow> = {};
  for (const row of ibnrFiltered) {
    const key = `${row.subsidiary_code}|${row.line_of_business}`;
    if (!ibnrLatest[key] || row.accounting_period > ibnrLatest[key].accounting_period) {
      ibnrLatest[key] = row;
    }
  }
  const reserveAdequacy = Object.values(ibnrLatest);

  // ── Settlement cycle by LOB ───────────────────────────────────────────────
  const lobDaysMap: Record<string, number[]> = {};
  for (const c of settledClaims) {
    if (c.settlement_days !== null) {
      if (!lobDaysMap[c.line_of_business]) lobDaysMap[c.line_of_business] = [];
      lobDaysMap[c.line_of_business].push(c.settlement_days);
    }
  }

  const settlementCycleByLOB: SettlementCycleByLOB[] = Object.entries(lobDaysMap).map(
    ([lob, days]) => {
      const avg = days.reduce((s, d) => s + d, 0) / days.length;
      const slaTarget = SLA_TARGETS[lob as LineOfBusiness] ?? 90;
      return {
        lob,
        avgDays:    Math.round(avg),
        slaTarget,
        ragStatus:  ragForSettlementCycle(avg, slaTarget),
      };
    },
  );

  return {
    totalGrossClaims:  convert(totalGrossClaims, currency),
    totalNetClaims:    convert(totalNetClaims,   currency),
    riRecoveryRate,
    avgSettlementDays: Math.round(avgSettlementDays),
    openCount,
    settledCount,
    litigationCount,
    largeLossItems,
    fraudItems,
    claimsByLOB,
    reserveAdequacy,
    settlementCycleByLOB,
  };
}
