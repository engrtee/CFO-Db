import type { ClaimsRegisterRow } from '../types/claims.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';
import type { LineOfBusiness } from '../types/financial.types';

type ClaimTemplate = {
  sub: SubsidiaryCode;
  lob: LineOfBusiness;
  grossMin: number;
  grossMax: number;
  riRate: number;
  statusDist: [string, number][]; // [status, weight]
  settleDays?: [number, number];
};

const templates: ClaimTemplate[] = [
  { sub:'LWG', lob:'Motor',           grossMin:500_000,    grossMax:8_000_000,    riRate:0.05, statusDist:[['Settled',50],['Open',35],['Litigation',10],['Repudiated',5]],  settleDays:[15,90] },
  { sub:'LWG', lob:'Fire & Property', grossMin:2_000_000,  grossMax:80_000_000,   riRate:0.35, statusDist:[['Settled',40],['Open',38],['Litigation',15],['Repudiated',7]],  settleDays:[30,180] },
  { sub:'LWL', lob:'Life Individual', grossMin:1_000_000,  grossMax:25_000_000,   riRate:0.10, statusDist:[['Settled',55],['Open',30],['Litigation',8],['Repudiated',7]],   settleDays:[20,60] },
  { sub:'LWH', lob:'Health',          grossMin:200_000,    grossMax:3_500_000,    riRate:0.02, statusDist:[['Settled',60],['Open',32],['Litigation',5],['Repudiated',3]],   settleDays:[7,45] },
  { sub:'LWG', lob:'Oil & Gas',       grossMin:10_000_000, grossMax:500_000_000,  riRate:0.70, statusDist:[['Settled',30],['Open',40],['Litigation',22],['Repudiated',8]],  settleDays:[60,300] },
  { sub:'LWG', lob:'Marine',          grossMin:1_500_000,  grossMax:35_000_000,   riRate:0.40, statusDist:[['Settled',45],['Open',35],['Litigation',12],['Repudiated',8]],  settleDays:[30,150] },
  { sub:'LWG', lob:'Engineering',     grossMin:3_000_000,  grossMax:60_000_000,   riRate:0.45, statusDist:[['Settled',38],['Open',40],['Litigation',14],['Repudiated',8]],  settleDays:[45,200] },
  { sub:'LWL', lob:'Life Group',      grossMin:2_000_000,  grossMax:40_000_000,   riRate:0.15, statusDist:[['Settled',50],['Open',30],['Litigation',12],['Repudiated',8]],  settleDays:[25,90] },
  { sub:'LWG', lob:'Aviation',        grossMin:5_000_000,  grossMax:120_000_000,  riRate:0.65, statusDist:[['Settled',25],['Open',45],['Litigation',20],['Repudiated',10]], settleDays:[90,365] },
  { sub:'LWL', lob:'Annuities',       grossMin:500_000,    grossMax:5_000_000,    riRate:0.05, statusDist:[['Settled',65],['Open',25],['Litigation',6],['Repudiated',4]],   settleDays:[10,30] },
];

// Distribution of 350 claims across templates (roughly matching brief percentages)
const claimCounts = [140, 70, 53, 35, 28, 8, 7, 5, 2, 2];

const lossDates = [
  '2024-01-12','2024-02-08','2024-02-25','2024-03-15','2024-04-03',
  '2024-04-22','2024-05-10','2024-05-28','2024-06-14','2024-07-02',
  '2024-07-19','2024-08-06','2024-08-23','2024-09-11','2024-10-01',
  '2024-10-18','2024-11-05','2024-11-22','2024-12-10','2024-12-28',
  '2025-01-09','2025-01-27','2025-02-13','2025-02-28','2025-03-14',
];

function pickStatus(dist: [string, number][], seed: number): string {
  const total = dist.reduce((s, [, w]) => s + w, 0);
  let val = (seed * 37 + 13) % total;
  for (const [status, w] of dist) { if (val < w) return status; val -= w; }
  return dist[0][0];
}

const rows: ClaimsRegisterRow[] = [];
let ctr = 1;
let largeLossCount = 0;
let fraudCount = 0;

for (let ti = 0; ti < templates.length; ti++) {
  const tpl = templates[ti];
  const count = claimCounts[ti] ?? 0;

  for (let i = 0; i < count; i++) {
    const seed = ctr + i * 7;
    const grossRange = tpl.grossMax - tpl.grossMin;
    const grossClaim = tpl.grossMin + Math.round(grossRange * ((seed * 31 + 17) % 100) / 100);
    const riRecovery = Math.round(grossClaim * tpl.riRate);
    const netClaim   = grossClaim - riRecovery;
    const status     = pickStatus(tpl.statusDist, seed) as ClaimsRegisterRow['claim_status'];
    const isLarge    = grossClaim > 50_000_000 && largeLossCount < 18;
    const isFraud    = (seed % 51 === 0) && fraudCount < 7 && status === 'Repudiated';

    if (isLarge) largeLossCount++;
    if (isFraud) fraudCount++;

    const lossDate    = lossDates[seed % lossDates.length];
    const reportedDays= 3 + (seed % 12);
    const reportedDate= new Date(new Date(lossDate).getTime() + reportedDays * 86_400_000)
      .toISOString().slice(0,10);

    let settledDate: string | null = null;
    let settlementDays: number | null = null;

    if (status === 'Settled' && tpl.settleDays) {
      const [lo, hi] = tpl.settleDays;
      settlementDays = lo + (seed % (hi - lo));
      settledDate = new Date(new Date(reportedDate).getTime() + settlementDays * 86_400_000)
        .toISOString().slice(0,10);
    }

    const handlerNum = 1 + (seed % 25);

    rows.push({
      claim_id: `CLM-${String(ctr++).padStart(5,'0')}`,
      policy_id: `POL-${tpl.sub}-${String(seed % 2000 + 1).padStart(4,'0')}`,
      subsidiary_code: tpl.sub,
      line_of_business: tpl.lob,
      date_of_loss: lossDate,
      date_reported: reportedDate,
      date_settled: settledDate,
      gross_claim_amount: grossClaim,
      reinsurance_recovery: riRecovery,
      net_claim_amount: netClaim,
      claim_status: status,
      ibnr_flag: status === 'Open',
      large_loss_flag: isLarge,
      fraud_flag: isFraud,
      settlement_days: settlementDays,
      claim_handler_id: `CH${String(handlerNum).padStart(3,'0')}`,
    });
  }
}

export const claimsRegister: ClaimsRegisterRow[] = rows;
