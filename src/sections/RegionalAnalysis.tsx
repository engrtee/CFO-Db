import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { MapPin, X } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { useDb } from '../lib/DbContext';
import { useFilters, ZoneKey } from '../lib/FilterContext';
import { zoneData, cityData } from '../data/regionalData';

const bn  = (n: number) => '₦' + (n / 1e9).toFixed(1) + 'bn';
const pct = (n: number) => n.toFixed(1) + '%';

const RAG_BADGE: Record<string, string> = {
  green: 'bg-gt-green/15 text-gt-green border-gt-green/30',
  amber: 'bg-gt-amber/15 text-gt-amber border-gt-amber/30',
  red:   'bg-gt-red/15 text-gt-red border-gt-red/30',
};

// ── Simplified Nigeria SVG zone map (6 geopolitical zones) ──────────────────
const NigeriaZoneMap: React.FC<{
  active: ZoneKey | null;
  onSelect: (z: ZoneKey) => void;
}> = ({ active, onSelect }) => {
  // Each zone drawn as a rounded rect positioned to roughly mirror Nigeria's geography
  // viewBox: 0 0 300 280
  const zones: { id: ZoneKey; label: string; x: number; y: number; w: number; h: number }[] = [
    { id: 'north_west',   label: 'NW', x:  10, y:  10, w: 100, h: 90 },
    { id: 'north_central',label: 'NC', x: 115, y:  10, w: 80,  h: 90 },
    { id: 'north_east',   label: 'NE', x: 200, y:  10, w: 90,  h: 90 },
    { id: 'south_west',   label: 'SW', x:  10, y: 108, w: 100, h: 90 },
    { id: 'south_south',  label: 'SS', x: 115, y: 108, w: 80,  h: 90 },
    { id: 'south_east',   label: 'SE', x: 200, y: 108, w: 90,  h: 90 },
  ];

  return (
    <svg viewBox="0 0 300 210" className="w-full max-w-xs mx-auto">
      {zones.map(z => {
        const zd = zoneData.find(d => d.id === z.id)!;
        const isActive = active === z.id;
        return (
          <g key={z.id} className="cursor-pointer" onClick={() => onSelect(z.id)}>
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h}
              rx={8} ry={8}
              fill={zd.color}
              opacity={isActive ? 1 : active ? 0.45 : 0.75}
              stroke={isActive ? '#111827' : '#fff'}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 7} textAnchor="middle"
              fill="#fff" fontSize={13} fontWeight={700}>{z.label}</text>
            <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 9} textAnchor="middle"
              fill="#fff" fontSize={9} opacity={0.9}>{pct(zd.nplRatio)} NPL</text>
            <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 22} textAnchor="middle"
              fill="#fff" fontSize={9} opacity={0.85}>{pct(zd.concentration)}</text>
          </g>
        );
      })}
      {/* Legend stripe at bottom */}
      <text x={150} y={206} textAnchor="middle" fill="#6B7280" fontSize={9}>
        Click zone to drill down · % = share of loan book
      </text>
    </svg>
  );
};

