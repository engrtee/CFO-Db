import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { Building2 } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const bn  = (n: number) => '₦' + n.toFixed(1) + 'bn';
const pct = (n: number) => n.toFixed(1) + '%';

const DkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gt-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill ?? p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-mono">{p.value?.toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

const TreasuryMarketRisk: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows   = data.treasury_market;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];

  const fxData = [
    { currency: 'USD', exposure: latest.fx_usd_exposure, color: '#F58220' },
    { currency: 'GBP', exposure: latest.fx_gbp_exposure, color: '#27AE60' },
    { currency: 'EUR', exposure: latest.fx_eur_exposure, color: '#AAAAAA' },
  ];

  const yieldData = rows.map((r) => ({
    date: r.date.replace(' 2025', '').replace(' 2024', ''),
    'Portfolio Yield': r.yield_on_securities,
  }));

  const positionPct = latest.open_position_vs_limit;
  const posColor = positionPct <= 60 ? '#27AE60' : positionPct <= 80 ? '#FFA500' : '#E02020';
  const posRag = positionPct <= 60 ? 'text-gt-green bg-gt-green/15' : positionPct <= 80 ? 'text-gt-amber bg-gt-amber/15' : 'text-gt-red bg-gt-red/15';

  return (
    <SectionCard
      title="Treasury & Market Risk Indicators"
      subtitle="FX positions · Securities portfolio · Interest rate risk"
      icon={<Building2 className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Portfolio Value',     value: bn(latest.portfolio_value),      sub: `Prior: ${bn(prev.portfolio_value)}`,     good: latest.portfolio_value > prev.portfolio_value },
          { label: 'Yield on Securities', value: pct(latest.yield_on_securities), sub: `Prior: ${pct(prev.yield_on_securities)}`, good: true },
          { label: 'DV01 (₦mn)',          value: '₦' + latest.dv01 + 'mn',        sub: '₦ value of 1bp shift',                   good: latest.dv01 < 160 },
          { label: 'NII at Risk',         value: bn(latest.nii_at_risk),          sub: 'Stress: +/-200bp',                       good: latest.nii_at_risk < 25 },
        ].map((m) => (
          <div key={m.label} className={`rounded-xl border p-4 ${m.good ? 'border-gt-border bg-gt-card2' : 'border-gt-amber/30 bg-gt-amber/5'}`}>
            <p className="text-xs font-medium text-gt-muted uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-gt-text mt-1">{m.value}</p>
            <p className="text-xs text-gt-muted mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            FX Net Open Positions — {latest.date} (millions)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fxData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="currency" tick={{ fontSize: 12, fill: '#FFF', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false} width={38} />
              <Tooltip content={<DkTooltip />} />
              <Bar dataKey="exposure" name="Exposure (mn)" radius={[6, 6, 0, 0]}>
                {fxData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-gt-card2 border border-gt-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gt-muted">Open Position vs CBN Limit</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${posRag}`}>
                {positionPct.toFixed(1)}% used
              </span>
            </div>
            <div className="w-full bg-gt-border rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(positionPct, 100)}%`, backgroundColor: posColor }}
              />
            </div>
            <p className="text-xs text-gt-muted mt-1">Regulatory limit: 100%</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Portfolio Yield (%) — Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={yieldData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAA' }} axisLine={false} tickLine={false}
                domain={[18, 26]} tickFormatter={(v) => `${v}%`} width={38} />
              <Tooltip content={<DkTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Portfolio Yield" stroke="#F58220" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <p className="text-xs text-gt-muted mb-2">Portfolio value (₦bn) — monthly sparkline</p>
            <div className="flex items-end gap-1 h-16">
              {rows.map((r, i) => {
                const maxV = Math.max(...rows.map((x) => x.portfolio_value));
                const h = (r.portfolio_value / maxV) * 100;
                const isLatest = i === rows.length - 1;
                return (
                  <div
                    key={r.date}
                    title={`${r.date}: ₦${r.portfolio_value}bn`}
                    className="flex-1 rounded-t-sm transition-all duration-300 cursor-pointer"
                    style={{ height: `${h}%`, backgroundColor: isLatest ? '#F58220' : '#444' }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gt-muted">
              <span>{rows[0].date.replace(' 2025', '').replace(' 2024', '')}</span>
              <span>{rows[rows.length - 1].date.replace(' 2025', '').replace(' 2024', '')}</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default TreasuryMarketRisk;
