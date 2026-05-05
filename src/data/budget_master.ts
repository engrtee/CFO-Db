import type { BudgetMasterRow } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const subsidiaries: SubsidiaryCode[] = ['LWL','LWG','LWC','LWH','LWT','LWP','LWN'];

type AccountBudget = { code: string; annual2024: Record<SubsidiaryCode, number>; annual2025: Record<SubsidiaryCode, number> };

const budgets: AccountBudget[] = [
  {
    code: '4001',
    annual2024: { LWL:36_000_000_000, LWG:23_000_000_000, LWC:0, LWH:7_800_000_000, LWT:0, LWP:0, LWN:0, ALL:0 },
    annual2025: { LWL:40_000_000_000, LWG:26_000_000_000, LWC:0, LWH:9_000_000_000, LWT:0, LWP:0, LWN:0, ALL:0 },
  },
  {
    code: '6002',
    annual2024: { LWL:4_500_000_000, LWG:2_900_000_000, LWC:1_440_000_000, LWH:1_140_000_000, LWT:2_160_000_000, LWP:660_000_000, LWN:1_320_000_000, ALL:0 },
    annual2025: { LWL:4_950_000_000, LWG:3_150_000_000, LWC:1_560_000_000, LWH:1_260_000_000, LWT:2_340_000_000, LWP:720_000_000, LWN:1_440_000_000, ALL:0 },
  },
  {
    code: '7001',
    annual2024: { LWL:9_800_000_000, LWG:3_700_000_000, LWC:9_500_000_000, LWH:640_000_000, LWT:175_000_000, LWP:290_000_000, LWN:800_000_000, ALL:0 },
    annual2025: { LWL:11_000_000_000, LWG:4_200_000_000, LWC:10_500_000_000, LWH:720_000_000, LWT:200_000_000, LWP:330_000_000, LWN:920_000_000, ALL:0 },
  },
  {
    code: '9001',
    annual2024: { LWL:2_100_000_000, LWG:1_350_000_000, LWC:980_000_000, LWH:300_000_000, LWT:510_000_000, LWP:340_000_000, LWN:660_000_000, ALL:0 },
    annual2025: { LWL:2_400_000_000, LWG:1_500_000_000, LWC:1_100_000_000, LWH:340_000_000, LWT:560_000_000, LWP:380_000_000, LWN:740_000_000, ALL:0 },
  },
];

const rows: BudgetMasterRow[] = [];

for (const acc of budgets) {
  for (const sub of subsidiaries) {
    for (const year of [2024, 2025]) {
      const annual = year === 2024 ? acc.annual2024[sub] : acc.annual2025[sub];
      if (annual === 0) continue;
      const monthly = Math.round(annual / 12);

      for (let m = 1; m <= 12; m++) {
        const period = `${year}-${String(m).padStart(2,'0')}`;
        const ytd = monthly * m;
        rows.push({
          subsidiary_code: sub,
          fiscal_year: year,
          accounting_period: period,
          account_code: acc.code,
          annual_budget: annual,
          monthly_budget: monthly,
          ytd_budget: ytd,
        });
      }
    }
  }
}

export const budgetMaster: BudgetMasterRow[] = rows;
