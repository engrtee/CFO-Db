import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const bn  = (n: number) => '₦' + (n / 1e9).toFixed(1) + 'bn';
const pct = (n: number) => n.toFixed(1) + '%';

function trendIcon(cur: number, prev: number, goodUp = true) {
  const diff = cur - prev;
  if (Math.abs(diff) < 0.01) return <Minus className="w-3 h-3 text-gt-muted" />;
  const up = diff > 0;
  const good = goodUp ? up : !up;
  return up
    ? <TrendingUp className={`w-3 h-3 ${good ? 'text-gt-green' : 'text-gt-red'}`} />
    : <TrendingDown className={`w-3 h-3 ${good ? 'text-gt-green' : 'text-gt-red'}`} />;
}

function pctChange(cur: number, prev: number, goodUp = true) {
  const d = ((cur - prev) / prev) * 100;
  const sign = d >= 0 ? '+' : '';
  const good = goodUp ? d >= 0 : d <= 0;
  return (
    <span className={`text-xs ${good ? 'text-gt-green' : 'text-gt-red'}`}>
      {sign}{d.toFixed(1)}%
    </span>
  );
}

interface KpiTileProps {
  label: string; value: string; prev: number; cur: number; goodUp?: boolean;
}

function KpiTile({ label, value, prev, cur, goodUp = true }: KpiTileProps) {
  return (
    <div className="rounded-xl border border-gt-border bg-gt-card2 p-4 flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gt-muted uppercase tracking-wide">{label}</span>
      <span className="text-xl font-bold text-gt-text">{value}</span>
      <div className="flex items-center gap-1">
        {trendIcon(cur, prev, goodUp)}
        {pctChange(cur, prev, goodUp)}
        <span className="text-xs text-gt-muted ml-1">MoM</span>
      </div>
    </div>
  );
}

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-medium">₦{(p.value / 1e9)?.toFixed(1)}bn</span>
        </p>
      ))}
    </div>
  );
};

const FinancialPerformance: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows   = data.financial_performance;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];

  const kpis: KpiTileProps[] = [
    { label: 'Total Revenue',       value: bn(latest.revenue),             cur: latest.revenue,             prev: prev.revenue             },
    { label: 'Net Interest Income', value: bn(latest.net_interest_income), cur: latest.net_interest_income, prev: prev.net_interest_income },
    { label: 'Non-Interest Income', value: bn(latest.non_interest_income), cur: latest.non_interest_income, prev: prev.non_interest_income },
    { label: 'Profit Before Tax',   value: bn(latest.pbt),                 cur: latest.pbt,                 prev: prev.pbt                 },
    { label: 'Profit After Tax',    value: bn(latest.pat),                 cur: latest.pat,                 prev: prev.pat                 },
    { label: 'Return on Equity',    value: pct(latest.roe),                cur: latest.roe,                 prev: prev.roe                 },
    { label: 'Return on Assets',    value: pct(latest.roa),                cur: latest.roa,                 prev: prev.roa                 },
    { label: 'Net Interest Margin', value: pct(latest.nim),                cur: latest.nim,                 prev: prev.nim                 },
  ];

  return (
    <SectionCard
      title="Financial Performance Metrics"
      subtitle="Monthly P&L summary — Guaranty Trust Bank Plc (₦bn)"
      icon={<TrendingUp className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => <KpiTile key={k.label} {...k} />)}
      </div>

      <div>
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
          Monthly Trend — Revenue, NII & PAT (₦bn)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={rows} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: '#AAA' }}
              tickFormatter={(v) => v.split(' ')[0]}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#AAA' }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `₦${(v / 1e9).toFixed(0)}bn`}
              width={60}
            />
            <Tooltip content={<DkTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Line type="monotone" dataKey="revenue"             name="Revenue" stroke="#F58220" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="net_interest_income" name="NII"     stroke="#27AE60" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pat"                 name="PAT"     stroke="#AAAAAA" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
};

export default FinancialPerformance;
