import type { BalanceSheetGLRow } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

type AcctDef = { code: string; name: string; type: BalanceSheetGLRow['account_type'] };

const accounts: AcctDef[] = [
  { code: 'A101', name: 'Investment Portfolio',        type: 'Asset' },
  { code: 'A102', name: 'Cash & Bank Balances',        type: 'Asset' },
  { code: 'A103', name: 'Reinsurance Recoverables',    type: 'Asset' },
  { code: 'A104', name: 'Premium Receivables',         type: 'Asset' },
  { code: 'A105', name: 'Deferred Acquisition Cost',   type: 'Asset' },
  { code: 'A106', name: 'Other Assets',                type: 'Asset' },
  { code: 'L201', name: 'Unearned Premium Reserve',    type: 'Liability' },
  { code: 'L202', name: 'Outstanding Claims Reserve',  type: 'Liability' },
  { code: 'L203', name: 'IBNR Reserve',                type: 'Liability' },
  { code: 'L204', name: 'Other Liabilities',           type: 'Liability' },
  { code: 'E301', name: 'Share Capital',               type: 'Equity' },
  { code: 'E302', name: 'Share Premium',               type: 'Equity' },
  { code: 'E303', name: 'Retained Earnings',           type: 'Equity' },
];

// Base balances for LWL (flagship), scale factors for others
const lwlBase: Record<string, number> = {
  A101: 85_000_000_000,  A102: 8_000_000_000,  A103: 12_000_000_000,
  A104: 4_000_000_000,   A105: 1_200_000_000,  A106: 3_500_000_000,
  L201: 22_000_000_000,  L202: 28_000_000_000, L203: 12_000_000_000,
  L204: 8_000_000_000,   E301: 10_000_000_000, E302: 6_500_000_000,
  E303: 11_500_000_000,
};

const scaleFactor: Record<SubsidiaryCode, number> = {
  LWL: 1.00, LWG: 0.60, LWC: 0.25, LWH: 0.15,
  LWT: 0.18, LWP: 0.20, LWN: 0.35, ALL: 0,
};

const subsidiaries: SubsidiaryCode[] = ['LWL','LWG','LWC','LWH','LWT','LWP','LWN'];

const rows: BalanceSheetGLRow[] = [];
let idCtr = 1;

for (const sub of subsidiaries) {
  const sf = scaleFactor[sub];
  let prevPeriodBalance: Record<string, number> = {};

  for (let pi = 0; pi < periods.length; pi++) {
    const period = periods[pi];
    const growth = Math.pow(1.012, pi); // ~1.2% monthly balance growth
    const curBalances: Record<string, number> = {};

    for (const acc of accounts) {
      const base = lwlBase[acc.code] * sf;
      const balance = Math.round(base * growth);
      curBalances[acc.code] = balance;

      rows.push({
        bs_id: `BS-${String(idCtr++).padStart(5,'0')}`,
        subsidiary_code: sub,
        accounting_period: period,
        account_code: acc.code,
        account_name: acc.name,
        account_type: acc.type,
        balance,
        prior_period_balance: prevPeriodBalance[acc.code] ?? Math.round(base * Math.pow(1.012, pi - 1)),
      });
    }
    prevPeriodBalance = { ...curBalances };
  }
}

export const balanceSheetGL: BalanceSheetGLRow[] = rows;
