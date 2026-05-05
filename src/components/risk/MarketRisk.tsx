import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { RAGBadge } from '../common/RAGBadge';
import { useFilterStore } from '../../store/filterStore';
import { getRiskSummary } from '../../services/riskService';
import { TrendingDown, Activity } from 'lucide-react';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(2) + '%';

const MarketRisk: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getRiskSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency]
  );

  const varCard = (metric: string) => data.varMetrics.find((v) => v.metric === metric)?.value ?? 0;

  // Duration data (mock per entity)
  const durationData = [
    { entity: 'LWL', assetDuration: 4.8, liabilityDuration: 7.2, dv01: -42_000_000 },
    { entity: 'LWG', assetDuration: 3.2, liabilityDuration: 4.1, dv01: -18_000_000 },
    { entity: 'LWH', assetDuration: 1.8, liabilityDuration: 2.5, dv01: -8_500_000 },
    { entity: 'LWN', assetDuration: 6.1, liabilityDuration: 8.4, dv01: -95_000_000 },
  ];

  const durationBarData = durationData.map((d) => ({
    entity: d.entity,
    'Asset Duration': d.assetDuration,
    'Liability Duration': d.liabilityDuration,
    'Duration Gap': d.liabilityDuration - d.assetDuration,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Market Risk</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Portfolio market risk metrics and stress testing</p>
      </div>

      {/* VaR KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Equity VaR 95% (1-Day)"
          value={varCard('equity_var_95_1d')}
          formatter={bn}
          icon={TrendingDown}
          ragStatus="Green"
          subtitle="Parametric estimate"
        />
        <KPICard
          title="Equity VaR 99% (1-Day)"
          value={varCard('equity_var_99_1d')}
          formatter={bn}
          icon={TrendingDown}
          ragStatus="Amber"
          subtitle="Parametric estimate"
        />
        <KPICard
          title="Equity VaR 95% (10-Day)"
          value={varCard('equity_var_95_10d')}
          formatter={bn}
          icon={Activity}
          ragStatus="Amber"
          subtitle="√10 scaling"
        />
        <KPICard
          title="Equity VaR 99% (10-Day)"
          value={varCard('equity_var_99_10d')}
          formatter={bn}
          icon={Activity}
          ragStatus="Red"
          subtitle="√10 scaling"
        />
      </div>

      {/* Duration analysis + FX exposure */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Interest Rate Sensitivity — Duration Gap" subtitle="Asset vs liability duration by entity (years)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={durationBarData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="entity" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="Asset Duration" fill="#C8102E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Liability Duration" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* DV01 table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lw-darkBorder">
                  <th className="px-3 py-2 text-left text-lw-darkMuted uppercase tracking-wide">Entity</th>
                  <th className="px-3 py-2 text-right text-lw-darkMuted uppercase tracking-wide">Asset Dur (yrs)</th>
                  <th className="px-3 py-2 text-right text-lw-darkMuted uppercase tracking-wide">Liab Dur (yrs)</th>
                  <th className="px-3 py-2 text-right text-lw-darkMuted uppercase tracking-wide">DV01 (₦/bp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lw-darkBorder">
                {durationData.map((d) => (
                  <tr key={d.entity} className="hover:bg-lw-red/5">
                    <td className="px-3 py-2 font-bold text-lw-gold font-mono">{d.entity}</td>
                    <td className="px-3 py-2 text-right font-mono text-lw-darkText">{d.assetDuration.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-mono text-lw-amber">{d.liabilityDuration.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-mono text-lw-danger">{bn(d.dv01)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="FX Exposure" subtitle="Foreign currency positions vs CBN limits">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lw-darkBorder">
                  {['Entity', 'USD (₦bn)', 'GBP (₦bn)', 'EUR (₦bn)', 'Total FX', 'CBN Limit', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-lw-darkBorder">
                {data.fxExposure.map((fx) => (
                  <tr key={fx.subsidiary} className="hover:bg-lw-red/5 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-lw-gold font-mono">{fx.subsidiary}</td>
                    <td className="px-3 py-2.5 font-mono text-lw-darkText">{bn(fx.usdExposure)}</td>
                    <td className="px-3 py-2.5 font-mono text-lw-darkText">{bn(fx.gbpExposure)}</td>
                    <td className="px-3 py-2.5 font-mono text-lw-darkText">{bn(fx.eurExposure)}</td>
                    <td className="px-3 py-2.5 font-mono text-lw-darkText font-semibold">{bn(fx.totalNGN)}</td>
                    <td className="px-3 py-2.5 font-mono text-lw-darkMuted">15% of AUM</td>
                    <td className="px-3 py-2.5"><RAGBadge status={fx.rag} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Stress tests */}
      <SectionCard title="Stress Test Results" subtitle="Portfolio impact under three regulatory stress scenarios">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Scenario', 'Description', 'Portfolio Impact', 'Solvency (Stressed)', 'Solvency Status', 'Buffer'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {data.stressTests.map((s, i) => (
                <tr key={i} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-lw-darkText whitespace-nowrap">{s.scenario}</td>
                  <td className="px-4 py-3 text-lw-darkMuted whitespace-nowrap">
                    {i === 0 ? '20% equity market decline' : i === 1 ? '300bps interest rate shock' : '30% NGN depreciation'}
                  </td>
                  <td className="px-4 py-3 font-mono text-lw-danger font-semibold">{bn(s.portfolioImpact)}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{pct(s.stressedSolvencyRatio)}</td>
                  <td className="px-4 py-3"><RAGBadge status={s.stressedRag} size="sm" /></td>
                  <td className="px-4 py-3 font-mono" style={{ color: s.buffer > 5 ? '#00A86B' : '#F59E0B' }}>
                    {pct(s.buffer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default MarketRisk;
