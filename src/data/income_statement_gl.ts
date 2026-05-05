import type { IncomeStatementGLRow } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type AccountDef = {
  code: string;
  name: string;
  category: IncomeStatementGLRow['account_category'];
};

const accounts: AccountDef[] = [
  { code: '4001', name: 'Gross Written Premium',   category: 'Revenue' },
  { code: '4002', name: 'Reinsurance Ceded',        category: 'Revenue' },
  { code: '4003', name: 'Net Earned Premium',       category: 'Revenue' },
  { code: '5001', name: 'Claims Incurred',          category: 'Claims' },
  { code: '5002', name: 'IBNR Movement',            category: 'Claims' },
  { code: '6001', name: 'Commission Expense',       category: 'Expense' },
  { code: '6002', name: 'Management Expenses',      category: 'Expense' },
  { code: '7001', name: 'Investment Income',        category: 'Investment' },
  { code: '8001', name: 'Other Income',             category: 'Revenue' },
  { code: '9001', name: 'Income Tax',               category: 'Tax' },
];

// Monthly base actuals (₦) per subsidiary per account code
// Growth factor applied month-over-month = ~1.5% for insurance subs
const baseAmounts: Record<SubsidiaryCode, Record<string, number>> = {
  LWL: { '4001':3_100_000_000,'4002':-465_000_000,'4003':2_635_000_000,'5001':-1_449_250_000,'5002':-131_750_000,'6001':-265_000_000,'6002':-380_000_000,'7001':850_000_000,'8001':95_000_000,'9001':-180_000_000 },
  LWG: { '4001':2_000_000_000,'4002':-500_000_000,'4003':1_500_000_000,'5001':-870_000_000,'5002':-80_000_000,'6001':-200_000_000,'6002':-240_000_000,'7001':320_000_000,'8001':55_000_000,'9001':-110_000_000 },
  LWC: { '4001':0,'4002':0,'4003':0,'5001':0,'5002':0,'6001':0,'6002':-120_000_000,'7001':820_000_000,'8001':40_000_000,'9001':-82_000_000 },
  LWH: { '4001':680_000_000,'4002':-68_000_000,'4003':612_000_000,'5001':-459_000_000,'5002':-30_600_000,'6001':-61_200_000,'6002':-95_000_000,'7001':55_000_000,'8001':18_000_000,'9001':-25_000_000 },
  LWT: { '4001':0,'4002':0,'4003':0,'5001':0,'5002':0,'6001':0,'6002':-180_000_000,'7001':15_000_000,'8001':385_000_000,'9001':-42_000_000 },
  LWP: { '4001':0,'4002':0,'4003':0,'5001':0,'5002':0,'6001':0,'6002':-55_000_000,'7001':25_000_000,'8001':195_000_000,'9001':-28_000_000 },
  LWN: { '4001':0,'4002':0,'4003':0,'5001':0,'5002':0,'6001':0,'6002':-110_000_000,'7001':70_000_000,'8001':460_000_000,'9001':-55_000_000 },
  ALL:  { '4001':0,'4002':0,'4003':0,'5001':0,'5002':0,'6001':0,'6002':0,'7001':0,'8001':0,'9001':0 },
};

const subsidiaries: SubsidiaryCode[] = ['LWL','LWG','LWC','LWH','LWT','LWP','LWN'];

const rows: IncomeStatementGLRow[] = [];
let idCounter = 1;

for (const sub of subsidiaries) {
  const ytdActuals: Record<string, number> = {};
  const ytdBudgets: Record<string, number> = {};

  for (let pi = 0; pi < periods.length; pi++) {
    const period = periods[pi];
    const growth = Math.pow(1.015, pi);

    if (pi === 12) {
      Object.keys(ytdActuals).forEach(k => { ytdActuals[k] = 0; ytdBudgets[k] = 0; });
    }

    for (const acc of accounts) {
      const base = baseAmounts[sub][acc.code] ?? 0;
      if (base === 0) continue;

      const actual = Math.round(base * growth);
      // Budget: revenue lines 95-105%, cost lines 98-108%
      const budgetFactor = acc.category === 'Revenue' || acc.category === 'Investment'
        ? 1.0 + (((idCounter % 11) - 5) * 0.01)
        : 1.02 + ((idCounter % 7) * 0.01);
      const budget = Math.round(actual * budgetFactor);
      const priorYear = Math.round(actual * 0.87);
      const ic = (sub === 'LWL' && acc.code === '7001' && pi % 4 === 0) ? 25_000_000 : 0;

      ytdActuals[acc.code] = (ytdActuals[acc.code] ?? 0) + actual;
      ytdBudgets[acc.code] = (ytdBudgets[acc.code] ?? 0) + budget;

      rows.push({
        gl_id: `GL-${String(idCounter++).padStart(5,'0')}`,
        subsidiary_code: sub,
        accounting_period: period,
        account_code: acc.code,
        account_name: acc.name,
        account_category: acc.category,
        actual_amount: actual,
        budget_amount: budget,
        prior_year_amount: priorYear,
        ytd_actual: ytdActuals[acc.code],
        ytd_budget: ytdBudgets[acc.code],
        intercompany_elimination: ic,
        consolidated_amount: actual - ic,
      });
    }
  }
}

export const incomeStatementGL: IncomeStatementGLRow[] = rows;
