import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Landmark, TrendingUp } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const bn = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'bn';
const tn = (n: number) => '₦' + (n / 1000).toFixed(2) + 'tn';

interface KpiCardProps { label: string; value: string; change: number; note?: string }
function KpiCard({ label, value, change, note }: KpiCardProps) {
  const good = change >= 0;
  return (
    <div className="rounded-xl border border-gt-border bg-gt-card2 p-4">
      <p className="text-xs font-medium text-gt-muted uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp className={`w-3 h-3 ${good ? 'text-gt-green' : 'text-gt-red'}`} />
        <span className={`text-xs font-medium ${good ? 'text-gt-green' : 'text-gt-red'}`}>
          {good ? '+' : ''}{change.toFixed(1)}% QoQ
        </span>
        {note && <span className="text-xs text-gt-muted ml-1">({note})</span>}
      </div>
    </div>
  );
}

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-medium">₦{p.value?.toFixed(0)}bn</span>
        </p>
      ))}
    </div>
  );
};

const KEYS = [
  { key: 'total_assets',      label: 'Total Assets'  },
  { key: 'loan_book',         label: 'Loan Book'     },
  { key: 'deposit_base',      label: 'Deposit Base'  },
  { key: 'equity',            label: 'Equity'        },
  { key: 'total_liabilities', label: 'Liabilities'   },
];

const BalanceSheet: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows = data.balance_sheet;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];

  const qoq = (cur: number, p: number) => ((cur - p) / p) * 100;

  const kpis: KpiCardProps[] = [
    { label: 'Total Assets',  value: tn(latest.total_assets),  change: qoq(latest.total_assets, prev.total_assets),   note: 'assets' },
    { label: 'Loan Book',     value: tn(latest.loan_book),     change: qoq(latest.loan_book, prev.loan_book),         note: 'loans'  },
    { label: 'Deposit Base',  value: tn(latest.deposit_base),  change: qoq(latest.deposit_base, prev.deposit_base),   note: 'funding'},
    { label: 'Total Equity',  value: bn(latest.equity),        change: qoq(latest.equity, prev.equity),               note: 'capital'},
  ];

  const chartData = KEYS.map(({ key, label }) => ({
    name: label,
    Current: (latest as any)[key] as number,
    Prior:   (prev   as any)[key] as number,
  }));

  return (
    <SectionCard
      title="Balance Sheet Overview"
      subtitle={`${latest.date} vs ${prev.date} — All figures ₦bn`}
      icon={<Landmark className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
        Current vs Prior Quarter (₦bn)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}tn`} width={52}
          />
          <Tooltip content={<DkTooltip />} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Current" name={latest.date} fill="#F58220" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Prior"   name={prev.date}   fill="#555"    radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-2">
        {rows.slice(1).map((r) => (
          <span
            key={r.date}
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              r.growth_rate_vs_prior >= 5 ? 'bg-gt-green/15 text-gt-green'
              : r.growth_rate_vs_prior >= 0 ? 'bg-gt-orange/15 text-gt-orange'
              : 'bg-gt-red/15 text-gt-red'
            }`}
          >
            {r.date}: {r.growth_rate_vs_prior >= 0 ? '+' : ''}{r.growth_rate_vs_prior.toFixed(1)}%
          </span>
        ))}
      </div>
    </SectionCard>
  );
};

export default BalanceSheet;
