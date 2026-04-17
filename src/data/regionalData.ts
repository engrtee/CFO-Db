// ─────────────────────────────────────────────────────────────────────────────
// Regional / Geopolitical Zone Mock Data — GTBank FY 2024
// 6 Geopolitical Zones + Major City Branches
// All monetary values in RAW NAIRA
// ─────────────────────────────────────────────────────────────────────────────
import { ZoneKey } from '../lib/FilterContext';

export interface ZoneRow {
  id:               ZoneKey;
  name:             string;
  shortName:        string;
  states:           string[];
  portfolioSize:    number;   // ₦ raw naira
  nplRatio:         number;   // %
  growthRate:       number;   // % YoY
  branchCount:      number;
  agentCount:       number;
  revenue:          number;   // ₦ raw naira (annual)
  concentration:    number;   // % of total portfolio
  rag:              'green' | 'amber' | 'red';
  color:            string;   // map fill
  svgX:             number;   // normalized X for SVG positioning (0-100)
  svgY:             number;   // normalized Y for SVG positioning (0-100)
  quarterlyGrowth:  { q: string; growth: number }[];
}

export interface CityRow {
  city:          string;
  zone:          ZoneKey;
  portfolioSize: number;
  nplRatio:      number;
  branchCount:   number;
  revenue:       number;
  rag:           'green' | 'amber' | 'red';
}

// GTBank total loan book ₦1,201.2bn distributed across 6 zones
export const zoneData: ZoneRow[] = [
  {
    id: 'south_west',
    name: 'South West',
    shortName: 'SW',
    states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
    portfolioSize: 480_483_727_548,
    nplRatio: 3.9,
    growthRate: 12.4,
    branchCount: 142,
    agentCount: 3_840,
    revenue: 102_168_000_000,
    concentration: 40.0,
    rag: 'green',
    color: '#27AE60',
    svgX: 20,
    svgY: 72,
    quarterlyGrowth: [
      { q: 'Q1', growth: 8.2 }, { q: 'Q2', growth: 10.1 },
      { q: 'Q3', growth: 11.4 }, { q: 'Q4', growth: 12.4 },
    ],
  },
  {
    id: 'south_south',
    name: 'South South',
    shortName: 'SS',
    states: ['Rivers', 'Delta', 'Bayelsa', 'Edo', 'Cross River', 'Akwa Ibom'],
    portfolioSize: 180_181_397_831,
    nplRatio: 6.2,
    growthRate: 7.8,
    branchCount: 58,
    agentCount: 1_420,
    revenue: 38_388_000_000,
    concentration: 15.0,
    rag: 'amber',
    color: '#D97706',
    svgX: 48,
    svgY: 78,
    quarterlyGrowth: [
      { q: 'Q1', growth: 4.1 }, { q: 'Q2', growth: 5.6 },
      { q: 'Q3', growth: 6.7 }, { q: 'Q4', growth: 7.8 },
    ],
  },
  {
    id: 'north_central',
    name: 'North Central',
    shortName: 'NC',
    states: ['FCT', 'Niger', 'Kogi', 'Kwara', 'Nasarawa', 'Plateau', 'Benue'],
    portfolioSize: 156_157_511_453,
    nplRatio: 5.4,
    growthRate: 9.3,
    branchCount: 52,
    agentCount: 1_180,
    revenue: 33_237_000_000,
    concentration: 13.0,
    rag: 'amber',
    color: '#D97706',
    svgX: 48,
    svgY: 48,
    quarterlyGrowth: [
      { q: 'Q1', growth: 5.8 }, { q: 'Q2', growth: 7.0 },
      { q: 'Q3', growth: 8.2 }, { q: 'Q4', growth: 9.3 },
    ],
  },
  {
    id: 'south_east',
    name: 'South East',
    shortName: 'SE',
    states: ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
    portfolioSize: 144_145_118_264,
    nplRatio: 5.8,
    growthRate: 6.5,
    branchCount: 44,
    agentCount: 980,
    revenue: 30_680_000_000,
    concentration: 12.0,
    rag: 'amber',
    color: '#E07020',
    svgX: 68,
    svgY: 72,
    quarterlyGrowth: [
      { q: 'Q1', growth: 3.2 }, { q: 'Q2', growth: 4.6 },
      { q: 'Q3', growth: 5.7 }, { q: 'Q4', growth: 6.5 },
    ],
  },
  {
    id: 'north_west',
    name: 'North West',
    shortName: 'NW',
    states: ['Kano', 'Kaduna', 'Sokoto', 'Zamfara', 'Kebbi', 'Katsina', 'Jigawa'],
    portfolioSize: 132_133_024_976,
    nplRatio: 7.1,
    growthRate: 5.2,
    branchCount: 41,
    agentCount: 860,
    revenue: 28_122_000_000,
    concentration: 11.0,
    rag: 'red',
    color: '#E02020',
    svgX: 22,
    svgY: 22,
    quarterlyGrowth: [
      { q: 'Q1', growth: 2.1 }, { q: 'Q2', growth: 3.4 },
      { q: 'Q3', growth: 4.3 }, { q: 'Q4', growth: 5.2 },
    ],
  },
  {
    id: 'north_east',
    name: 'North East',
    shortName: 'NE',
    states: ['Borno', 'Yobe', 'Gombe', 'Bauchi', 'Adamawa', 'Taraba'],
    portfolioSize: 108_108_538_598,
    nplRatio: 9.4,
    growthRate: 3.8,
    branchCount: 29,
    agentCount: 520,
    revenue: 23_013_000_000,
    concentration: 9.0,
    rag: 'red',
    color: '#C0392B',
    svgX: 68,
    svgY: 22,
    quarterlyGrowth: [
      { q: 'Q1', growth: 1.0 }, { q: 'Q2', growth: 2.1 },
      { q: 'Q3', growth: 3.0 }, { q: 'Q4', growth: 3.8 },
    ],
  },
];