const RegionalAnalysis: React.FC = () => {
  const { loading, lastSynced, refresh } = useDb();
  const { zone: activeZone, sector: activeSector, segment: activeSegment, setZone } = useFilters();
  const [detailZone, setDetailZone] = useState<ZoneKey | null>(null);

  const selected = detailZone ? zoneData.find(z => z.id === detailZone) : null;

  const toggleZone = (id: ZoneKey) => {
    const next = detailZone === id ? null : id;
    setDetailZone(next);
    setZone(next);
  };

  const filterMultiplier = (activeSector || activeSegment) ? 0.68 : 1;

  const sortedZones = [...zoneData].sort((a, b) => b.portfolioSize - a.portfolioSize);

  const portfolioChartData = sortedZones.map(z => ({
    name: z.shortName,
    Portfolio: (z.portfolioSize * filterMultiplier) / 1e9,
    Revenue:   (z.revenue * filterMultiplier) / 1e9,
    fill: z.color,
  }));

  return (
    <SectionCard
      title="Regional Classification — 6 Geopolitical Zones"
      subtitle="Portfolio size, NPL, growth & branch network per zone — FY 2024"
      icon={<MapPin className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
    >
      {/* Cross-filter banner */}
      {(activeSector || activeSegment) && (
        <div className="mb-4 px-3 py-2 bg-gt-amber/10 border border-gt-amber/30 rounded-xl">
          <p className="text-xs text-gt-amber font-medium">
            ⚡ Cross-filter active — data shown for {[activeSector, activeSegment].filter(Boolean).join(' + ')} subset
          </p>
        </div>
      )}

      {/* Active zone banner */}
      {activeZone && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gt-orange/10 border border-gt-orange/30 rounded-xl">
          <span className="text-xs font-semibold text-gt-orange">
            Zone filter: {zoneData.find(z => z.id === activeZone)?.name}
          </span>
          <button onClick={() => { setZone(null); setDetailZone(null); }} className="ml-auto text-gt-muted hover:text-gt-text">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Nigeria zone map */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Nigeria — Geopolitical Zone Performance Map
          </p>
          <NigeriaZoneMap active={detailZone} onSelect={toggleZone} />

          {/* RAG legend */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {[
              { label: 'Low NPL (≤5%)',  color: '#27AE60' },
              { label: 'Watch (5–7%)',   color: '#D97706' },
              { label: 'Elevated (>7%)', color: '#E02020' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gt-muted">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Zone portfolio chart */}
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Portfolio & Revenue by Zone (₦bn)
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={portfolioChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₦${v}bn`} width={52} />
              <Tooltip formatter={(v: any, name: string) => [`₦${v.toFixed(1)}bn`, name]} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Portfolio" name="Portfolio (₦bn)" fill="#F58220" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Revenue"   name="Revenue (₦bn)"   fill="#27AE60" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone performance table */}
      <div className="overflow-x-auto rounded-xl border border-gt-border mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gt-card2 border-b border-gt-border">
              {['#', 'Zone', 'Portfolio', 'NPL Ratio', 'YoY Growth', 'Branches', 'Agents', 'Revenue', 'Status'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gt-border">
            {sortedZones.map((z, i) => (
              <tr
                key={z.id}
                className={`hover:bg-gt-card2 transition-colors cursor-pointer ${detailZone === z.id ? 'bg-gt-orange/5' : ''}`}
                onClick={() => toggleZone(z.id)}
              >
                <td className="px-3 py-2.5 text-xs text-gt-muted font-mono">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                    <div>
                      <p className="text-xs font-semibold text-gt-text">{z.name}</p>
                      <p className="text-xs text-gt-muted">{z.states.slice(0, 2).join(', ')}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gt-text">{bn(z.portfolioSize * filterMultiplier)}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RAG_BADGE[z.rag]}`}>
                    {pct(z.nplRatio)}
                  </span>
                </td>
                <td className={`px-3 py-2.5 font-mono text-xs font-semibold ${z.growthRate >= 8 ? 'text-gt-green' : z.growthRate >= 5 ? 'text-gt-amber' : 'text-gt-red'}`}>
                  +{pct(z.growthRate)}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-gt-muted">{z.branchCount}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-gt-muted">{z.agentCount.toLocaleString()}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-gt-text">{bn(z.revenue * filterMultiplier)}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RAG_BADGE[z.rag]}`}>
                    {z.rag === 'green' ? '● Good' : z.rag === 'amber' ? '● Watch' : '● Alert'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zone drill-down */}
      {selected && (
        <div className="p-4 bg-gt-card2 border border-gt-border rounded-2xl mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gt-text">{selected.name} — Drill-through</p>
              <p className="text-xs text-gt-muted">{selected.states.join(' · ')}</p>
            </div>
            <button onClick={() => { setDetailZone(null); setZone(null); }} className="text-gt-muted hover:text-gt-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Portfolio Size', value: bn(selected.portfolioSize) },
              { label: 'NPL Ratio',      value: pct(selected.nplRatio)    },
              { label: 'Branches',       value: selected.branchCount.toString() },
              { label: 'Agent Network',  value: selected.agentCount.toLocaleString() },
            ].map(k => (
              <div key={k.label} className="bg-gt-card border border-gt-border rounded-xl p-3">
                <p className="text-xs text-gt-muted">{k.label}</p>
                <p className="text-sm font-bold text-gt-text mt-0.5">{k.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-2">
              Quarterly Growth (%)
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={selected.quarterlyGrowth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
                <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} width={32} />
                <Tooltip formatter={(v: any) => [`${v.toFixed(1)}%`, 'Growth']} />
                <Line type="monotone" dataKey="growth" name="Growth %" stroke={selected.color}
                  strokeWidth={2.5} dot={{ r: 4, fill: selected.color }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* City / Branch table */}
      <div>
        <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
          Major City & Branch Performance
        </p>
        <div className="overflow-x-auto rounded-xl border border-gt-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gt-card2 border-b border-gt-border">
                {['City', 'Zone', 'Portfolio', 'NPL Ratio', 'Branches', 'Revenue', 'Status'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gt-border">
              {cityData
                .filter(c => !detailZone || c.zone === detailZone)
                .map((c) => {
                  const zone = zoneData.find(z => z.id === c.zone)!;
                  return (
                    <tr key={c.city} className="hover:bg-gt-card2 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-gt-text text-xs">{c.city}</td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5 text-xs text-gt-muted">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                          {zone.shortName}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gt-text">{bn(c.portfolioSize * filterMultiplier)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RAG_BADGE[c.rag]}`}>
                          {pct(c.nplRatio)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gt-muted">{c.branchCount}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gt-text">{bn(c.revenue * filterMultiplier)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RAG_BADGE[c.rag]}`}>
                          {c.rag === 'green' ? '● Good' : c.rag === 'amber' ? '● Watch' : '● Alert'}
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

export default RegionalAnalysis;
