import type { RegulatoryCapitalRow } from '../types/regulatory.types';

// Quarterly Q1 2024 – Q1 2025 (5 periods) for regulated subs: LWL, LWG, LWH, LWN
const periods = ['2024-Q1','2024-Q2','2024-Q3','2024-Q4','2025-Q1'];

type SubCapitalBase = {
  snapshot_id_prefix: string;
  subsidiary_code: RegulatoryCapitalRow['subsidiary_code'];
  paid_up_capital: number;
  share_premium: number;
  retained_base: number;        // grows each quarter
  other_reserves: number;
  admissible_assets_base: number;
  total_liabilities_base: number;
  net_premium_base: number;
  naicom_min: number;
  rbc_placeholder: number;
};

const subs: SubCapitalBase[] = [
  {
    snapshot_id_prefix:'RC-LWL',
    subsidiary_code:'LWL',
    paid_up_capital:10_000_000_000,
    share_premium:6_500_000_000,
    retained_base:9_800_000_000,
    other_reserves:1_200_000_000,
    admissible_assets_base:115_000_000_000,
    total_liabilities_base:89_000_000_000,
    net_premium_base:30_000_000_000,
    naicom_min:8_000_000_000,
    rbc_placeholder:2.75,
  },
  {
    snapshot_id_prefix:'RC-LWG',
    subsidiary_code:'LWG',
    paid_up_capital:7_000_000_000,
    share_premium:3_200_000_000,
    retained_base:6_500_000_000,
    other_reserves:800_000_000,
    admissible_assets_base:58_000_000_000,
    total_liabilities_base:41_000_000_000,
    net_premium_base:18_500_000_000,
    naicom_min:5_000_000_000,
    rbc_placeholder:1.90,
  },
  {
    snapshot_id_prefix:'RC-LWH',
    subsidiary_code:'LWH',
    paid_up_capital:3_000_000_000,
    share_premium:1_200_000_000,
    retained_base:2_800_000_000,
    other_reserves:400_000_000,
    admissible_assets_base:18_500_000_000,
    total_liabilities_base:11_000_000_000,
    net_premium_base:8_000_000_000,
    naicom_min:5_000_000_000,
    rbc_placeholder:1.65,
  },
  {
    snapshot_id_prefix:'RC-LWN',
    subsidiary_code:'LWN',
    paid_up_capital:5_000_000_000,
    share_premium:2_000_000_000,
    retained_base:4_500_000_000,
    other_reserves:600_000_000,
    admissible_assets_base:32_000_000_000,
    total_liabilities_base:23_000_000_000,
    net_premium_base:0, // PFA — no premiums
    naicom_min:0,
    rbc_placeholder:1.45,
  },
];

const rows: RegulatoryCapitalRow[] = [];
let idCtr = 1;

for (const sub of subs) {
  for (let qi = 0; qi < periods.length; qi++) {
    const g = 1 + qi * 0.02; // 2% quarterly growth
    const retained = Math.round(sub.retained_base * g);
    const tsf = sub.paid_up_capital + sub.share_premium + retained + sub.other_reserves;
    const admissible = Math.round(sub.admissible_assets_base * g);
    const liabilities = Math.round(sub.total_liabilities_base * g);
    const netPremium = Math.round(sub.net_premium_base * g);
    const solvencyMarginNaira = admissible - liabilities;
    // Solvency ratio = (TSF - Min) / Net Premium Income  for insurance; rbc for pension
    const solvencyRatio = netPremium > 0
      ? Math.round(((solvencyMarginNaira) / netPremium) * 1000) / 1000
      : 0;
    const headroom = tsf - sub.naicom_min;

    rows.push({
      snapshot_id: `${sub.snapshot_id_prefix}-${String(idCtr++).padStart(3,'0')}`,
      subsidiary_code: sub.subsidiary_code,
      reporting_period: periods[qi],
      paid_up_capital: sub.paid_up_capital,
      share_premium: sub.share_premium,
      retained_earnings: retained,
      other_reserves: sub.other_reserves,
      total_shareholders_funds: tsf,
      total_admissible_assets: admissible,
      total_liabilities: liabilities,
      net_premium_income: netPremium,
      solvency_margin_naira: solvencyMarginNaira,
      solvency_margin_ratio: solvencyRatio,
      naicom_minimum_capital: sub.naicom_min,
      capital_headroom: headroom,
      rbc_ratio_placeholder: sub.rbc_placeholder,
    });
  }
}

export const regulatoryCapitalSnapshot: RegulatoryCapitalRow[] = rows;
