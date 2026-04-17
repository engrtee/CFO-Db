import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Landmark, ShieldAlert, Droplets,
  Building2, Target, Activity, Users, ArrowUpRight, PieChart,
} from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { fmtNGN, fmtNGNShort, fmtPct, pctChange } from '../lib/fmt';

function StatBadge({ val, good }: { val: number; good: boolean }) {
  const sign = val >= 0 ? '+' : '';
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${good ? 'text-gt-green' : 'text-gt-red'}`}>
      {sign}{val.toFixed(1)}%
    </span>
  );
}

interface PanelProps {
  path: string;
  icon: React.ElementType;
  label: string;
  kpis: { label: string; value: string; change?: number; goodUp?: boolean }[];
  rag?: 'green' | 'amber' | 'red';
}

function Panel({ path, icon: Icon, label, kpis, rag }: PanelProps) {
  const ragDot = rag === 'green' ? 'bg-gt-green' : rag === 'amber' ? 'bg-gt-amber' : rag === 'red' ? 'bg-gt-red' : null;
  return (
    <Link
      to={path}
      className="group bg-gt-card border border-gt-border rounded-2xl hover:border-gt-orange transition-all duration-200 p-5 flex flex-col gap-4 cursor-pointer shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gt-orange/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gt-orange" />
          </div>
          <span className="text-sm font-semibold text-gt-text">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {ragDot && <span className={`w-2 h-2 rounded-full ${ragDot}`} />}
          <ArrowUpRight className="w-4 h-4 text-gt-border group-hover:text-gt-orange transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {kpis.map((k) => {
          const chg = k.change !== undefined ? ((k.goodUp ?? true) ? k.change >= 0 : k.change <= 0) : null;
          return (
            <div key={k.label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gt-muted truncate">{k.label}</span>
              <span className="text-sm font-bold text-gt-text truncate">{k.value}</span>
              {k.change !== undefined && chg !== null && (
                <StatBadge val={k.change} good={chg} />
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

const BankOverview: React.FC = () => {
  const { data, kpis, lastSynced } = useDb();

  const fp  = data.financial_performance;
  const bs  = data.balance_sheet;
  const ri  = data.risk_indicators;
  const lm  = data.liquidity_metrics;
  const tm  = data.treasury_market;
  const bva = data.budget_vs_actual;
  const cm  = data.cost_metrics;
  const si  = data.segment_insights;

  const fpL = fp[fp.length - 1];  const fpP = fp[fp.length - 2];
  const bsL = bs[bs.length - 1];  const bsP = bs[bs.length - 2];
  const riL = ri[ri.length - 1];
  const lmL = lm[lm.length - 1];
  const tmL = tm[tm.length - 1];
  const cmL = cm[cm.length - 1];  const cmP = cm[cm.length - 2];
  const siL = si[si.length - 1];

  // Sum monthly rows for full-year figures; use || so API returning 0 falls back to mock
  const totalRevenue = kpis.revenue    || fp.reduce((s, r) => s + r.revenue, 0);
  const totalPAT     = kpis.pat        || fp.reduce((s, r) => s + r.pat, 0);
  const totalAssets  = kpis.totalAssets || bsL.total_assets;
  const nplRatio     = kpis.nplRatio   || riL.npl_ratio;
  const nplCoverage  = riL.npl_coverage;
  // Annual EPS = full-year PAT / 29.43bn shares
  const SHARES_BN    = 29.43;
  const annualEPS    = totalPAT / (SHARES_BN * 1e9);

  const panels: PanelProps[] = [
    {
      path: '/financial-performance', icon: TrendingUp, label: 'Financial Performance',
      kpis: [
        { label: 'Revenue', value: fmtNGNShort(fpL.revenue), change: pctChange(fpL.revenue, fpP.revenue) },
        { label: 'PAT',     value: fmtNGNShort(fpL.pat),     change: pctChange(fpL.pat, fpP.pat) },
        { label: 'ROE',     value: fmtPct(fpL.roe),          change: fpL.roe - fpP.roe },
        { label: 'NIM',     value: fmtPct(fpL.nim),          change: fpL.nim - fpP.nim },
      ],
    },
    {
      path: '/balance-sheet', icon: Landmark, label: 'Balance Sheet',
      kpis: [
        { label: 'Total Assets', value: fmtNGN(bsL.total_assets),  change: bsL.growth_rate_vs_prior },
        { label: 'Loan Book',    value: fmtNGN(bsL.loan_book),     change: pctChange(bsL.loan_book, bsP.loan_book) },
        { label: 'Deposits',     value: fmtNGN(bsL.deposit_base),  change: pctChange(bsL.deposit_base, bsP.deposit_base) },
        { label: 'Equity',       value: fmtNGN(bsL.equity),        change: pctChange(bsL.equity, bsP.equity) },
      ],
    },
    {
      path: '/risk-quality', icon: ShieldAlert, label: 'Risk & Asset Quality',
      rag: riL.npl_ratio <= 5 ? 'green' : riL.npl_ratio <= 7 ? 'amber' : 'red',
      kpis: [
        { label: 'NPL Ratio',    value: fmtPct(riL.npl_ratio),    change: riL.npl_ratio - ri[ri.length - 2].npl_ratio, goodUp: false },
        { label: 'Coverage',     value: fmtPct(riL.npl_coverage) },
        { label: 'Cost of Risk', value: fmtPct(riL.cost_of_risk), change: riL.cost_of_risk - ri[ri.length - 2].cost_of_risk, goodUp: false },
        { label: 'Provisions',   value: fmtNGNShort(riL.provisions) },
      ],
    },
    {
      path: '/liquidity-funding', icon: Droplets, label: 'Liquidity & Funding',
      rag: lmL.lcr >= 100 && lmL.nsfr >= 100 ? 'green' : 'amber',
      kpis: [
        { label: 'LCR',           value: `${lmL.lcr}%`,  change: lmL.lcr - lm[lm.length - 2].lcr },
        { label: 'NSFR',          value: `${lmL.nsfr}%`, change: lmL.nsfr - lm[lm.length - 2].nsfr },
        { label: 'LDR',           value: fmtPct(lmL.loan_to_deposit_ratio) },
        { label: 'Retail Funding',value: `${lmL.retail_funding_pct}%` },
      ],
    },
    {
      path: '/treasury-market', icon: Building2, label: 'Treasury & Market Risk',
      kpis: [
        { label: 'Portfolio',    value: fmtNGN(tmL.portfolio_value), change: pctChange(tmL.portfolio_value, tm[tm.length - 2].portfolio_value) },
        { label: 'Sec. Yield',  value: fmtPct(tmL.yield_on_securities) },
        { label: 'FX USD Exp.', value: `$${tmL.fx_usd_exposure}mn` },
        { label: 'NII at Risk', value: fmtNGNShort(tmL.nii_at_risk) },
      ],
    },
    {
      path: '/budget-variance', icon: Target, label: 'Budget vs Actual',
      rag: bva.filter(r => r.rag_status === 'Red').length === 0 ? 'green'
         : bva.filter(r => r.rag_status === 'Red').length <= 1 ? 'amber' : 'red',
      kpis: [
        { label: '🟢 On/Above',  value: `${bva.filter(r => r.rag_status === 'Green').length} lines` },
        { label: '🟡 Watch',     value: `${bva.filter(r => r.rag_status === 'Amber').length} lines` },
        { label: '🔴 Adverse',   value: `${bva.filter(r => r.rag_status === 'Red').length} lines` },
        { label: 'Net Variance', value: fmtNGNShort(bva.reduce((s, r) => s + r.variance_ngn, 0)) },
      ],
    },
    {
      path: '/cost-operational', icon: Activity, label: 'Cost & Operations',
      rag: cmL.cost_to_income_ratio < 50 ? 'green' : cmL.cost_to_income_ratio < 55 ? 'amber' : 'red',
      kpis: [
        { label: 'CIR',        value: fmtPct(cmL.cost_to_income_ratio), change: cmL.cost_to_income_ratio - cmP.cost_to_income_ratio, goodUp: false },
        { label: 'Total OpEx', value: fmtNGNShort(cmL.total_opex) },
        { label: 'Staff Cost', value: fmtNGNShort(cmL.staff_cost) },
        { label: 'Headcount',  value: cmL.headcount.toLocaleString('en-NG') },
      ],
    },
    {
      path: '/segment-insights', icon: Users, label: 'Segment Insights',
      kpis: [
        { label: 'Customers',  value: `${siL.total_active_customers.toFixed(2)}mn`, change: pctChange(siL.total_active_customers, si[si.length - 2].total_active_customers) },
        { label: 'New Cust.',  value: `${siL.new_customers}k` },
        { label: 'Retail Rev.',value: fmtNGNShort(siL.retail_revenue) },
        { label: 'Corp. Rev.', value: fmtNGNShort(siL.corporate_revenue) },
      ],
    },
    {
      path: '/investor', icon: PieChart, label: 'Investor Relations',
      kpis: [
        { label: 'Annual EPS',     value: `₦${annualEPS.toFixed(2)}` },
        { label: 'ROE',            value: fmtPct(fpL.roe) },
        { label: 'Dividend Yield', value: '4.2%' },
        { label: 'P/E Ratio',      value: `${(50.65 / Math.max(annualEPS, 0.01)).toFixed(1)}×` },
      ],
    },
    {
      path: '/competitor', icon: TrendingUp, label: 'Competitor Analysis',
      kpis: [
        { label: 'GTBank ROE',  value: fmtPct(fpL.roe),          change: fpL.roe - 30.1 },
        { label: 'GTBank CIR',  value: fmtPct(cmL.cost_to_income_ratio), change: -(cmL.cost_to_income_ratio - 40.5), goodUp: false },
        { label: 'GTBank NPL',  value: fmtPct(riL.npl_ratio),   change: -(riL.npl_ratio - 4.2), goodUp: false },
        { label: 'Peer Rank',   value: '#1 ROE' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gt-text uppercase tracking-wide">Performance Management Analytics Solution</h1>
          <p className="text-xs text-gt-muted mt-0.5">
            Guaranty Trust Bank Plc · FY 2024 · All figures in NGN
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gt-muted">Last synced</p>
          <p className="text-sm font-semibold text-gt-orange">
            {lastSynced.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Top headline KPIs — sourced directly from real GL data via kpis object */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Annual Revenue', color: 'text-gt-orange',
            value: fmtNGN(totalRevenue),
            sub: 'FY 2024 total interest + non-interest',
          },
          {
            label: 'Annual PAT', color: 'text-gt-green',
            value: fmtNGN(totalPAT),
            sub: 'Net profit after tax',
          },
          {
            label: 'Total Assets', color: 'text-gt-text',
            value: fmtNGN(totalAssets),
            sub: `Q4 2024 — ${bsL.growth_rate_vs_prior.toFixed(1)}% QoQ`,
          },
          {
            label: 'NPL Ratio', color: nplRatio <= 6 ? 'text-gt-green' : 'text-gt-red',
            value: fmtPct(nplRatio),
            sub: `Coverage: ${fmtPct(nplCoverage)}`,
          },
        ].map((k) => (
          <div key={k.label} className="bg-gt-card border border-gt-border rounded-2xl shadow-sm p-4">
            <p className="text-xs font-medium text-gt-muted uppercase tracking-wide">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gt-muted mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Section panels grid */}
      <div>
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
          Dashboard Modules — click any panel to drill in
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {panels.map((p) => <Panel key={p.path} {...p} />)}
        </div>
      </div>
    </div>
  );
};

export default BankOverview;