export const cityData: CityRow[] = [
  { city: 'Lagos',        zone: 'south_west',   portfolioSize: 316_000_000_000, nplRatio: 3.2, branchCount: 96,  revenue: 67_000_000_000, rag: 'green' },
  { city: 'Abuja (FCT)',  zone: 'north_central', portfolioSize: 105_000_000_000, nplRatio: 4.8, branchCount: 28,  revenue: 22_000_000_000, rag: 'green' },
  { city: 'Port Harcourt',zone: 'south_south',  portfolioSize:  82_000_000_000, nplRatio: 5.9, branchCount: 22,  revenue: 17_400_000_000, rag: 'amber' },
  { city: 'Kano',         zone: 'north_west',   portfolioSize:  68_000_000_000, nplRatio: 6.4, branchCount: 18,  revenue: 14_500_000_000, rag: 'amber' },
  { city: 'Ibadan',       zone: 'south_west',   portfolioSize:  60_000_000_000, nplRatio: 4.1, branchCount: 16,  revenue: 12_800_000_000, rag: 'green' },
  { city: 'Onitsha',      zone: 'south_east',   portfolioSize:  52_000_000_000, nplRatio: 5.2, branchCount: 12,  revenue: 11_100_000_000, rag: 'amber' },
  { city: 'Warri',        zone: 'south_south',  portfolioSize:  44_000_000_000, nplRatio: 6.8, branchCount: 10,  revenue:  9_400_000_000, rag: 'amber' },
  { city: 'Kaduna',       zone: 'north_west',   portfolioSize:  38_000_000_000, nplRatio: 7.2, branchCount:  9,  revenue:  8_100_000_000, rag: 'red'   },
  { city: 'Enugu',        zone: 'south_east',   portfolioSize:  36_000_000_000, nplRatio: 5.6, branchCount:  9,  revenue:  7_700_000_000, rag: 'amber' },
  { city: 'Maiduguri',    zone: 'north_east',   portfolioSize:  28_000_000_000, nplRatio: 9.8, branchCount:  8,  revenue:  5_900_000_000, rag: 'red'   },
];
