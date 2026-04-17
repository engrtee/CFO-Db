import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Droplets } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const pct = (n: number) => n.toFixed(1) + '%';
const bn  = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'bn';

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

interface GaugeProps { value: number; max?: number; threshold?: number; label: string }
function Gauge({ value, max = 200, threshold = 100, label }: GaugeProps) {
  const cx = 90; const cy = 90; const r = 68;
  const START = -220; const END = 40; const RANGE = END - START;

  const clampedVal = Math.min(value, max);
  const valDeg = START + (clampedVal / max) * RANGE;
  const thDeg  = START + (threshold / max) * RANGE;
  const isGood = value >= threshold;
  const color  = isGood ? '#27AE60' : value >= threshold * 0.85 ? '#FFA500' : '#E02020';
  const thPt   = polarToCartesian(cx, cy, r, thDeg);
  const thIn   = polarToCartesian(cx, cy, r - 14, thDeg);

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={150} viewBox="0 0 180 150">
        <path d={arcPath(cx, cy, r, START, END)} fill="none" stroke="#333" strokeWidth={12} strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, START, valDeg)} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" />
        <line x1={thPt.x} y1={thPt.y} x2={thIn.x} y2={thIn.y} stroke="#FFA500" strokeWidth={3} strokeLinecap="round" />
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={26} fontWeight={700} fill={color}>{value}%</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize={10} fill="#AAA">Min: {threshold}%</text>
        <text x={14}  y={134}  fontSize={9} fill="#AAA">0</text>
        <text x={165} y={134}  fontSize={9} fill="#AAA" textAnchor="end">{max}%</text>
      </svg>
      <p className="text-sm font-semibold text-gt-text -mt-1">{label}</p>
      <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${isGood ? 'bg-gt-green/15 text-gt-green' : 'bg-gt-red/15 text-gt-red'}`}>
        {isGood ? '✓ Above minimum' : '✗ Below minimum'}
      </span>
    </div>
  );
}

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-mono">{p.value?.toFixed(1)}%</span>
        </p>
      ))}
    </div>
  );
};

const LiquidityFunding: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows   = data.liquidity_metrics;
  const latest = rows[rows.length - 1];

  const fundingData = rows.map((r) => ({
    date: r.date.replace(' 2025', '').replace(' 2024', ''),
    Retail: r.retail_funding_pct,
    Wholesale: r.wholesale_funding_pct,
  }));

  return (
    <SectionCard
      title="Liquidity & Funding Metrics"
      subtitle="LCR / NSFR vs CBN minimums · Funding mix trend"
      icon={<Droplets className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sm:col-span-1 flex justify-center">
          <Gauge value={latest.lcr}  max={200} threshold={100} label="LCR" />
        </div>
        <div className="sm:col-span-1 flex justify-center">
          <Gauge value={latest.nsfr} max={200} threshold={100} label="NSFR" />
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3 content-start">
          {[
            { label: 'Loan-to-Deposit Ratio', value: pct(latest.loan_to_deposit_ratio), note: 'Target: ≤80%',   good: latest.loan_to_deposit_ratio <= 80 },
            { label: 'Retail Funding',         value: pct(latest.retail_funding_pct),   note: 'Stable core',     good: latest.retail_funding_pct >= 60 },
            { label: 'Wholesale Funding',      value: pct(latest.wholesale_funding_pct),note: 'Short-term risk', good: latest.wholesale_funding_pct <= 35 },
            { label: 'Interbank Borrowings',   value: bn(latest.interbank_borrowings),  note: latest.maturity_bucket, good: latest.interbank_borrowings < 350 },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl border p-3 ${m.good ? 'border-gt-border bg-gt-card2' : 'border-gt-amber/30 bg-gt-amber/5'}`}>
              <p className="text-xs font-medium text-gt-muted uppercase tracking-wide leading-tight">{m.label}</p>
              <p className="text-lg font-bold text-gt-text mt-1">{m.value}</p>
              <p className={`text-xs mt-0.5 ${m.good ? 'text-gt-muted' : 'text-gt-amber'}`}>{m.note}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
        Funding Mix — Retail vs Wholesale (%) — Monthly
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={fundingData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
            domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={38} />
          <Tooltip content={<DkTooltip />} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Retail"    fill="#F58220" stackId="mix" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Wholesale" fill="#555"    stackId="mix" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </SectionCard>
  );
};

export default LiquidityFunding;
