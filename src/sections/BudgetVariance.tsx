import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { Target } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const RAG_BADGE: Record<string, string> = { Green: '🟢', Amber: '🟡', Red: '🔴' };

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-gt-text mb-2 leading-snug">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-mono">₦{(p.value / 1e9)?.toFixed(1)}bn</span>
        </p>
      ))}
    </div>
  );
};

function shortLabel(s: string) {
  const map: Record<string, string> = {
    'Total Revenue': 'Revenue', 'Net Interest Income': 'NII', 'Non-Interest Income': 'Non-Int',
    'Total Operating Expenses': 'OpEx', 'Staff Costs': 'Staff', 'IT & Digital': 'IT',
    'Admin & Overhead': 'Admin', 'Provisions for Losses': 'Provisions',
    'Profit Before Tax': 'PBT', 'Profit After Tax': 'PAT',
  };
  return map[s] ?? s;
}

const BudgetVariance: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows = data.budget_vs_actual;

  const chartData = rows.map((r) => ({
    name: shortLabel(r.line_item),
    Budget: r.budget_amount,
    Actual: r.actual_amount,
    rag: r.rag_status,
  }));

  const greenCount = rows.filter((r) => r.rag_status === 'Green').length;
  const amberCount = rows.filter((r) => r.rag_status === 'Amber').length;
  const redCount   = rows.filter((r) => r.rag_status === 'Red').length;
  const totalFav   = rows.filter((r) => r.variance_ngn > 0).reduce((s, r) => s + r.variance_ngn, 0);
  const totalAdv   = rows.filter((r) => r.variance_ngn < 0).reduce((s, r) => s + r.variance_ngn, 0);

  return (
    <SectionCard
      title="Budget vs Actual Variance Reporting"
      subtitle="Full year 2024 — All figures ₦bn"
      icon={<Target className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      {/* Summary RAG row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-gt-green/10 border border-gt-green/30 rounded-xl px-4 py-3">
          <span className="text-lg">🟢</span>
          <div>
            <p className="text-xs text-gt-muted">On / Above Budget</p>
            <p className="text-xl font-bold text-gt-green">{greenCount} lines</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gt-amber/10 border border-gt-amber/30 rounded-xl px-4 py-3">
          <span className="text-lg">🟡</span>
          <div>
            <p className="text-xs text-gt-muted">Within 5% adverse</p>
            <p className="text-xl font-bold text-gt-amber">{amberCount} lines</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gt-red/10 border border-gt-red/30 rounded-xl px-4 py-3">
          <span className="text-lg">🔴</span>
          <div>
            <p className="text-xs text-gt-muted">Adverse &gt;5%</p>
            <p className="text-xl font-bold text-gt-red">{redCount} lines</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4 bg-gt-card2 border border-gt-border rounded-xl px-4 py-3">
          <div className="text-right">
            <p className="text-xs text-gt-muted">Favourable</p>
            <p className="text-base font-bold text-gt-green">+₦{(totalFav / 1e9).toFixed(1)}bn</p>
          </div>
          <div className="w-px h-8 bg-gt-border" />
          <div className="text-right">
            <p className="text-xs text-gt-muted">Adverse</p>
            <p className="text-base font-bold text-gt-red">-₦{(Math.abs(totalAdv) / 1e9).toFixed(1)}bn</p>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
        Budget vs Actual — Side-by-side comparison (₦bn)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₦${(v / 1e9).toFixed(0)}bn`} width={60} />
          <Tooltip content={<DkTooltip />} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Budget" fill="#555" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.rag === 'Green' ? '#27AE60' : d.rag === 'Amber' ? '#FFA500' : '#E02020'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Variance table */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">Variance Detail</p>
        <div className="overflow-x-auto rounded-xl border border-gt-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gt-card2 border-b border-gt-border">
                {['Line Item', 'Budget (₦bn)', 'Actual (₦bn)', 'Variance (₦bn)', 'Variance %', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gt-border">
              {rows.map((r) => {
                const fav = r.variance_ngn >= 0;
                return (
                  <tr key={r.id} className="hover:bg-gt-card2 transition-colors">
                    <td className="px-4 py-2.5 text-gt-text font-medium whitespace-nowrap">{r.line_item}</td>
                    <td className="px-4 py-2.5 text-gt-muted font-mono text-xs">{(r.budget_amount / 1e9).toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-gt-muted font-mono text-xs">{(r.actual_amount / 1e9).toFixed(1)}</td>
                    <td className={`px-4 py-2.5 font-mono text-xs font-semibold ${fav ? 'text-gt-green' : 'text-gt-red'}`}>
                      {fav ? '+' : ''}{(r.variance_ngn / 1e9).toFixed(1)}
                    </td>
                    <td className={`px-4 py-2.5 font-mono text-xs font-semibold ${fav ? 'text-gt-green' : 'text-gt-red'}`}>
                      {fav ? '+' : ''}{r.variance_pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        r.rag_status === 'Green' ? 'bg-gt-green/15 text-gt-green border-gt-green/30'
                        : r.rag_status === 'Amber' ? 'bg-gt-amber/15 text-gt-amber border-gt-amber/30'
                        : 'bg-gt-red/15 text-gt-red border-gt-red/30'
                      }`}>
                        {RAG_BADGE[r.rag_status]} {r.rag_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
};

export default BudgetVariance;
