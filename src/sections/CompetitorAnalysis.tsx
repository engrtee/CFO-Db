import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const PEERS = [
  { name: 'Our Bank',    roe: 35.2, roa: 5.1, cir: 34.2, nim: 8.4, npl: 3.1, lcr: 241, cap: 22.1, pat: 609 },
  { name: 'Zenith Bank', roe: 31.5, roa: 4.2, cir: 37.8, nim: 7.6, npl: 4.5, lcr: 210, cap: 21.3, pat: 796 },
  { name: 'Access Bank', roe: 28.7, roa: 3.1, cir: 42.0, nim: 6.9, npl: 4.0, lcr: 195, cap: 19.8, pat: 729 },
  { name: 'UBA',         roe: 30.1, roa: 3.8, cir: 39.5, nim: 7.1, npl: 3.8, lcr: 205, cap: 20.5, pat: 607 },
  { name: 'First Bank',  roe: 24.3, roa: 2.9, cir: 48.1, nim: 6.2, npl: 5.2, lcr: 182, cap: 17.9, pat: 492 },
  { name: 'Stanbic',     roe: 22.8, roa: 3.2, cir: 44.5, nim: 6.8, npl: 3.6, lcr: 215, cap: 20.2, pat: 220 },
];

const QUARTERLY = [
  { q: 'Q1 2023', 'Our Bank': 118, Zenith: 152, Access: 138, UBA: 116, First: 98  },
  { q: 'Q2 2023', 'Our Bank': 130, Zenith: 165, Access: 150, UBA: 128, First: 107 },
  { q: 'Q3 2023', 'Our Bank': 148, Zenith: 183, Access: 168, UBA: 142, First: 118 },
  { q: 'Q4 2023', 'Our Bank': 163, Zenith: 201, Access: 182, UBA: 155, First: 130 },
  { q: 'Q1 2024', 'Our Bank': 138, Zenith: 192, Access: 171, UBA: 145, First: 115 },
  { q: 'Q2 2024', 'Our Bank': 155, Zenith: 208, Access: 188, UBA: 160, First: 123 },
  { q: 'Q3 2024', 'Our Bank': 171, Zenith: 219, Access: 200, UBA: 172, First: 132 },
  { q: 'Q4 2024', 'Our Bank': 188, Zenith: 233, Access: 215, UBA: 185, First: 143 },
];

const DK = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const COLORS: Record<string, string> = {
  'Our Bank': '#F58220', Zenith: '#3B82F6', Access: '#10B981', UBA: '#EAB308', First: '#8B5CF6',
};

const METRICS = [
  { key: 'roe',  label: 'ROE (%)',         invert: false },
  { key: 'roa',  label: 'ROA (%)',         invert: false },
  { key: 'cir',  label: 'CIR (%)',         invert: true  },
  { key: 'nim',  label: 'NIM (%)',         invert: false },
  { key: 'npl',  label: 'NPL Ratio (%)',   invert: true  },
  { key: 'lcr',  label: 'LCR (%)',         invert: false },
];

