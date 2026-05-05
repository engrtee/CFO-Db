import type { InvestmentIncomeLedgerRow } from '../types/investment.types';
import type { InstrumentType } from '../types/investment.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type Config = {
  sub: SubsidiaryCode;
  type: InstrumentType;
  interestBase: number;
  dividendBase: number;
  realisedBase: number;
  unrealisedBase: number;
};

const configs: Config[] = [
  // LWL
  { sub:'LWL', type:'FGS',            interestBase:850_000_000,  dividendBase:0,           realisedBase:20_000_000,  unrealisedBase:60_000_000 },
  { sub:'LWL', type:'State Bond',     interestBase:95_000_000,   dividendBase:0,           realisedBase:5_000_000,   unrealisedBase:8_000_000 },
  { sub:'LWL', type:'Corporate Bond', interestBase:110_000_000,  dividendBase:0,           realisedBase:8_000_000,   unrealisedBase:12_000_000 },
  { sub:'LWL', type:'Equity',         interestBase:0,            dividendBase:55_000_000,  realisedBase:30_000_000,  unrealisedBase:80_000_000 },
  { sub:'LWL', type:'MMI',            interestBase:55_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWG
  { sub:'LWG', type:'FGS',            interestBase:320_000_000,  dividendBase:0,           realisedBase:8_000_000,   unrealisedBase:20_000_000 },
  { sub:'LWG', type:'State Bond',     interestBase:42_000_000,   dividendBase:0,           realisedBase:2_000_000,   unrealisedBase:3_000_000 },
  { sub:'LWG', type:'Corporate Bond', interestBase:52_000_000,   dividendBase:0,           realisedBase:3_000_000,   unrealisedBase:5_000_000 },
  { sub:'LWG', type:'Equity',         interestBase:0,            dividendBase:18_000_000,  realisedBase:12_000_000,  unrealisedBase:25_000_000 },
  { sub:'LWG', type:'MMI',            interestBase:28_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWC
  { sub:'LWC', type:'FGS',            interestBase:450_000_000,  dividendBase:0,           realisedBase:15_000_000,  unrealisedBase:35_000_000 },
  { sub:'LWC', type:'State Bond',     interestBase:55_000_000,   dividendBase:0,           realisedBase:3_000_000,   unrealisedBase:4_000_000 },
  { sub:'LWC', type:'Corporate Bond', interestBase:80_000_000,   dividendBase:0,           realisedBase:5_000_000,   unrealisedBase:8_000_000 },
  { sub:'LWC', type:'Equity',         interestBase:0,            dividendBase:95_000_000,  realisedBase:45_000_000,  unrealisedBase:120_000_000 },
  { sub:'LWC', type:'MMI',            interestBase:150_000_000,  dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWH
  { sub:'LWH', type:'FGS',            interestBase:48_000_000,   dividendBase:0,           realisedBase:1_000_000,   unrealisedBase:2_000_000 },
  { sub:'LWH', type:'State Bond',     interestBase:8_000_000,    dividendBase:0,           realisedBase:0,           unrealisedBase:500_000 },
  { sub:'LWH', type:'Corporate Bond', interestBase:9_000_000,    dividendBase:0,           realisedBase:0,           unrealisedBase:800_000 },
  { sub:'LWH', type:'Equity',         interestBase:0,            dividendBase:4_000_000,   realisedBase:0,           unrealisedBase:2_000_000 },
  { sub:'LWH', type:'MMI',            interestBase:6_000_000,    dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWT
  { sub:'LWT', type:'MMI',            interestBase:10_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  { sub:'LWT', type:'FGS',            interestBase:5_000_000,    dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWP
  { sub:'LWP', type:'MMI',            interestBase:15_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  { sub:'LWP', type:'FGS',            interestBase:10_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
  // LWN
  { sub:'LWN', type:'FGS',            interestBase:180_000_000,  dividendBase:0,           realisedBase:5_000_000,   unrealisedBase:10_000_000 },
  { sub:'LWN', type:'State Bond',     interestBase:28_000_000,   dividendBase:0,           realisedBase:1_000_000,   unrealisedBase:2_000_000 },
  { sub:'LWN', type:'Corporate Bond', interestBase:25_000_000,   dividendBase:0,           realisedBase:1_000_000,   unrealisedBase:1_500_000 },
  { sub:'LWN', type:'Equity',         interestBase:0,            dividendBase:22_000_000,  realisedBase:8_000_000,   unrealisedBase:15_000_000 },
  { sub:'LWN', type:'MMI',            interestBase:35_000_000,   dividendBase:0,           realisedBase:0,           unrealisedBase:0 },
];

export const investmentIncomeLedger: InvestmentIncomeLedgerRow[] = configs.flatMap(cfg =>
  periods.map((period, pi) => {
    const g    = Math.pow(1.012, pi);
    // Equities: unrealised gains can be negative in some months
    const ugl  = cfg.type === 'Equity'
      ? Math.round(cfg.unrealisedBase * g * (pi % 3 === 0 ? -0.4 : 1))
      : Math.round(cfg.unrealisedBase * g);
    const int_ = Math.round(cfg.interestBase * g);
    const div  = Math.round(cfg.dividendBase * g * (pi % 3 === 1 ? 3 : pi % 3 === 2 ? 0 : 0)); // quarterly dividends
    const real = Math.round(cfg.realisedBase * g * (pi % 6 === 5 ? 3 : pi % 6 === 2 ? 1.5 : 0.5));

    return {
      subsidiary_code: cfg.sub,
      accounting_period: period,
      instrument_type: cfg.type,
      interest_income: int_,
      dividend_income: div,
      realised_gains: real,
      unrealised_gains: ugl,
      total_income: int_ + div + real + ugl,
    };
  })
);
