import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const bn = (n: number) => '₦' + n.toFixed(1) + 'bn';
const mn = (n: number) => n.toFixed(2) + 'mn';
const k  = (n: number) => n.toFixed(0) + 'k';

const SEGMENT_COLORS = { Retail: '#F58220', SME: '#27AE60', Corporate: '#AAAAAA', Treasury: '#FFA500' };

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">
            {p.dataKey?.includes('customers') ? p.value?.toFixed(2) + 'mn' : '₦' + p.value?.toFixed(1) + 'bn'}
          </span>
        </p>
      ))}
    </div>
  );
};

const CustTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">{p.value?.toFixed(2)}{p.name.includes('Active') ? 'mn' : 'k'}</span>
        </p>
      ))}
    </div>
  );
};

const SegmentInsights: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows   = data.segment_insights;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];
  const first  = rows[0];

  const custGrowth = ((latest.total_active_customers - first.total_active_customers) / first.total_active_customers) * 100;

  const revenueData = rows.map((r) => ({
    date: r.date.replace(' 2025', '').replace(' 2024', ''),
    Retail: r.retail_revenue, SME: r.sme_revenue, Corporate: r.corporate_revenue, Treasury: r.treasury_revenue,
  }));

  const customerData = rows.map((r) => ({
    date: r.date.replace(' 2025', '').replace(' 2024', ''),
    'Active Customers': r.total_active_customers,
    'New Customers (k)': r.new_customers,
  }));

  const segmentBadges = [
    { label: 'Retail',    value: bn(latest.retail_revenue),    color: 'text-gt-orange bg-gt-orange/15' },
    { label: 'SME',       value: bn(latest.sme_revenue),       color: 'text-gt-green  bg-gt-green/15'  },
    { label: 'Corporate', value: bn(latest.corporate_revenue), color: 'text-gt-text bg-gt-card2'         },
    { label: 'Treasury',  value: bn(latest.treasury_revenue),  color: 'text-gt-amber bg-gt-amber/15'   },
  ];

  return (
    <SectionCard
      title="Customer & Business Segment Insights"
      subtitle="Revenue by segment · Customer acquisition · Penetration"
      icon={<Users className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Customers',    value: mn(latest.total_active_customers), sub: `+${custGrowth.toFixed(1)}% YTD` },
          { label: 'New Customers',       value: k(latest.new_customers),           sub: `Prior: ${k(prev.new_customers)}` },
          { label: 'Products / Customer', value: latest.product_penetration_rate.toFixed(1), sub: `Up from ${first.product_penetration_rate.toFixed(1)} in Jan` },
          { label: 'Retail Revenue',      value: bn(latest.retail_revenue),         sub: `${((latest.retail_revenue / (latest.retail_revenue + latest.sme_revenue + latest.corporate_revenue + latest.treasury_revenue)) * 100).toFixed(0)}% of total` },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-gt-border bg-gt-card2 p-4">
            <p className="text-xs font-medium text-gt-muted uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-gt-text mt-1">{m.value}</p>
            <p className="text-xs text-gt-muted mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Segment Revenue Mix (₦bn) — Monthly
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₦${v}`} width={38} />
              <Tooltip content={<DkTooltip />} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Retail"    fill={SEGMENT_COLORS.Retail}    stackId="s" />
              <Bar dataKey="SME"       fill={SEGMENT_COLORS.SME}       stackId="s" />
              <Bar dataKey="Corporate" fill={SEGMENT_COLORS.Corporate} stackId="s" />
              <Bar dataKey="Treasury"  fill={SEGMENT_COLORS.Treasury}  stackId="s" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Customer Growth — Active (mn) · New per month (k)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={customerData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} domain={[8, 10.5]} width={38} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} domain={[80, 200]} width={36} />
              <Tooltip content={<CustTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left"  type="monotone" dataKey="Active Customers"  stroke="#F58220" strokeWidth={2.5} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="New Customers (k)" stroke="#27AE60" strokeWidth={2} dot={{ r: 3, fill: '#27AE60' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {segmentBadges.map((s) => (
              <div key={s.label} className={`rounded-xl border border-gt-border px-3 py-2 ${s.color} flex justify-between items-center`}>
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-sm font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default SegmentInsights;
