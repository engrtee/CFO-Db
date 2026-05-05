import type { IBNRReserveRow } from '../types/claims.types';
import type { LineOfBusiness } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type Config = {
  sub: SubsidiaryCode;
  lob: LineOfBusiness;
  monthlyClaimsBase: number;
  ocrMultiplier: number;   // OCR = monthlyClaimsBase * multiplier (open claims backlog)
  ibnrPct: number;         // IBNR = OCR * ibnrPct
  adequacyBase: number;    // actuarial best estimate ratio vs total reserve
};

const configs: Config[] = [
  { sub:'LWL', lob:'Life Individual',  monthlyClaimsBase:350_000_000,  ocrMultiplier:2.8, ibnrPct:0.22, adequacyBase:1.04 },
  { sub:'LWL', lob:'Life Group',       monthlyClaimsBase:220_000_000,  ocrMultiplier:2.5, ibnrPct:0.20, adequacyBase:1.06 },
  { sub:'LWL', lob:'Annuities',        monthlyClaimsBase:120_000_000,  ocrMultiplier:1.8, ibnrPct:0.15, adequacyBase:1.08 },
  { sub:'LWG', lob:'Motor',            monthlyClaimsBase:380_000_000,  ocrMultiplier:3.2, ibnrPct:0.28, adequacyBase:1.03 },
  { sub:'LWG', lob:'Fire & Property',  monthlyClaimsBase:180_000_000,  ocrMultiplier:4.0, ibnrPct:0.30, adequacyBase:1.05 },
  { sub:'LWG', lob:'Oil & Gas',        monthlyClaimsBase:140_000_000,  ocrMultiplier:5.5, ibnrPct:0.35, adequacyBase:1.02 },
  { sub:'LWG', lob:'Marine',           monthlyClaimsBase: 80_000_000,  ocrMultiplier:3.8, ibnrPct:0.27, adequacyBase:1.07 },
  { sub:'LWG', lob:'Engineering',      monthlyClaimsBase: 60_000_000,  ocrMultiplier:4.2, ibnrPct:0.32, adequacyBase:1.04 },
  // LWH Health — high frequency, lower OCR per claim, adequacy issue flagged
  { sub:'LWH', lob:'Health',           monthlyClaimsBase:510_000_000,  ocrMultiplier:2.2, ibnrPct:0.18, adequacyBase:0.91 },
  // LWG Aviation — low frequency, high severity, deep IBNR
  { sub:'LWG', lob:'Aviation',         monthlyClaimsBase: 35_000_000,  ocrMultiplier:6.0, ibnrPct:0.40, adequacyBase:1.01 },
];

const rows: IBNRReserveRow[] = [];

for (const cfg of configs) {
  for (let pi = 0; pi < periods.length; pi++) {
    const growth   = Math.pow(1.012, pi);
    const ocr      = Math.round(cfg.monthlyClaimsBase * cfg.ocrMultiplier * growth);
    const ibnr     = Math.round(ocr * cfg.ibnrPct);
    const total    = ocr + ibnr;
    // Add a slight drift so LWH Health deteriorates to 87% by mid-2025
    const lwHdeterioration = (cfg.sub === 'LWH' && pi > 8) ? 0.97 + (pi - 8) * 0.005 : 1;
    const actuarialBE      = Math.round(total * cfg.adequacyBase * lwHdeterioration);
    const adequacy         = actuarialBE / total;

    rows.push({
      subsidiary_code: cfg.sub,
      accounting_period: periods[pi],
      line_of_business: cfg.lob,
      ocr_amount: ocr,
      ibnr_amount: ibnr,
      total_reserve: total,
      actuarial_best_estimate: actuarialBE,
      adequacy_ratio: Math.round(adequacy * 1000) / 1000,
    });
  }
}

export const ibnrReserveSchedule: IBNRReserveRow[] = rows;
