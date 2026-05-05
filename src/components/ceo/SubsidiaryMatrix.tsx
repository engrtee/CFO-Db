import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { SectionCard } from '../SectionCard';
import { RAGBadge } from '../common/RAGBadge';
import { useFilterStore } from '../../store/filterStore';
import { getConsolidatedSummary } from '../../services/consolidationService';
import { useMemo } from 'react';
import { X } from 'lucide-react';

const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

function heatBg(val: number, target: number): string {
  const ratio = val / target * 100;
  if (ratio >= 110) return 'bg-lw-green/25 text-lw-green';
  if (ratio >= 100) return 'bg-green-700/20 text-green-400';
  if (ratio >= 85)  return 'bg-lw-amber/20 text-lw-amber';
  return 'bg-lw-danger/20 text-lw-danger';
}

interface SubsidiaryModalProps {
  sub: {
    code: string; name: string; gwp: number; pat: number; roe: number;
    combinedRatio: number; capitalStatus: string; headcount: number; ytdVsBudgetPct: number;
  };
  onClose: () => void;
}

const GWP_MOCK: Record<string, { period: string; gwp: number; lossRatio: number }[]> = {
  LWL: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 2_800_000_000 + i * 120_000_000, lossRatio: 53 + Math.random() * 4 })),
  LWG: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 1_800_000_000 + i * 80_000_000, lossRatio: 60 + Math.random() * 5 })),
  LWC: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 420_000_000 + i * 15_000_000, lossRatio: 0 })),
  LWH: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 680_000_000 + i * 22_000_000, lossRatio: 73 + Math.random() * 6 })),
  LWT: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 390_000_000 + i * 8_000_000, lossRatio: 0 })),
  LWP: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 195_000_000 + i * 5_000_000, lossRatio: 0 })),
  LWN: Array.from({ length: 6 }, (_, i) => ({ period: `${['Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${i < 2 ? '24' : '25'}`, gwp: 460_000_000 + i * 12_000_000, lossRatio: 0 })),
};

const SubsidiaryModal: React.FC<SubsidiaryModalProps> = ({ sub, onClose }) => {
  const trend = GWP_MOCK[sub.code] ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-lw-darkCard border border-lw-darkBorder rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-lw-darkBorder">
          <div>
            <span className="text-lw-gold font-mono font-bold mr-3">{sub.code}</span>
            <span className="text-lw-darkText font-semibold font-serif">{sub.name}</span>
          </div>
          <button onClick={onClose} className="text-lw-darkMuted hover:text-lw-danger transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* 6 KPI cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'GWP (YTD)', val: bn(sub.gwp) },
              { label: 'PAT (YTD)', val: bn(sub.pat) },
              { label: 'ROE', val: pct(sub.roe) },
              { label: 'Combined Ratio', val: pct(sub.combinedRatio) },
              { label: 'YTD vs Budget', val: pct(sub.ytdVsBudgetPct) },
              { label: 'Headcount', val: sub.headcount.toLocaleString() },
            ].map(({ label, val }) => (
              <div key={label} className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl p-3">
                <p className="text-xs text-lw-darkMuted mb-1">{label}</p>
                <p className="text-base font-bold font-mono text-lw-darkText">{val}</p>
              </div>
            ))}
          </div>
          {/* Mini charts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-lw-darkMuted mb-2 uppercase tracking-wide">GWP Trend</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="period" tick={{ fontSize: 8, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => [bn(v), 'GWP']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 9 }} />
                  <Bar dataKey="gwp" fill="#C8102E" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {trend[0]?.lossRatio > 0 && (
              <div>
                <p className="text-xs font-semibold text-lw-darkMuted mb-2 uppercase tracking-wide">Loss Ratio Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="period" tick={{ fontSize: 8, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[40, 90]} />
                    <Tooltip formatter={(v: number) => [pct(v), 'Loss Ratio']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 9 }} />
                    <Line type="monotone" dataKey="lossRatio" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-lw-darkMuted">Capital Status:</span>
            <RAGBadge status={sub.capitalStatus as 'Green' | 'Amber' | 'Red'} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SUB_NAMES: Record<string, string> = {
  LWL: 'Leadway Life', LWG: 'Leadway General', LWC: 'Leadway Capital',
  LWH: 'Leadway Health', LWT: 'Leadway Hotels', LWP: 'Leadway Properties', LWN: 'Leadway Pensure',
};

const SubsidiaryMatrix: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();
  const [selected, setSelected] = useState<(typeof data.subsidiaryBreakdown)[0] | null>(null);

  const data = useMemo(
    () => getConsolidatedSummary(period, currency),
    [period, currency]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {selected && (
        <SubsidiaryModal
          sub={{ ...selected, name: SUB_NAMES[selected.code] ?? selected.code }}
          onClose={() => setSelected(null)}
        />
      )}
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Subsidiary Performance Matrix</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Click any row to view subsidiary summary · {period}</p>
      </div>

      <SectionCard title="Subsidiary Heat Map" subtitle="Cell colour = performance vs target · Green >110% · Amber 85-100% · Red <85%">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Subsidiary', 'GWP', 'PAT', 'ROE', 'Combined Ratio / Op. Margin', 'Capital Status', 'Headcount', 'Rev / Employee', 'YTD vs Budget'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {data.subsidiaryBreakdown.map((sub) => (
                <tr
                  key={sub.code}
                  onClick={() => setSelected(sub)}
                  className="hover:bg-lw-red/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-bold text-lw-gold font-mono">{sub.code}</span>
                      <span className="text-lw-darkMuted ml-2 hidden xl:inline">{SUB_NAMES[sub.code]}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-mono rounded ${heatBg(sub.gwp, sub.gwp * 0.95)}`}>{(sub.gwp / 1e9).toFixed(1)}bn</td>
                  <td className={`px-4 py-3 font-mono rounded ${heatBg(sub.pat, sub.pat * 0.90)}`}>{(sub.pat / 1e9).toFixed(2)}bn</td>
                  <td className={`px-4 py-3 font-mono rounded ${heatBg(sub.roe, 15)}`}>{pct(sub.roe)}</td>
                  <td className={`px-4 py-3 font-mono rounded ${heatBg(100 - (sub.combinedRatio - 80), 20)}`}>{pct(sub.combinedRatio)}</td>
                  <td className="px-4 py-3"><RAGBadge status={sub.capitalStatus} size="sm" /></td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{sub.headcount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{(sub.gwp / sub.headcount / 1e6).toFixed(1)}m</td>
                  <td className={`px-4 py-3 font-mono rounded ${heatBg(sub.ytdVsBudgetPct, 100)}`}>{pct(sub.ytdVsBudgetPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-lw-darkMuted mt-3">Click any row to view one-page subsidiary summary</p>
      </SectionCard>
    </div>
  );
};

export default SubsidiaryMatrix;
