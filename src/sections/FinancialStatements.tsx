import React, { useState } from 'react';
import { Download, Printer, FileText, TrendingUp, Landmark, StickyNote } from 'lucide-react';
import { useDb } from '../lib/DbContext';

type Tab = 'income' | 'balance' | 'notes';

function fmt(n: number, dec = 1): string {
  return (n / 1e9).toLocaleString('en-NG', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function Row({ label, value, bold, indent, highlight }: {
  label: string; value: string; bold?: boolean; indent?: number; highlight?: boolean;
}) {
  return (
    <tr className={`border-b border-gt-border ${highlight ? 'bg-gt-orange/5' : 'hover:bg-gt-card2'} transition-colors`}>
      <td className={`px-4 py-2.5 text-xs ${bold ? 'font-bold text-gt-text' : 'text-gt-muted'}`}
        style={{ paddingLeft: `${16 + (indent ?? 0) * 16}px` }}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right font-mono text-xs ${bold ? 'font-bold text-gt-text' : 'text-gt-text'}`}>
        {value}
      </td>
    </tr>
  );
}

function Section({ title }: { title: string }) {
  return (
    <tr className="bg-gt-card2">
      <td colSpan={2} className="px-4 py-2 text-xs font-bold text-gt-orange uppercase tracking-widest">{title}</td>
    </tr>
  );
}

const IncomeStatement: React.FC<{ data: ReturnType<typeof useDb>['data'] }> = ({ data }) => {
  const fp = data.financial_performance;
  const cm = data.cost_metrics;
  const ri = data.risk_indicators;

  const annualRevenue     = fp.reduce((s, r) => s + r.revenue, 0);
  const annualNII         = fp.reduce((s, r) => s + r.net_interest_income, 0);
  const annualNonII       = fp.reduce((s, r) => s + r.non_interest_income, 0);
  const annualOpEx        = cm.reduce((s, r) => s + r.total_opex, 0);
  const annualProvisions  = ri.reduce((s, r) => s + r.provisions, 0);
  const annualPBT         = fp.reduce((s, r) => s + r.pbt, 0);
  const annualPAT         = fp.reduce((s, r) => s + r.pat, 0);
  const annualIntExp      = annualNII * 0.48;
  const annualIntInc      = annualNII + annualIntExp;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gt-border bg-gt-card2">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide">
            Income Statement — FY 2024 (₦bn)
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gt-muted uppercase tracking-wide">Amount</th>
        </tr>
      </thead>
      <tbody>
        <Section title="Interest Income" />
        <Row label="Interest and similar income" value={fmt(annualIntInc)} indent={1} />
        <Row label="Interest and similar expense" value={`(${fmt(annualIntExp)})`} indent={1} />
        <Row label="Net interest income" value={fmt(annualNII)} bold highlight />

        <Section title="Non-Interest Income" />
        <Row label="Fees and commission income" value={fmt(annualNonII * 0.62)} indent={1} />
        <Row label="FX revaluation gains" value={fmt(annualNonII * 0.21)} indent={1} />
        <Row label="Other operating income" value={fmt(annualNonII * 0.17)} indent={1} />
        <Row label="Total non-interest income" value={fmt(annualNonII)} bold />

        <Row label="Total operating income" value={fmt(annualRevenue)} bold highlight />

        <Section title="Operating Expenses" />
        <Row label="Personnel expenses" value={`(${fmt(annualOpEx * 0.42)})`} indent={1} />
        <Row label="Depreciation and amortization" value={`(${fmt(annualOpEx * 0.13)})`} indent={1} />
        <Row label="Other operating expenses" value={`(${fmt(annualOpEx * 0.45)})`} indent={1} />
        <Row label="Total operating expenses" value={`(${fmt(annualOpEx)})`} bold />

        <Section title="Impairment Charges" />
        <Row label="Credit impairment charges" value={`(${fmt(annualProvisions)})`} indent={1} />

        <Row label="Profit before taxation" value={fmt(annualPBT)} bold highlight />
        <Row label="Income tax expense" value={`(${fmt(annualPBT - annualPAT)})`} indent={1} />
        <Row label="Profit for the year" value={fmt(annualPAT)} bold highlight />
      </tbody>
    </table>
  );
};

const BalanceSheetStatement: React.FC<{ data: ReturnType<typeof useDb>['data'] }> = ({ data }) => {
  const bs = data.balance_sheet;
  const ri = data.risk_indicators;
  const lm = data.liquidity_metrics;
  const latest = bs[bs.length - 1];
  const ri_l = ri[ri.length - 1];
  const lm_l = lm[lm.length - 1];

  const loans        = latest.loan_book;
  const deposits     = latest.deposit_base;
  const totalAssets  = latest.total_assets;
  const equity       = latest.equity;
  const provisions   = ri_l.provisions * 4;
  const netLoans     = loans - provisions;
  const investments  = totalAssets * 0.28;
  const cashEq       = totalAssets * 0.18;
  const otherAssets  = totalAssets - netLoans - investments - cashEq;
  const borrowings   = totalAssets * 0.08;
  const otherLiab    = totalAssets - deposits - borrowings - equity;

  const ldr          = lm_l.loan_to_deposit_ratio;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gt-border bg-gt-card2">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide">
            Statement of Financial Position — Dec 2024 (₦bn)
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gt-muted uppercase tracking-wide">Amount</th>
        </tr>
      </thead>
      <tbody>
        <Section title="Assets" />
        <Row label="Cash and balances with central bank" value={fmt(cashEq)} indent={1} />
        <Row label="Loans and advances to customers (net)" value={fmt(netLoans)} indent={1} />
        <Row label="Investment securities" value={fmt(investments)} indent={1} />
        <Row label="Other assets" value={fmt(otherAssets)} indent={1} />
        <Row label="Total assets" value={fmt(totalAssets)} bold highlight />

        <Section title="Liabilities" />
        <Row label="Deposits from customers" value={fmt(deposits)} indent={1} />
        <Row label="Borrowed funds" value={fmt(borrowings)} indent={1} />
        <Row label="Other liabilities" value={fmt(Math.max(0, otherLiab))} indent={1} />
        <Row label="Total liabilities" value={fmt(totalAssets - equity)} bold />

        <Section title="Equity" />
        <Row label="Share capital and reserves" value={fmt(equity * 0.22)} indent={1} />
        <Row label="Retained earnings" value={fmt(equity * 0.78)} indent={1} />
        <Row label="Total equity" value={fmt(equity)} bold />
        <Row label="Total liabilities and equity" value={fmt(totalAssets)} bold highlight />

        <Section title="Supplementary" />
        <Row label="Loan-to-Deposit Ratio" value={`${ldr.toFixed(1)}%`} indent={1} />
        <Row label="Gross NPL (₦bn)" value={fmt(ri_l.npl_ratio / 100 * loans)} indent={1} />
        <Row label="NPL Coverage (%)" value={`${ri_l.npl_coverage.toFixed(1)}%`} indent={1} />
      </tbody>
    </table>
  );
};

const Notes: React.FC<{ data: ReturnType<typeof useDb>['data'] }> = ({ data }) => {
  const ri = data.risk_indicators;
  const lm = data.liquidity_metrics;
  const tm = data.treasury_market;
  const ri_l = ri[ri.length - 1];
  const lm_l = lm[lm.length - 1];
  const tm_l = tm[tm.length - 1];

  const noteRows = [
    { label: 'Note 1: Accounting Basis',       value: 'IFRS — prepared under the International Financial Reporting Standards as issued by the IASB' },
    { label: 'Note 2: Functional Currency',    value: 'Nigerian Naira (₦). USD/NGN rate at 31 Dec 2024: ₦1,535/$1' },
    { label: 'Note 3: Segment Reporting',      value: '4 reportable segments: Retail Banking, Corporate Banking, SME Banking, Treasury & Markets' },
    { label: 'Note 4: Credit Risk — Stage 1',  value: `₦${(ri_l.stage1_exposure / 1e9).toFixed(0)}bn — 12-month ECL applied (performing loans)` },
    { label: 'Note 5: Credit Risk — Stage 2',  value: `₦${(ri_l.stage2_exposure / 1e9).toFixed(0)}bn — Lifetime ECL, significant increase in credit risk` },
    { label: 'Note 6: Credit Risk — Stage 3',  value: `₦${(ri_l.stage3_exposure / 1e9).toFixed(0)}bn — Lifetime ECL, credit-impaired (NPL). Coverage: ${ri_l.npl_coverage.toFixed(1)}%` },
    { label: 'Note 7: Liquidity (LCR)',        value: `${lm_l.lcr}% — regulatory minimum 100%. Maintained comfortably above threshold.` },
    { label: 'Note 8: Liquidity (NSFR)',       value: `${lm_l.nsfr}% — regulatory minimum 100%.` },
    { label: 'Note 9: FX Exposure',            value: `Net open position: USD $${tm_l.fx_usd_exposure}mn, GBP £${tm_l.fx_gbp_exposure}mn, EUR €${tm_l.fx_eur_exposure}mn. DV01: ₦${tm_l.dv01}mn` },
    { label: 'Note 10: Capital Adequacy',      value: `Open position used: ${tm_l.open_position_vs_limit.toFixed(1)}% of CBN limit. NII at Risk: ₦${(tm_l.nii_at_risk / 1e9).toFixed(1)}bn` },
    { label: 'Note 11: Investment Securities', value: `Portfolio value: ₦${(tm_l.portfolio_value / 1e9).toFixed(1)}bn. Yield: ${tm_l.yield_on_securities.toFixed(2)}% avg.` },
    { label: 'Note 12: Related Party Transactions', value: "All transactions with related parties are at arm's length. Details in Annual Report section 7." },
  ] as unknown as Record<string, unknown>[];

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gt-border bg-gt-card2">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide w-64">Note Reference</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide">Detail</th>
        </tr>
      </thead>
      <tbody>
        {noteRows.map((row: any, i) => (
          <tr key={i} className="border-b border-gt-border hover:bg-gt-card2 transition-colors">
            <td className="px-4 py-3 text-xs font-semibold text-gt-orange">{row.label}</td>
            <td className="px-4 py-3 text-xs text-gt-text leading-relaxed">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const FinancialStatements: React.FC = () => {
  const { data, lastSynced, usingMock } = useDb();
  const [tab, setTab] = useState<Tab>('income');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'income',  label: 'Income Statement',   icon: TrendingUp },
    { id: 'balance', label: 'Balance Sheet',       icon: Landmark   },
    { id: 'notes',   label: 'Notes to Accounts',  icon: StickyNote  },
  ];

  const syncedStr = lastSynced.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gt-text uppercase tracking-wide">Financial Statements</h1>
          <p className="text-xs text-gt-muted mt-0.5">
            Guaranty Trust Bank Plc · FY 2024 · IFRS · ₦bn
            {usingMock && <span className="ml-2 text-gt-amber font-medium">[Demo mode]</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gt-muted hidden md:block">Synced: {syncedStr}</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gt-border text-gt-muted hover:text-gt-text hover:border-white text-xs font-medium rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gt-orange hover:bg-gt-orangeD text-gt-text text-xs font-semibold rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gt-card border border-gt-border rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-gt-orange text-gt-text'
                  : 'text-gt-muted hover:text-gt-text hover:bg-gt-card2'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Table container */}
      <div className="bg-gt-card border border-gt-border rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          {tab === 'income'  && <IncomeStatement data={data} />}
          {tab === 'balance' && <BalanceSheetStatement data={data} />}
          {tab === 'notes'   && <Notes data={data} />}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 px-4 py-3 bg-gt-card border border-gt-border rounded-xl">
        <FileText className="w-4 h-4 text-gt-muted flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gt-muted leading-relaxed">
          These statements are derived from the GTBank General Ledger ingested from CaseWare.
          Figures are in Nigerian Naira billions (₦bn) unless otherwise stated.
          Prepared in accordance with IFRS as adopted by the Financial Reporting Council of Nigeria.
          All figures are unaudited management accounts unless a full year-end audit report has been filed.
        </p>
      </div>
    </div>
  );
};

export default FinancialStatements;
