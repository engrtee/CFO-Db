import type { CashPositionRow } from '../types/investment.types';
import type { SubsidiaryCode } from '../types/subsidiary.types';

// 4 monthly snapshots × 7 subs × 3–5 bank accounts = 84+ entries
const snapshots = ['2025-01-31','2025-02-28','2025-03-31','2025-04-30'];

type AccountTemplate = {
  sub: SubsidiaryCode;
  bank: string;
  accNum: string;
  accType: string;
  ccy: string;
  balanceBase: number; // NGN equivalent base
  rate: number;
  intercompany: boolean;
};

const templates: AccountTemplate[] = [
  // LWL
  { sub:'LWL', bank:'Zenith Bank',  accNum:'1010234567', accType:'Current',       ccy:'NGN', balanceBase:4_500_000_000, rate:1,    intercompany:false },
  { sub:'LWL', bank:'Access Bank',  accNum:'0012345678', accType:'Current',       ccy:'NGN', balanceBase:2_800_000_000, rate:1,    intercompany:false },
  { sub:'LWL', bank:'First Bank',   accNum:'2023456789', accType:'Call Deposit',  ccy:'NGN', balanceBase:1_200_000_000, rate:1,    intercompany:false },
  { sub:'LWL', bank:'GTBank',       accNum:'0034567890', accType:'USD Account',   ccy:'USD', balanceBase:5_000_000,     rate:1563, intercompany:false },
  // LWG
  { sub:'LWG', bank:'Zenith Bank',  accNum:'1020234567', accType:'Current',       ccy:'NGN', balanceBase:2_200_000_000, rate:1,    intercompany:false },
  { sub:'LWG', bank:'Access Bank',  accNum:'0022345678', accType:'Current',       ccy:'NGN', balanceBase:1_500_000_000, rate:1,    intercompany:false },
  { sub:'LWG', bank:'GTBank',       accNum:'0044567890', accType:'Current',       ccy:'NGN', balanceBase:800_000_000,   rate:1,    intercompany:false },
  // LWC
  { sub:'LWC', bank:'Stanbic IBTC', accNum:'0050234567', accType:'Current',       ccy:'NGN', balanceBase:3_000_000_000, rate:1,    intercompany:false },
  { sub:'LWC', bank:'Zenith Bank',  accNum:'1050234567', accType:'Call Deposit',  ccy:'NGN', balanceBase:1_800_000_000, rate:1,    intercompany:false },
  { sub:'LWC', bank:'Citibank',     accNum:'0090234567', accType:'USD Account',   ccy:'USD', balanceBase:8_000_000,     rate:1563, intercompany:false },
  // LWH
  { sub:'LWH', bank:'GTBank',       accNum:'0060234567', accType:'Current',       ccy:'NGN', balanceBase:650_000_000,   rate:1,    intercompany:false },
  { sub:'LWH', bank:'Access Bank',  accNum:'0062345678', accType:'Current',       ccy:'NGN', balanceBase:420_000_000,   rate:1,    intercompany:false },
  { sub:'LWH', bank:'Zenith Bank',  accNum:'1060234567', accType:'Call Deposit',  ccy:'NGN', balanceBase:300_000_000,   rate:1,    intercompany:false },
  // LWT
  { sub:'LWT', bank:'First Bank',   accNum:'2070456789', accType:'Current',       ccy:'NGN', balanceBase:550_000_000,   rate:1,    intercompany:false },
  { sub:'LWT', bank:'UBA',          accNum:'2170456789', accType:'Current',       ccy:'NGN', balanceBase:380_000_000,   rate:1,    intercompany:false },
  { sub:'LWT', bank:'GTBank',       accNum:'0074567890', accType:'USD Account',   ccy:'USD', balanceBase:2_500_000,     rate:1563, intercompany:false },
  // LWP
  { sub:'LWP', bank:'Access Bank',  accNum:'0082345678', accType:'Current',       ccy:'NGN', balanceBase:320_000_000,   rate:1,    intercompany:false },
  { sub:'LWP', bank:'Zenith Bank',  accNum:'1080234567', accType:'Current',       ccy:'NGN', balanceBase:180_000_000,   rate:1,    intercompany:false },
  { sub:'LWP', bank:'First Bank',   accNum:'2083456789', accType:'Savings',       ccy:'NGN', balanceBase:120_000_000,   rate:1,    intercompany:true  },
  // LWN
  { sub:'LWN', bank:'Stanbic IBTC', accNum:'0090934567', accType:'Current',       ccy:'NGN', balanceBase:1_200_000_000, rate:1,    intercompany:false },
  { sub:'LWN', bank:'Zenith Bank',  accNum:'1090234567', accType:'Call Deposit',  ccy:'NGN', balanceBase:800_000_000,   rate:1,    intercompany:false },
  { sub:'LWN', bank:'GTBank',       accNum:'0094567890', accType:'Current',       ccy:'NGN', balanceBase:500_000_000,   rate:1,    intercompany:false },
];

let ctr = 1;
export const cashPositionDaily: CashPositionRow[] = snapshots.flatMap((date, di) =>
  templates.map(tpl => {
    const drift = Math.pow(1.008, di); // slight monthly balance growth
    const exchangeRate = tpl.ccy === 'USD' ? (tpl.rate + di * 5) : 1;
    const localBal = Math.round(tpl.balanceBase * drift * (0.95 + (ctr % 11) * 0.01));
    const ngnBal   = tpl.ccy === 'USD' ? Math.round(localBal * exchangeRate) : localBal;
    const available = Math.round(ngnBal * 0.98);

    ctr++;
    return {
      position_id: `CP-${String(ctr).padStart(4,'0')}`,
      subsidiary_code: tpl.sub,
      position_date: date,
      bank_name: tpl.bank,
      account_number: tpl.accNum,
      account_type: tpl.accType,
      currency_code: tpl.ccy,
      balance_local_ccy: localBal,
      exchange_rate_to_ngn: exchangeRate,
      balance_ngn: ngnBal,
      available_balance_ngn: available,
      intercompany_flag: tpl.intercompany,
    };
  })
);
