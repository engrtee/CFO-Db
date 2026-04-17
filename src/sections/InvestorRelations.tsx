import React, { useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, FileText, TrendingUp, PieChart, DollarSign, Award } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const SHARES_BN = 29.43;
const SHARE_PRICE = 50.65;

const DK_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-medium">{p.value?.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
};

const reports = [
  { title: 'FY 2024 Annual Report',             date: '2025-03-15', type: 'Annual',       size: '8.7 MB' },
  { title: 'Q4 2024 Earnings Release',           date: '2025-01-28', type: 'Quarterly',    size: '2.1 MB' },
  { title: 'Q4 2024 Investor Presentation',      date: '2025-01-28', type: 'Presentation', size: '5.4 MB' },
  { title: '2024 Sustainability & ESG Report',   date: '2025-06-10', type: 'ESG',          size: '4.2 MB' },
  { title: 'Q3 2024 Interim Results',            date: '2024-10-23', type: 'Quarterly',    size: '1.9 MB' },
];

const InvestorRelations: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const printRef = useRef<HTMLDivElement>(null);

  const fp = data.financial_performance;
  const bs = data.balance_sheet;

  const annualPAT     = fp.reduce((s, r) => s + r.pat, 0);
  const latestBs      = bs[bs.length - 1];
  const eps           = annualPAT / (SHARES_BN * 1e9);       // PAT raw naira ÷ 29.43bn shares
  const bookValue     = latestBs.equity / (SHARES_BN * 1e9); // Equity raw naira ÷ shares
  const peRatio       = SHARE_PRICE / eps;
  const roe           = fp[fp.length - 1].roe;
  const dividendPS    = eps * 0.35;
  const dividendYield = (dividendPS / SHARE_PRICE) * 100;
  const marketCap     = SHARE_PRICE * SHARES_BN;

  const kpis = [
    { label: 'Earnings Per Share',   value: `₦${eps.toFixed(2)}`,        sub: `PAT ÷ ${SHARES_BN}bn shares`,  icon: TrendingUp,  color: 'text-gt-orange' },
    { label: 'Book Value / Share',   value: `₦${bookValue.toFixed(2)}`,   sub: `Equity ÷ shares outstanding`,  icon: DollarSign,  color: 'text-gt-green'  },
    { label: 'Price / Earnings',     value: `${peRatio.toFixed(1)}×`,      sub: `Share price ₦${SHARE_PRICE}`,  icon: PieChart,    color: 'text-gt-text'     },
    { label: 'Return on Equity',     value: `${roe.toFixed(1)}%`,          sub: 'Dec 2024 annualised',          icon: Award,       color: 'text-gt-orange' },
    { label: 'Dividend Yield',       value: `${dividendYield.toFixed(1)}%`, sub: `DPS: ₦${dividendPS.toFixed(2)}`, icon: DollarSign, color: 'text-gt-green' },
    { label: 'Market Capitalisation',value: `₦${marketCap.toFixed(0)}bn`, sub: `@ ₦${SHARE_PRICE}/share`,      icon: TrendingUp,  color: 'text-gt-text'     },
  ];

  // Quarterly EPS derived from PAT
  const quarterlyEPS = [
    { q: 'Q1 2024', eps: fp.slice(0, 3).reduce((s, r) => s + r.pat, 0) / (SHARES_BN * 1e9) },
    { q: 'Q2 2024', eps: fp.slice(3, 6).reduce((s, r) => s + r.pat, 0) / (SHARES_BN * 1e9) },
    { q: 'Q3 2024', eps: fp.slice(6, 9).reduce((s, r) => s + r.pat, 0) / (SHARES_BN * 1e9) },
    { q: 'Q4 2024', eps: fp.slice(9, 12).reduce((s, r) => s + r.pat, 0) / (SHARES_BN * 1e9) },
  ];

  const ratios = [
    { label: 'Net Interest Margin',  value: `${fp[fp.length - 1].nim.toFixed(2)}%`,  benchmark: '6.0%', above: fp[fp.length - 1].nim >= 6.0 },
    { label: 'Return on Equity',     value: `${roe.toFixed(1)}%`,                    benchmark: '18.0%', above: roe >= 18.0 },
    { label: 'Return on Assets',     value: `${fp[fp.length - 1].roa.toFixed(2)}%`,  benchmark: '2.5%', above: fp[fp.length - 1].roa >= 2.5 },
    { label: 'Cost-to-Income Ratio', value: `${data.cost_metrics[data.cost_metrics.length - 1].cost_to_income_ratio.toFixed(1)}%`, benchmark: '50.0%', above: data.cost_metrics[data.cost_metrics.length - 1].cost_to_income_ratio <= 50.0 },
    { label: 'NPL Ratio',            value: `${data.risk_indicators[data.risk_indicators.length - 1].npl_ratio.toFixed(1)}%`, benchmark: '5.0%', above: data.risk_indicators[data.risk_indicators.length - 1].npl_ratio <= 5.0 },
    { label: 'Earnings Per Share',   value: `₦${eps.toFixed(2)}`,                    benchmark: '₦2.50', above: eps >= 2.50 },
  ];

  const tableRows = kpis.map(k => ({ metric: k.label, value: k.value, note: k.sub })) as unknown as Record<string, unknown>[];

  return (
    <SectionCard
      title="Investor Relations"
      subtitle="Guaranty Trust Bank Plc · FY 2024 · NGN"
      icon={<Award className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={tableRows} columns={['metric', 'value', 'note']} />}
    >
      <div ref={printRef} className="space-y-6">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-gt-card2 border border-gt-border rounded-xl p-4 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${k.color}`} />
                  <span className="text-xs text-gt-muted uppercase tracking-wide truncate">{k.label}</span>
                </div>
                <span className={`text-xl font-bold ${k.color}`}>{k.value}</span>
                <span className="text-xs text-gt-muted">{k.sub}</span>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quarterly EPS */}
          <div>
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
              Quarterly Earnings Per Share (₦)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quarterlyEPS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v.toFixed(1)}`} width={48} />
                <Tooltip content={<DK_TOOLTIP />} />
                <Bar dataKey="eps" name="EPS (₦)" fill="#F58220" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance ratios */}
          <div>
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
              Key Ratios vs Industry Benchmarks
            </p>
            <div className="space-y-2">
              {ratios.map((r) => (
                <div key={r.label} className="flex items-center justify-between px-3 py-2 bg-gt-card2 rounded-lg border border-gt-border">
                  <div>
                    <p className="text-xs font-medium text-gt-text">{r.label}</p>
                    <p className="text-xs text-gt-muted">Benchmark: {r.benchmark}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gt-text">{r.value}</p>
                    <span className={`text-xs font-semibold ${r.above ? 'text-gt-green' : 'text-gt-red'}`}>
                      {r.above ? '✓ Meets' : '✗ Below'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historical EPS line */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Monthly PAT → EPS Run-Rate (₦)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={fp.map(r => ({ period: r.period.split(' ')[0], eps: r.pat / SHARES_BN }))}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₦${v.toFixed(1)}`} width={48} />
              <Tooltip content={<DK_TOOLTIP />} />
              <Line type="monotone" dataKey="eps" name="Monthly EPS" stroke="#F58220" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Investor reports */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest">
              Investor Reports & Documents
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gt-orange hover:bg-gt-orangeD text-gt-text text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Board Pack
            </button>
          </div>
          <div className="space-y-2">
            {reports.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border border-gt-border bg-gt-card2 rounded-xl hover:border-gt-orange transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gt-orange/15 rounded-lg p-2">
                    <FileText className="w-4 h-4 text-gt-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gt-text">{r.title}</p>
                    <p className="text-xs text-gt-muted">{r.date} · {r.type} · {r.size}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gt-muted hover:text-gt-orange" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default InvestorRelations;
