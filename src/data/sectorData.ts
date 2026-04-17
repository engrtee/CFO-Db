// ─────────────────────────────────────────────────────────────────────────────
// Sector Analysis Mock Data — GTBank FY 2024
// Loan book total: ₦1,201.2bn  |  All monetary values in RAW NAIRA
// ─────────────────────────────────────────────────────────────────────────────
import { SectorKey } from '../lib/FilterContext';

export interface SectorRow {
  id:                  SectorKey;
  name:                string;
  shortName:           string;
  exposure:            number;   // ₦ raw naira
  nplRatio:            number;   // %
  revenueContribution: number;   // % of total bank revenue
  yoyGrowth:           number;   // %
  riskConcentration:   number;   // % of total loan book
  rag:                 'green' | 'amber' | 'red';
  color:               string;
  quarterlyNPL:        { q: string; npl: number }[];
  quarterlyExposure:   { q: string; exposure: number }[];
}

// GTBank total loan book ₦1,201.2bn distributed across 7 sectors
export const sectorData: SectorRow[] = [
  {
    id: 'oil_gas',
    name: 'Oil & Gas',
    shortName: 'Oil & Gas',
    exposure: 264_264_050_151,
    nplRatio: 8.2,
    revenueContribution: 28.0,
    yoyGrowth: 5.1,
    riskConcentration: 22.0,
    rag: 'red',
    color: '#E02020',
    quarterlyNPL:      [{ q: 'Q1', npl: 9.1 }, { q: 'Q2', npl: 8.8 }, { q: 'Q3', npl: 8.5 }, { q: 'Q4', npl: 8.2 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 251_000_000_000 }, { q: 'Q2', exposure: 256_000_000_000 }, { q: 'Q3', exposure: 260_000_000_000 }, { q: 'Q4', exposure: 264_264_050_151 }],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    shortName: 'Manuf.',
    exposure: 216_216_477_397,
    nplRatio: 4.2,
    revenueContribution: 22.0,
    yoyGrowth: 18.3,
    riskConcentration: 18.0,
    rag: 'green',
    color: '#27AE60',
    quarterlyNPL:      [{ q: 'Q1', npl: 5.1 }, { q: 'Q2', npl: 4.8 }, { q: 'Q3', npl: 4.5 }, { q: 'Q4', npl: 4.2 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 183_000_000_000 }, { q: 'Q2', exposure: 196_000_000_000 }, { q: 'Q3', exposure: 206_000_000_000 }, { q: 'Q4', exposure: 216_216_477_397 }],
  },
  {
    id: 'fintech',
    name: 'Fintech / Finance',
    shortName: 'Fintech',
    exposure: 180_180_397_831,
    nplRatio: 2.1,
    revenueContribution: 16.0,
    yoyGrowth: 34.8,
    riskConcentration: 15.0,
    rag: 'green',
    color: '#F58220',
    quarterlyNPL:      [{ q: 'Q1', npl: 2.8 }, { q: 'Q2', npl: 2.5 }, { q: 'Q3', npl: 2.3 }, { q: 'Q4', npl: 2.1 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 133_000_000_000 }, { q: 'Q2', exposure: 150_000_000_000 }, { q: 'Q3', exposure: 163_000_000_000 }, { q: 'Q4', exposure: 180_180_397_831 }],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    shortName: 'Agric.',
    exposure: 156_157_511_453,
    nplRatio: 6.8,
    revenueContribution: 13.0,
    yoyGrowth: 21.7,
    riskConcentration: 13.0,
    rag: 'amber',
    color: '#D97706',
    quarterlyNPL:      [{ q: 'Q1', npl: 7.8 }, { q: 'Q2', npl: 7.4 }, { q: 'Q3', npl: 7.0 }, { q: 'Q4', npl: 6.8 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 128_000_000_000 }, { q: 'Q2', exposure: 138_000_000_000 }, { q: 'Q3', exposure: 147_000_000_000 }, { q: 'Q4', exposure: 156_157_511_453 }],
  },
  {
    id: 'transport',
    name: 'Transport & Logistics',
    shortName: 'Transport',
    exposure: 120_120_931_887,
    nplRatio: 5.9,
    revenueContribution: 10.0,
    yoyGrowth: 9.2,
    riskConcentration: 10.0,
    rag: 'amber',
    color: '#9B59B6',
    quarterlyNPL:      [{ q: 'Q1', npl: 6.5 }, { q: 'Q2', npl: 6.3 }, { q: 'Q3', npl: 6.1 }, { q: 'Q4', npl: 5.9 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 110_000_000_000 }, { q: 'Q2', exposure: 113_000_000_000 }, { q: 'Q3', exposure: 116_000_000_000 }, { q: 'Q4', exposure: 120_120_931_887 }],
  },
  {
    id: 'power',
    name: 'Power / Energy',
    shortName: 'Power',
    exposure: 108_108_838_698,
    nplRatio: 7.5,
    revenueContribution: 7.0,
    yoyGrowth: 13.6,
    riskConcentration: 9.0,
    rag: 'red',
    color: '#E74C3C',
    quarterlyNPL:      [{ q: 'Q1', npl: 8.3 }, { q: 'Q2', npl: 8.0 }, { q: 'Q3', npl: 7.8 }, { q: 'Q4', npl: 7.5 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 95_000_000_000 }, { q: 'Q2', exposure: 99_000_000_000 }, { q: 'Q3', exposure: 103_000_000_000 }, { q: 'Q4', exposure: 108_108_838_698 }],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    shortName: 'Insurance',
    exposure: 96_097_111_754,
    nplRatio: 1.8,
    revenueContribution: 4.0,
    yoyGrowth: 2.9,
    riskConcentration: 8.0,
    rag: 'green',
    color: '#3498DB',
    quarterlyNPL:      [{ q: 'Q1', npl: 2.2 }, { q: 'Q2', npl: 2.1 }, { q: 'Q3', npl: 1.9 }, { q: 'Q4', npl: 1.8 }],
    quarterlyExposure: [{ q: 'Q1', exposure: 93_000_000_000 }, { q: 'Q2', exposure: 94_000_000_000 }, { q: 'Q3', exposure: 95_000_000_000 }, { q: 'Q4', exposure: 96_097_111_754 }],
  },
];

export const TOTAL_LOAN_BOOK = 1_201_209_318_870;