const CompetitorAnalysis: React.FC = () => {
  const { loading, lastSynced, refresh } = useDb();
  const [selectedMetric, setSelectedMetric] = useState<string>('roe');

  const exportCSV = () => {
    const headers = ['Bank', 'ROE%', 'ROA%', 'CIR%', 'NIM%', 'NPL%', 'LCR%', 'CAR%', 'PAT(₦bn)'];
    const rows = PEERS.map(b =>
      [b.name, b.roe, b.roa, b.cir, b.nim, b.npl, b.lcr, b.cap, b.pat].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'peer_benchmarks.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const radarData = ['ROE', 'ROA', 'NIM', 'LCR (÷10)', 'CAR'].map((subject) => {
    const entry: Record<string, string | number> = { subject };
    PEERS.forEach(b => {
      if (subject === 'ROE') entry[b.name] = b.roe;
      else if (subject === 'ROA') entry[b.name] = b.roa * 5;
      else if (subject === 'NIM') entry[b.name] = b.nim;
      else if (subject === 'LCR (÷10)') entry[b.name] = b.lcr / 10;
      else entry[b.name] = b.cap;
    });
    return entry;
  });

  const barData = PEERS.map(b => ({ name: b.name, value: (b as any)[selectedMetric] }));

  const gtbank = PEERS[0];
  const peerAvg = (key: keyof typeof PEERS[0]) =>
    PEERS.slice(1).reduce((s, b) => s + (b[key] as number), 0) / (PEERS.length - 1);

  const tableRows = PEERS.map(b => ({
    bank: b.name, 'roe_%': b.roe, 'roa_%': b.roa, 'cir_%': b.cir,
    'nim_%': b.nim, 'npl_%': b.npl, 'lcr_%': b.lcr, 'car_%': b.cap, 'pat_bn': b.pat,
  })) as unknown as Record<string, unknown>[];

  return (
    <SectionCard
      title="Competitor Analysis"
      subtitle="Our Bank vs Nigerian Tier-1 Peers · FY 2024"
      icon={<TrendingUp className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={tableRows} />}
    >
      <div className="space-y-6">
        {/* Summary vs peer avg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map((m) => {
            const val = (gtbank as any)[m.key] as number;
            const avg = peerAvg(m.key as keyof typeof PEERS[0]) as number;
            const good = m.invert ? val < avg : val > avg;
            const diff = val - avg;
            return (
              <div key={m.key} className="bg-gt-card2 border border-gt-border rounded-xl p-3">
                <p className="text-xs text-gt-muted uppercase tracking-wide mb-1">{m.label}</p>
                <p className="text-xl font-bold text-gt-text">{val.toFixed(1)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${good ? 'text-gt-green' : 'text-gt-red'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)} vs peers
                </p>
              </div>
            );
          })}
        </div>

        {/* Metric selector + bar chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest">
              Peer Comparison — Select Metric
            </p>
            <div className="flex items-center gap-2">
              <select
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                className="bg-gt-card2 border border-gt-border text-gt-text text-xs rounded-lg px-2 py-1.5"
              >
                {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gt-border text-gt-muted hover:text-gt-orange hover:border-gt-orange text-xs rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<DK />} />
              <Bar dataKey="value" name={METRICS.find(m => m.key === selectedMetric)?.label ?? ''}
                fill="#F58220" radius={[4, 4, 0, 0]}
                isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quarterly PAT trend */}
          <div>
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
              Quarterly PAT Trend — ₦bn (8 quarters)
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={QUARTERLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="q" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₦${v}`} width={44} />
                <Tooltip content={<DK />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                {['Our Bank', 'Zenith', 'Access', 'UBA', 'First'].map(b => (
                  <Line key={b} type="monotone" dataKey={b} stroke={COLORS[b] ?? '#888'}
                    strokeWidth={b === 'Our Bank' ? 2.5 : 1.5}
                    dot={false}
                    strokeDasharray={b === 'Our Bank' ? undefined : '4 2'} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div>
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
              Multi-Metric Radar (normalised)
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#AAA' }} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 8, fill: '#555' }} />
                {PEERS.slice(0, 4).map(b => (
                  <Radar key={b.name} name={b.name} dataKey={b.name}
                    stroke={COLORS[b.name] ?? '#888'}
                    fill={COLORS[b.name] ?? '#888'}
                    fillOpacity={b.name === 'Our Bank' ? 0.25 : 0.05} />
                ))}
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Tooltip content={<DK />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Leaderboard — Ranked by PAT (₦bn)
          </p>
          <div className="overflow-x-auto rounded-xl border border-gt-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gt-card2 border-b border-gt-border">
                  {['Rank', 'Bank', 'PAT ₦bn', 'ROE %', 'ROA %', 'CIR %', 'NIM %', 'NPL %', 'LCR %', 'CAR %'].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gt-border">
                {[...PEERS].sort((a, b) => b.pat - a.pat).map((b, i) => (
                  <tr key={b.name} className={`transition-colors ${b.name === 'Our Bank' ? 'bg-gt-orange/5' : 'hover:bg-gt-card2'}`}>
                    <td className="px-3 py-2.5 text-gt-muted font-mono">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gt-text">{b.name}{b.name === 'Our Bank' && <span className="ml-1.5 text-gt-orange text-xs">(us)</span>}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.pat}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.roe}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.roa}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.cir}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.nim}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.npl}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.lcr}</td>
                    <td className="px-3 py-2.5 font-mono text-gt-text">{b.cap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default CompetitorAnalysis;
