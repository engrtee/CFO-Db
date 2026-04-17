// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Segment Mock Data — GTBank FY 2024
// Segments: Retail | Corporate | Commercial
// All monetary values in RAW NAIRA
// ─────────────────────────────────────────────────────────────────────────────
import { SegmentKey } from '../lib/FilterContext';

export interface SegmentRow {
  id:               SegmentKey;
  name:             string;
  color:            string;
  outstanding:      number;   // ₦ raw naira
  disbursements:    number;   // ₦ raw naira (FY 2024)
  avgTicketSize:    number;   // ₦ raw naira
  par30:            number;   // % portfolio at risk >30 days
  par90:            number;   // % portfolio at risk >90 days
  nim:              number;   // % net interest margin
  feeIncome:        number;   // ₦ raw naira (annual)
  loanCount:        number;   // number of loans
  concentration:    number;   // % of total portfolio
  quarterlyPAR: {
    q: string;
    par30: number;
    par90: number;
  }[];
  nimTrend: { q: string; nim: number }[];
  disbursementTrend: { month: string; amount: number }[];
}

export const portfolioData: SegmentRow[] = [
  {
    id: 'corporate',
    name: 'Corporate Portfolio',
    color: '#F58220',
    outstanding:   480_483_727_548,
    disbursements: 162_000_000_000,
    avgTicketSize:  2_500_000_000,  // ₦2.5bn avg (large corporates)
    par30: 5.1,
    par90: 2.9,
    nim:   11.8,
    feeIncome: 14_200_000_000,
    loanCount: 192,
    concentration: 40.0,
    quarterlyPAR: [
      { q: 'Q1 2024', par30: 6.2, par90: 3.5 },
      { q: 'Q2 2024', par30: 5.8, par90: 3.2 },
      { q: 'Q3 2024', par30: 5.4, par90: 3.0 },
      { q: 'Q4 2024', par30: 5.1, par90: 2.9 },
    ],
    nimTrend: [
      { q: 'Q1 2024', nim: 11.0 },
      { q: 'Q2 2024', nim: 11.3 },
      { q: 'Q3 2024', nim: 11.6 },
      { q: 'Q4 2024', nim: 11.8 },
    ],
    disbursementTrend: [
      { month: 'Jan', amount: 11_000_000_000 },
      { month: 'Feb', amount: 12_000_000_000 },
      { month: 'Mar', amount: 15_000_000_000 },
      { month: 'Apr', amount: 13_000_000_000 },
      { month: 'May', amount: 14_000_000_000 },
      { month: 'Jun', amount: 16_000_000_000 },
      { month: 'Jul', amount: 12_000_000_000 },
      { month: 'Aug', amount: 13_000_000_000 },
      { month: 'Sep', amount: 14_000_000_000 },
      { month: 'Oct', amount: 15_000_000_000 },
      { month: 'Nov', amount: 13_000_000_000 },
      { month: 'Dec', amount: 14_000_000_000 },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial Portfolio',
    color: '#27AE60',
    outstanding:   420_423_761_604,
    disbursements: 138_000_000_000,
    avgTicketSize:    85_000_000,   // ₦85mn avg (SME/mid-market)
    par30: 6.4,
    par90: 3.7,
    nim:   13.1,
    feeIncome: 9_800_000_000,
    loanCount: 4_946,
    concentration: 35.0,
    quarterlyPAR: [
      { q: 'Q1 2024', par30: 7.5, par90: 4.4 },
      { q: 'Q2 2024', par30: 7.1, par90: 4.1 },
      { q: 'Q3 2024', par30: 6.7, par90: 3.9 },
      { q: 'Q4 2024', par30: 6.4, par90: 3.7 },
    ],
    nimTrend: [
      { q: 'Q1 2024', nim: 12.4 },
      { q: 'Q2 2024', nim: 12.7 },
      { q: 'Q3 2024', nim: 12.9 },
      { q: 'Q4 2024', nim: 13.1 },
    ],
    disbursementTrend: [
      { month: 'Jan', amount: 9_500_000_000 },
      { month: 'Feb', amount: 10_200_000_000 },
      { month: 'Mar', amount: 11_800_000_000 },
      { month: 'Apr', amount: 10_500_000_000 },
      { month: 'May', amount: 11_200_000_000 },
      { month: 'Jun', amount: 12_400_000_000 },
      { month: 'Jul', amount: 10_800_000_000 },
      { month: 'Aug', amount: 11_500_000_000 },
      { month: 'Sep', amount: 12_000_000_000 },
      { month: 'Oct', amount: 12_500_000_000 },
      { month: 'Nov', amount: 11_800_000_000 },
      { month: 'Dec', amount: 13_800_000_000 },
    ],
  },
  {
    id: 'retail',
    name: 'Retail Portfolio',
    color: '#3498DB',
    outstanding:   300_301_829_718,
    disbursements:  98_000_000_000,
    avgTicketSize:    18_500_000,   // ₦18.5mn avg (consumer/personal)
    par30: 8.2,
    par90: 4.8,
    nim:   14.2,
    feeIncome: 7_600_000_000,
    loanCount: 16_232,
    concentration: 25.0,
    quarterlyPAR: [
      { q: 'Q1 2024', par30: 9.4, par90: 5.6 },
      { q: 'Q2 2024', par30: 8.9, par90: 5.3 },
      { q: 'Q3 2024', par30: 8.6, par90: 5.0 },
      { q: 'Q4 2024', par30: 8.2, par90: 4.8 },
    ],
    nimTrend: [
      { q: 'Q1 2024', nim: 13.5 },
      { q: 'Q2 2024', nim: 13.8 },
      { q: 'Q3 2024', nim: 14.0 },
      { q: 'Q4 2024', nim: 14.2 },
    ],
    disbursementTrend: [
      { month: 'Jan', amount: 6_200_000_000 },
      { month: 'Feb', amount: 6_800_000_000 },
      { month: 'Mar', amount: 8_200_000_000 },
      { month: 'Apr', amount: 7_400_000_000 },
      { month: 'May', amount: 7_900_000_000 },
      { month: 'Jun', amount: 9_100_000_000 },
      { month: 'Jul', amount: 8_000_000_000 },
      { month: 'Aug', amount: 8_500_000_000 },
      { month: 'Sep', amount: 9_200_000_000 },
      { month: 'Oct', amount: 9_600_000_000 },
      { month: 'Nov', amount: 8_800_000_000 },
      { month: 'Dec', amount: 8_300_000_000 },
    ],
  },
];
