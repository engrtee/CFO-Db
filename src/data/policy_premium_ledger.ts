import type { PolicyPremiumLedgerRow } from '../types/financial.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

const periods = [
  '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06',
  '2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
  '2025-01','2025-02','2025-03','2025-04',
];

// 10 sample policies per period, alternating LWL and LWG
const policyTemplates: Array<{ id: string; sub: SubsidiaryCode; grossBase: number; riRate: number }> = [
  { id: 'POL-LWL-0001', sub: 'LWL', grossBase: 650_000_000, riRate: 0.15 },
  { id: 'POL-LWG-0001', sub: 'LWG', grossBase: 780_000_000, riRate: 0.25 },
  { id: 'POL-LWL-0002', sub: 'LWL', grossBase: 420_000_000, riRate: 0.15 },
  { id: 'POL-LWG-0002', sub: 'LWG', grossBase: 560_000_000, riRate: 0.25 },
  { id: 'POL-LWL-0003', sub: 'LWL', grossBase: 310_000_000, riRate: 0.15 },
  { id: 'POL-LWG-0003', sub: 'LWG', grossBase: 480_000_000, riRate: 0.25 },
  { id: 'POL-LWL-0004', sub: 'LWL', grossBase: 800_000_000, riRate: 0.15 },
  { id: 'POL-LWG-0004', sub: 'LWG', grossBase: 720_000_000, riRate: 0.25 },
  { id: 'POL-LWL-0005', sub: 'LWL', grossBase: 550_000_000, riRate: 0.15 },
  { id: 'POL-LWG-0005', sub: 'LWG', grossBase: 340_000_000, riRate: 0.25 },
];

const rows: PolicyPremiumLedgerRow[] = [];
let idCtr = 1;

for (let pi = 0; pi < periods.length; pi++) {
  const period = periods[pi];
  const growth = Math.pow(1.012, pi);

  for (const tpl of policyTemplates) {
    const gross = Math.round(tpl.grossBase * growth * (0.97 + Math.random() * 0.06));
    const ri    = Math.round(gross * tpl.riRate);
    const net   = gross - ri;
    const uprBf = Math.round(net * 0.42);
    const uprCf = Math.round(net * 0.38);
    const nep   = net - (uprCf - uprBf);

    rows.push({
      ledger_id: `LDG-${String(idCtr++).padStart(5,'0')}`,
      policy_id: `${tpl.id}-${period}`,
      subsidiary_code: tpl.sub,
      transaction_date: `${period}-15`,
      accounting_period: period,
      gross_premium_written: gross,
      reinsurance_ceded: ri,
      net_premium_written: net,
      unearned_premium_bf: uprBf,
      unearned_premium_cf: uprCf,
      net_earned_premium: nep,
      currency_code: 'NGN',
      exchange_rate: 1,
    });
  }
}

export const policyPremiumLedger: PolicyPremiumLedgerRow[] = rows;
