import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Treemap, Cell,
} from 'recharts';
import { BarChart2, X } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { useDb } from '../lib/DbContext';
import { useFilters, SectorKey } from '../lib/FilterContext';
import { sectorData, TOTAL_LOAN_BOOK } from '../data/sectorData';

const bn  = (n: number) => '₦' + (n / 1e9).toFixed(1) + 'bn';
const pct = (n: number) => n.toFixed(1) + '%';

const RAG_BADGE: Record<string, string> = {
  green: 'bg-gt-green/15 text-gt-green border-gt-green/30',
  amber: 'bg-gt-amber/15 text-gt-amber border-gt-amber/30',
  red:   'bg-gt-red/15 text-gt-red border-gt-red/30',
};

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">{typeof p.value === 'number' && p.name?.includes('%') ? pct(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, color } = props;
  if (width < 30 || height < 20) return null;
  const pctShare = ((value / TOTAL_LOAN_BOOK) * 100).toFixed(1);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} opacity={0.85} rx={4} />
      <rect x={x} y={y} width={width} height={height} fill="none" stroke="#fff" strokeWidth={2} rx={4} />
      {width > 60 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={10} opacity={0.9}>{pctShare}%</text>
        </>
      )}
    </g>
  );
};

const SectoralAnalysis: React.FC = () => {
  const { loading, lastSynced, refresh } = useDb();
  const { sector: activeSector, setSector } = useFilters();
  const [detailSector, setDetailSector] = useState<SectorKey | null>(null);

  const selected = detailSector ? sectorData.find(s => s.id === detailSector) : null;

  const treemapData = sectorData.map(s => ({
    name:  s.shortName,
    value: s.exposure,
    color: s.color,
  }));

  const revenueData = sectorData.map(s => ({
    name:    s.shortName,
    Revenue: s.revenueContribution,
    fill:    s.color,
  }));

  const nplData = [...sectorData].sort((a, b) => b.nplRatio - a.nplRatio);

  const toggleSector = (id: SectorKey) => {
    setSector(activeSector === id ? null : id);
    setDetailSector(prev => prev === id ? null : id);
  };

  return (
    <SectionCard
      title="Sectoral Analysis"
      subtitle="Loan exposure, NPL ratios & revenue contribution by sector — FY 2024"
      icon={<BarChart2 className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
    >
      {/* Active filter banner */}
      {activeSector && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gt-orange/10 border border-gt-orange/30 rounded-xl">
          <span className="text-xs font-semibold text-gt-orange">
            Filtering: {sectorData.find(s => s.id === activeSector)?.name}
          </span>
          <button onClick={() => { setSector(null); setDetailSector(null); }}
            className="ml-auto text-gt-muted hover:text-gt-text">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sector Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {sectorData.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSector(s.id)}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
              activeSector === s.id
                ? 'border-gt-orange bg-gt-orange/10 ring-1 ring-gt-orange'
                : 'border-gt-border bg-gt-card2 hover:border-gt-orange/50'
            }`}
          >
            <p className="text-xs font-medium text-gt-muted uppercase tracking-wide leading-tight truncate">{s.shortName}</p>
            <p className="text-sm font-bold text-gt-text mt-1">{bn(s.exposure)}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${RAG_BADGE[s.rag]}`}>
                NPL {pct(s.nplRatio)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${s.yoyGrowth >= 0 ? 'text-gt-green' : 'text-gt-red'}`}>
                {s.yoyGrowth >= 0 ? '↑' : '↓'} {Math.abs(s.yoyGrowth).toFixed(1)}% YoY
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Treemap — concentration risk */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Loan Portfolio Concentration — Treemap (₦bn)
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4 / 3}
              content={<TreemapContent />}
            />
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {sectorData.map(s => (
              <span key={s.id} className="flex items-center gap-1 text-xs text-gt-muted">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.shortName} {s.riskConcentration}%
              </span>
            ))}
          </div>
        </div>

        {/* Revenue contribution bar */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Revenue Contribution by Sector (%)
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} width={36} />
              <Tooltip content={<DkTooltip />} />
              <Bar dataKey="Revenue" name="Revenue %" radius={[4, 4, 0, 0]}>
                {revenueData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NPL by sector — horizontal bars */}
      <div>
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
          NPL Ratio by Sector (%) — Ranked
        </p>
        <div className="space-y-2">
          {nplData.map((s) => {
            const barW = Math.min((s.nplRatio / 12) * 100, 100);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-gt-muted w-24 shrink-0 truncate">{s.shortName}</span>
                <div className="flex-1 bg-gt-grey rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-2.5 transition-all duration-500 cursor-pointer"
                    style={{ width: `${barW}%`, backgroundColor: s.color }}
                    onClick={() => toggleSector(s.id)}
                  >
                    <span className="text-white text-xs font-semibold whitespace-nowrap">{pct(s.nplRatio)}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${RAG_BADGE[s.rag]}`}>
                  {s.rag === 'green' ? '● Good' : s.rag === 'amber' ? '● Watch' : '● Alert'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down panel */}
      {selected && (
        <div className="mt-6 p-4 bg-gt-card2 border border-gt-border rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gt-text">{selected.name} — Drill-through</p>
              <p className="text-xs text-gt-muted">Quarterly NPL trend & exposure growth</p>
            </div>
            <button onClick={() => setDetailSector(null)} className="text-gt-muted hover:text-gt-text">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-2">NPL Trend (%)</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={selected.quarterlyNPL} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
                  <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}%`} width={34} />
                  <Tooltip />
                  <Line type="monotone" dataKey="npl" name="NPL %" stroke={selected.color} strokeWidth={2} dot={{ r: 4, fill: selected.color }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-2">Exposure Growth (₦bn)</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={selected.quarterlyExposure.map(r => ({ ...r, exposure: r.exposure / 1e9 }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
                  <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₦${v}bn`} width={48} />
                  <Tooltip formatter={(v: any) => [`₦${v.toFixed(1)}bn`, 'Exposure']} />
                  <Bar dataKey="exposure" name="Exposure" fill={selected.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Exposure',    value: bn(selected.exposure)             },
              { label: 'Risk Concentration',value: pct(selected.riskConcentration)   },
              { label: 'Revenue Contrib.',  value: pct(selected.revenueContribution) },
              { label: 'YoY Growth',        value: `+${pct(selected.yoyGrowth)}`     },
            ].map(k => (
              <div key={k.label} className="bg-gt-card border border-gt-border rounded-xl p-3">
                <p className="text-xs text-gt-muted">{k.label}</p>
                <p className="text-sm font-bold text-gt-text mt-0.5">{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default SectoralAnalysis;
