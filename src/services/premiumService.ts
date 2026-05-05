/**
 * premiumService.ts
 * Aggregates policy premium ledger, earning schedule, and broker data.
 * Pure function — no side effects.
 */

import type { ServiceParams } from '../types/subsidiary.types';
import type { PolicyPremiumLedgerRow, PremiumEarningScheduleRow } from '../types/financial.types';
import type { BrokerMasterRow } from '../types/regulatory.types';
import { policyPremiumLedger } from '../data/policy_premium_ledger';
import { premiumEarningSchedule } from '../data/premium_earning_schedule';
import { brokerMaster } from '../data/broker_master';

const USD_RATE = 1555; // CBN rate: 1 USD = 1555 NGN

// ─── Market-derived constants ──────────────────────────────────────────────────

const CHANNEL_SPLIT: { channel: string; pct: number }[] = [
  { channel: 'Broker',         pct: 58 },
  { channel: 'Direct',         pct: 18 },
  { channel: 'Bancassurance',  pct: 12 },
  { channel: 'Digital',        pct:  8 },
  { channel: 'Agent',          pct:  4 },
];

const RENEWAL_RETENTION_RATE  = 82; // %
const COLLECTION_EFFICIENCY   = 88; // %
const LAPSE_RATE              = 8;  // %

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChannelSplit {
  channel: string;
  value: number;
  pct: number;
}

export interface LOBSplit {
  lob: string;
  value: number;
  pct: number;
}

export interface SubsidiarySplit {
  subsidiary: string;
  value: number;
  pct: number;
}

export interface MonthlyPremiumTrend {
  period: string;
  newBusiness: number;
  renewals: number;
  total: number;
}

export interface PremiumResult {
  totalGWP: number;
  newBusinessGWP: number;
  renewalGWP: number;
  renewalRetentionRate: number;
  collectionEfficiency: number;
  policyLapseRate: number;
  gwpByChannel: ChannelSplit[];
  gwpByLOB: LOBSplit[];
  gwpBySubsidiary: SubsidiarySplit[];
  monthlyTrend: MonthlyPremiumTrend[];
  topBrokers: BrokerMasterRow[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function convert(value: number, currency: ServiceParams['currency']): number {
  return currency === 'USD' ? value / USD_RATE : value;
}

// ─── Service Function ──────────────────────────────────────────────────────────

export function getPremiumSummary(params: ServiceParams): PremiumResult {
  const { subsidiaryCode, period, currency } = params;
  const ledger:   PolicyPremiumLedgerRow[]     = policyPremiumLedger   ?? [];
  const schedule: PremiumEarningScheduleRow[]  = premiumEarningSchedule ?? [];
  const brokers:  BrokerMasterRow[]            = brokerMaster           ?? [];

  // ── Filter ledger by subsidiary & up to period ────────────────────────────
  const filteredLedger: PolicyPremiumLedgerRow[] = ledger.filter(r => {
    const subMatch  = subsidiaryCode === 'ALL' || r.subsidiary_code === subsidiaryCode;
    const perMatch  = r.accounting_period <= period;
    return subMatch && perMatch;
  });

  // ── Period-specific ledger (exact period match) ───────────────────────────
  const periodLedger = filteredLedger.filter(r => r.accounting_period === period);

  const totalGWP = periodLedger.reduce((s, r) => s + r.gross_premium_written, 0);

  // New business = 35% of total GWP, renewals = 65% (market benchmark)
  // In a real system this would come from a policy new/renewal flag
  const newBusinessGWP = totalGWP * 0.35;
  const renewalGWP     = totalGWP * 0.65;

  // ── Channel split ─────────────────────────────────────────────────────────
  const gwpByChannel: ChannelSplit[] = CHANNEL_SPLIT.map(c => ({
    channel: c.channel,
    value:   convert(totalGWP * (c.pct / 100), currency),
    pct:     c.pct,
  }));

  // ── LOB split (from premium earning schedule) ─────────────────────────────
  const filteredSchedule = schedule.filter(r => {
    const subMatch = subsidiaryCode === 'ALL' || r.subsidiary_code === subsidiaryCode;
    return subMatch && r.accounting_period === period;
  });

  const lobMap: Record<string, number> = {};
  for (const r of filteredSchedule) {
    lobMap[r.line_of_business] = (lobMap[r.line_of_business] ?? 0) + r.premium_written;
  }
  const lobTotal = Object.values(lobMap).reduce((s, v) => s + v, 0) || totalGWP || 1;

  const gwpByLOB: LOBSplit[] = Object.entries(lobMap).map(([lob, value]) => ({
    lob,
    value: convert(value, currency),
    pct:   (value / lobTotal) * 100,
  }));

  // ── Subsidiary split ──────────────────────────────────────────────────────
  const subMapGWP: Record<string, number> = {};
  for (const r of periodLedger) {
    const key = r.subsidiary_code as string;
    subMapGWP[key] = (subMapGWP[key] ?? 0) + r.gross_premium_written;
  }
  const subTotal = Object.values(subMapGWP).reduce((s, v) => s + v, 0) || totalGWP || 1;

  const gwpBySubsidiary: SubsidiarySplit[] = Object.entries(subMapGWP).map(
    ([subsidiary, value]) => ({
      subsidiary,
      value: convert(value, currency),
      pct:   (value / subTotal) * 100,
    }),
  );

  // ── Monthly trend ─────────────────────────────────────────────────────────
  const periodSet = [
    ...new Set(filteredLedger.map(r => r.accounting_period)),
  ].sort();

  const monthlyTrend: MonthlyPremiumTrend[] = periodSet.map(p => {
    const pRows  = filteredLedger.filter(r => r.accounting_period === p);
    const total  = pRows.reduce((s, r) => s + r.gross_premium_written, 0);
    const nb     = total * 0.35;
    const ren    = total * 0.65;
    return {
      period:      p,
      newBusiness: convert(nb,    currency),
      renewals:    convert(ren,   currency),
      total:       convert(total, currency),
    };
  });

  // ── Top brokers (filtered by primary subsidiary if not ALL) ───────────────
  const filteredBrokers = subsidiaryCode === 'ALL'
    ? brokers
    : brokers.filter(b => b.primary_subsidiary === subsidiaryCode);

  const topBrokers = [...filteredBrokers]
    .sort((a, b) => b.gwp_ytd - a.gwp_ytd)
    .slice(0, 10);

  return {
    totalGWP:              convert(totalGWP,        currency),
    newBusinessGWP:        convert(newBusinessGWP,  currency),
    renewalGWP:            convert(renewalGWP,      currency),
    renewalRetentionRate:  RENEWAL_RETENTION_RATE,
    collectionEfficiency:  COLLECTION_EFFICIENCY,
    policyLapseRate:       LAPSE_RATE,
    gwpByChannel,
    gwpByLOB,
    gwpBySubsidiary,
    monthlyTrend,
    topBrokers,
  };
}
