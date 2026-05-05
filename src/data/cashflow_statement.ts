import type { CashflowStatementRow } from '../types/investment.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type SubConfig = {
  sub: SubsidiaryCode;
  openingCash2024: number;
  opCFBase: number;
  invCFBase: number; // typically negative
  finCFBase: number;
};

const configs: SubConfig[] = [
  { sub:'LWL', openingCash2024:7_200_000_000,  opCFBase:3_800_000_000,  invCFBase:-2_800_000_000, finCFBase:  80_000_000 },
  { sub:'LWG', openingCash2024:4_100_000_000,  opCFBase:2_200_000_000,  invCFBase:-1_600_000_000, finCFBase:  40_000_000 },
  { sub:'LWC', openingCash2024:5_500_000_000,  opCFBase:1_400_000_000,  invCFBase:-1_200_000_000, finCFBase:  20_000_000 },
  { sub:'LWH', openingCash2024:1_200_000_000,  opCFBase:  800_000_000,  invCFBase:  -500_000_000, finCFBase:  10_000_000 },
  { sub:'LWT', openingCash2024:  900_000_000,  opCFBase:  380_000_000,  invCFBase:  -250_000_000, finCFBase: -30_000_000 },
  { sub:'LWP', openingCash2024:  600_000_000,  opCFBase:  240_000_000,  invCFBase:  -180_000_000, finCFBase:  15_000_000 },
  { sub:'LWN', openingCash2024:2_400_000_000,  opCFBase:  950_000_000,  invCFBase:  -700_000_000, finCFBase:  25_000_000 },
];

export const cashflowStatement: CashflowStatementRow[] = configs.flatMap(cfg => {
  let openingCash = cfg.openingCash2024;
  const rows: CashflowStatementRow[] = [];

  for (let pi = 0; pi < periods.length; pi++) {
    const g = Math.pow(1.01, pi);
    // Some seasonal variation: Q4 stronger operating CF, Q1 weaker
    const seasonalOp  = pi % 12 === 11 ? 1.25 : pi % 12 === 0 ? 0.80 : 1.0;
    // Occasional large asset purchases
    const seasonalInv = pi % 6 === 2 ? 1.8 : pi % 6 === 5 ? 1.5 : 1.0;

    const opCF  = Math.round(cfg.opCFBase  * g * seasonalOp);
    const invCF = Math.round(cfg.invCFBase * g * seasonalInv);
    const finCF = Math.round(cfg.finCFBase * (pi % 12 === 11 ? -3 : 1)); // dividend payment in Dec
    const fcf   = opCF + invCF;
    const closing = openingCash + opCF + invCF + finCF;

    rows.push({
      subsidiary_code: cfg.sub,
      accounting_period: periods[pi],
      operating_cf: opCF,
      investing_cf: invCF,
      financing_cf: finCF,
      free_cash_flow: fcf,
      opening_cash: openingCash,
      closing_cash: closing,
    });

    openingCash = closing;
  }
  return rows;
});
