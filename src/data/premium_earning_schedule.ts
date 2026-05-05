import type { PremiumEarningScheduleRow } from '../types/financial.types';
import type { LineOfBusiness } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type SubLOBConfig = {
  sub: SubsidiaryCode;
  lob: LineOfBusiness;
  monthlyWritten: number;
  earningRate: number; // fraction earned per month (1=fully earned, 0.083=annual)
};

const configs: SubLOBConfig[] = [
  // LWL — Life subs (slow earning, annual policies)
  { sub:'LWL', lob:'Life Individual',  monthlyWritten:1_400_000_000, earningRate:0.085 },
  { sub:'LWL', lob:'Life Group',       monthlyWritten:1_000_000_000, earningRate:0.090 },
  { sub:'LWL', lob:'Annuities',        monthlyWritten:  600_000_000, earningRate:0.083 },
  // LWG — General (faster earning)
  { sub:'LWG', lob:'Motor',            monthlyWritten:  680_000_000, earningRate:0.950 },
  { sub:'LWG', lob:'Fire & Property',  monthlyWritten:  520_000_000, earningRate:0.083 },
  { sub:'LWG', lob:'Marine',           monthlyWritten:  200_000_000, earningRate:0.250 },
  { sub:'LWG', lob:'Engineering',      monthlyWritten:  150_000_000, earningRate:0.120 },
  { sub:'LWG', lob:'Oil & Gas',        monthlyWritten:  280_000_000, earningRate:0.095 },
  { sub:'LWG', lob:'Aviation',         monthlyWritten:   90_000_000, earningRate:0.083 },
  // LWH — Health (monthly policies, near-fully earned)
  { sub:'LWH', lob:'Health',           monthlyWritten:  680_000_000, earningRate:0.920 },
  // LWT, LWP, LWN — non-insurance, use Other Income proxy via Health LOB placeholder
  { sub:'LWT', lob:'Health',           monthlyWritten:  385_000_000, earningRate:1.000 },
  { sub:'LWP', lob:'Health',           monthlyWritten:  195_000_000, earningRate:1.000 },
  { sub:'LWN', lob:'Health',           monthlyWritten:  460_000_000, earningRate:1.000 },
];

const rows: PremiumEarningScheduleRow[] = [];

for (const cfg of configs) {
  let uprOpening = Math.round(cfg.monthlyWritten * (1 - cfg.earningRate) * 3);

  for (let pi = 0; pi < periods.length; pi++) {
    const growth = Math.pow(1.012, pi);
    const written = Math.round(cfg.monthlyWritten * growth);
    const earned  = Math.round((uprOpening + written) * cfg.earningRate);
    const uprClosing = uprOpening + written - earned;

    rows.push({
      subsidiary_code: cfg.sub,
      accounting_period: periods[pi],
      line_of_business: cfg.lob,
      upr_opening: uprOpening,
      premium_written: written,
      premium_earned: earned,
      upr_closing: uprClosing,
    });

    uprOpening = uprClosing;
  }
}

export const premiumEarningSchedule: PremiumEarningScheduleRow[] = rows;
