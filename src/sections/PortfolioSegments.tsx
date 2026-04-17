import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Layers, X } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { useDb } from '../lib/DbContext';
import { useFilters, SegmentKey } from '../lib/FilterContext';
import { portfolioData } from '../data/portfolioData';

const bn  = (n: number) => '₦' + (n / 1e9).toFixed(1) + 'bn';
const mn  = (n: number) => '₦' + (n / 1e6).toFixed(1) + 'mn';
const pct = (n: number) => n.toFixed(1) + '%';

const RAG = (v: number, warn: number, crit: number) =>
  v <= warn ? 'text-gt-green' : v <= crit ? 'text-gt-amber' : 'text-gt-red';

const SEGMENTS: SegmentKey[] = ['corporate', 'commercial', 'retail'];
const SEG_LABEL: Record<SegmentKey, string> = {
  corporate: 'Corporate',
  commercial: 'Commercial',
  retail: 'Retail',
};

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PortfolioSegments: React.FC = () => {
  const { loading, lastSynced, refresh } = useDb();
  const { segment: activeSegment, sector: activeSector, zone: activeZone, setSegment } = useFilters();
  const [activeTab, setActiveTab] = useState<SegmentKey>('corporate');

  const seg = portfolioData.find(s => s.id === activeTab)!;

  // Simulated filter multiplier: if a cross-filter is active, slightly adjust the data
  const filterMultiplier = activeSector || activeZone ? 0.72 : 1;

  const toggleSegment = (id: SegmentKey) => {
    setActiveTab(id);
    setSegment(activeSegment === id ? null : id);
  };

  return (
    <SectionCard
      title="Portfolio Segment Analysis"
      subtitle="Retail · Corporate · Commercial — outstanding, PAR, NIM & fee income"
      icon={<Layers className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
    >
      {/* Cross-filter banner */}
      {(activeSector || activeZone) && (
        <div className="mb-4 px-3 py-2 bg-gt-amber/10 border border-gt-amber/30 rounded-xl">
          <p className="text-xs text-gt-amber font-medium">
            ⚡ Cross-filter active — showing{' '}
            {[activeSector, activeZone].filter(Boolean).join(' + ')} subset
          </p>
        </div>
      )}

      {/* Segment Tabs */}
      <div className="flex gap-1 bg-gt-grey border border-gt-border rounded-xl p-1 mb-6 w-fit">
        {SEGMENTS.map((id) => {
          const s = portfolioData.find(x => x.id === id)!;
          return (
            <button
              key={id}
              onClick={() => toggleSegment(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === id
                  ? 'text-white'
                  : 'text-gt-muted hover:text-gt-text hover:bg-gt-card2'
              }`}
              style={activeTab === id ? { backgroundColor: s.color } : {}}
            >
              <span>{SEG_LABEL[id]}</span>
              <span className={`text-xs font-normal ${activeTab === id ? 'text-white/80' : 'text-gt-muted'}`}>
                {pct(s.concentration)}
              </span>
            </button>
          );
        })}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Outstanding Balance', value: bn(seg.outstanding * filterMultiplier), sub: `${pct(seg.concentration)} of book`, color: 'text-gt-text' },
          { label: 'FY 2024 Disbursements', value: bn(seg.disbursements * filterMultiplier), sub: `${seg.loanCount.toLocaleString()} loans`, color: 'text-gt-text' },
          { label: 'Avg Ticket Size', value: mn(seg.avgTicketSize), sub: 'per facility', color: 'text-gt-text' },
          { label: 'Fee Income', value: bn(seg.feeIncome * filterMultiplier), sub: 'FY 2024 annual', color: 'text-gt-text' },
          { label: 'PAR 30',  value: pct(seg.par30),  sub: 'portfolio at risk >30 days', color: RAG(seg.par30, 7, 10) },
          { label: 'PAR 90',  value: pct(seg.par90),  sub: 'portfolio at risk >90 days', color: RAG(seg.par90, 4, 6)  },
          { label: 'NIM Contribution', value: pct(seg.nim), sub: 'net interest margin', color: 'text-gt-green' },
          { label: 'Loan Count', value: seg.loanCount.toLocaleString(), sub: 'active facilities', color: 'text-gt-text' },
        ].map((k) => (
          <div key={k.label} className="bg-gt-card2 border border-gt-border rounded-xl p-4">
            <p className="text-xs text-gt-muted uppercase tracking-wide font-medium leading-tight">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gt-muted mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PAR Trend */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            PAR Trend — {seg.name}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={seg.quarterlyPAR} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
              <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} width={36} />
              <Tooltip content={<DkTooltip />} formatter={(v: any) => [`${v.toFixed(1)}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="par30" name="PAR 30" stroke={seg.color} strokeWidth={2.5}
                dot={{ r: 4, fill: seg.color }} />
              <Line type="monotone" dataKey="par90" name="PAR 90" stroke="#E02020" strokeWidth={2}
                dot={{ r: 3, fill: '#E02020' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Disbursements */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Monthly Disbursements (₦bn) — {seg.name}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={seg.disbursementTrend.map(d => ({ ...d, amount: (d.amount * filterMultiplier) / 1e9 }))}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₦${v}bn`} width={44} />
              <Tooltip formatter={(v: any) => [`₦${v.toFixed(1)}bn`, 'Disbursement']} />
              <Bar dataKey="amount" name="Disbursements" fill={seg.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NIM Comparison across segments */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
          NIM Quarterly Trend — All Segments (%)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            data={['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map((q, i) => ({
              q,
              ...Object.fromEntries(portfolioData.map(s => [s.id, s.nimTrend[i].nim])),
            }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
            <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[10, 16]} width={36} />
            <Tooltip content={<DkTooltip />} formatter={(v: any) => [`${v.toFixed(1)}%`]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            {portfolioData.map(s => (
              <Line key={s.id} type="monotone" dataKey={s.id} name={s.name}
                stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* All-segment comparison table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gt-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gt-card2 border-b border-gt-border">
              {['Segment', 'Outstanding', 'Disbursements', 'Avg Ticket', 'PAR 30', 'PAR 90', 'NIM', 'Fee Income'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gt-border">
            {portfolioData.map(s => (
              <tr key={s.id}
                className={`hover:bg-gt-card2 transition-colors cursor-pointer ${activeTab === s.id ? 'bg-gt-orange/5' : ''}`}
                onClick={() => setActiveTab(s.id)}
              >
                <td className="px-4 py-2.5 font-medium text-gt-text">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gt-text">{bn(s.outstanding * filterMultiplier)}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gt-muted">{bn(s.disbursements * filterMultiplier)}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gt-muted">{mn(s.avgTicketSize)}</td>
                <td className={`px-4 py-2.5 font-mono text-xs font-semibold ${RAG(s.par30, 7, 10)}`}>{pct(s.par30)}</td>
                <td className={`px-4 py-2.5 font-mono text-xs font-semibold ${RAG(s.par90, 4, 6)}`}>{pct(s.par90)}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gt-green font-semibold">{pct(s.nim)}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gt-muted">{bn(s.feeIncome * filterMultiplier)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default PortfolioSegments;
