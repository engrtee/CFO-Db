import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const bn  = (n: number) => '₦' + (n / 1e9).toFixed(1) + 'bn';
const mn  = (n: number) => '₦' + (n / 1e6).toFixed(0) + 'mn';
const pct = (n: number) => n.toFixed(1) + '%';

const COST_COLORS = ['#F58220', '#27AE60', '#AAAAAA', '#E02020'];

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p style={{ color: d.payload.fill }} className="font-semibold">{d.name}</p>
      <p className="text-gt-text mt-0.5">₦{(d.value / 1e9)?.toFixed(1)}bn</p>
      <p className="text-gt-muted">{((d.value / d.payload.total) * 100).toFixed(1)}% of OpEx</p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">{p.value?.toFixed(1)}{p.name.includes('%') ? '%' : ''}</span>
        </p>
      ))}
    </div>
  );
};

const CostOperational: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows   = data.cost_metrics;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];

  const costBreakdown = [
    { name: 'Staff Costs',      value: latest.staff_cost,                                                       fill: COST_COLORS[0], total: latest.total_opex },
    { name: 'IT & Digital',     value: latest.it_cost,                                                          fill: COST_COLORS[1], total: latest.total_opex },
    { name: 'Admin & Overhead', value: latest.admin_cost,                                                       fill: COST_COLORS[2], total: latest.total_opex },
    { name: 'Other OpEx',       value: latest.total_opex - latest.staff_cost - latest.it_cost - latest.admin_cost, fill: COST_COLORS[3], total: latest.total_opex },
  ];

  const cirData = rows.map((r) => ({
    date: r.date.replace(' 2025', '').replace(' 2024', ''),
    'CIR (%)': r.cost_to_income_ratio,
  }));

  const cirGood  = latest.cost_to_income_ratio < 50;
  const cirDelta = latest.cost_to_income_ratio - prev.cost_to_income_ratio;

  return (
    <SectionCard
      title="Cost & Operational Metrics"
      subtitle="Efficiency · OpEx breakdown · Headcount trends"
      icon={<Activity className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Cost-to-Income Ratio',  value: pct(latest.cost_to_income_ratio),    sub: `${cirDelta >= 0 ? '+' : ''}${cirDelta.toFixed(1)}pp MoM`,  good: cirGood },
          { label: 'Total OpEx',            value: bn(latest.total_opex),               sub: `Prior: ${bn(prev.total_opex)}`,                             good: latest.total_opex <= prev.total_opex },
          { label: 'Operational Losses',    value: mn(latest.operational_losses),       sub: `Prior: ${mn(prev.operational_losses)}`,                     good: latest.operational_losses <= prev.operational_losses },
          { label: 'Headcount',             value: latest.headcount.toLocaleString('en-NG'), sub: `+${latest.headcount - prev.headcount} vs prior`,       good: true },
        ].map((m) => (
          <div key={m.label} className={`rounded-xl border p-4 ${m.good ? 'border-gt-border bg-gt-card2' : 'border-gt-amber/30 bg-gt-amber/5'}`}>
            <p className="text-xs font-medium text-gt-muted uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-gt-text mt-1">{m.value}</p>
            <p className={`text-xs mt-1 ${m.good ? 'text-gt-muted' : 'text-gt-amber font-medium'}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            OpEx Breakdown — {latest.date} (₦bn)
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={62} outerRadius={95}
                dataKey="value" paddingAngle={3}>
                {costBreakdown.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#AAA' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-gt-muted -mt-2">Total: {bn(latest.total_opex)}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Cost-to-Income Ratio (%) — Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cirData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
                domain={[44, 54]} tickFormatter={(v) => `${v}%`} width={38} />
              <Tooltip content={<LineTooltip />} />
              <Line type="monotone" dataKey="CIR (%)" stroke="#E02020" strokeWidth={2.5} dot={{ r: 3, fill: '#E02020' }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-gt-card2 border border-gt-border rounded-xl">
            <p className="text-xs font-semibold text-gt-muted mb-2">Headcount Trend</p>
            <div className="flex items-end gap-0.5 h-10">
              {rows.map((r, i) => {
                const minH = Math.min(...rows.map((x) => x.headcount));
                const maxH = Math.max(...rows.map((x) => x.headcount));
                const h = ((r.headcount - minH) / (maxH - minH)) * 80 + 20;
                return (
                  <div
                    key={r.date}
                    className="flex-1 rounded-t-sm"
                    title={`${r.date}: ${r.headcount.toLocaleString()}`}
                    style={{ height: `${h}%`, backgroundColor: i === rows.length - 1 ? '#F58220' : '#444' }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gt-muted">
              <span>Jan</span>
              <span className="font-medium text-gt-orange">{latest.headcount.toLocaleString()}</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default CostOperational;
