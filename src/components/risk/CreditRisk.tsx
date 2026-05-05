import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { RAGBadge } from '../common/RAGBadge';
import { useFilterStore } from '../../store/filterStore';
import { getRiskSummary } from '../../services/riskService';
import { reinsuranceTreatyLog } from '../../data/reinsurance_treaty_log';
import { brokerMaster } from '../../data/broker_master';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

const RATING_COLOR: Record<string, string> = {
  'A+': '#00A86B', 'A': '#00A86B', 'A-': '#F59E0B',
  'BBB+': '#F59E0B', 'BBB': '#DC2626',
};

const CreditRisk: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getRiskSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency]
  );

  // Reinsurer concentration
  const reinsurerRows = data.reinsuerConcentration.map((r) => ({
    reinsurer: r.reinsurer,
    rating: r.rating,
    premium_ceded: r.premiumCeded,
    pct_of_programme: r.pctOfProgramme,
    status: r.rag,
  })) as Record<string, unknown>[];

  // Broker credit top-20
  const brokerRows = brokerMaster
    .sort((a, b) => b.premium_outstanding - a.premium_outstanding)
    .slice(0, 20)
    .map((b) => ({
      broker: b.broker_name,
      tier: b.broker_tier,
      gwp_ytd: b.gwp_ytd,
      outstanding: b.premium_outstanding,
      '0-30d': b.debtor_aging_30,
      '31-60d': b.debtor_aging_60,
      '61-90d': b.debtor_aging_90,
      '90+d': b.debtor_aging_90plus,
    })) as Record<string, unknown>[];

  // Bond issuer concentration bar
  const bondIssuers = [
    { issuer: 'FGN (FGS)', pct: 28.4 },
    { issuer: 'Lagos State', pct: 6.8 },
    { issuer: 'Dangote Industries', pct: 5.2 },
    { issuer: 'Access Bank Plc', pct: 4.9 },
    { issuer: 'MTN Nigeria', pct: 4.1 },
    { issuer: 'BUA Foods', pct: 3.8 },
    { issuer: 'Rivers State', pct: 3.4 },
    { issuer: 'Seplat Energy', pct: 2.9 },
    { issuer: 'Ogun State', pct: 2.5 },
    { issuer: 'Nestle Nigeria', pct: 2.1 },
  ];

  // Intercompany matrix entities
  const icEntities = ['LWL', 'LWG', 'LWC', 'LWH', 'LWT', 'LWP', 'LWN'];
  const icMatrix: Record<string, Record<string, number>> = {
    LWL: { LWC: 2.5 },
    LWG: { LWH: 0.8 },
    LWT: { LWP: 0.35 },
    LWN: { LWC: 1.2 },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Credit Risk</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Counterparty, broker, and issuer concentration risk</p>
      </div>

      {/* Reinsurer counterparty */}
      <SectionCard
        title="Reinsurer Counterparty Risk"
        subtitle="Premium ceded and exposure by reinsurer (flag if >25% of programme)"
        tableContent={<DataTable rows={reinsurerRows} filename="reinsurer_counterparty" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Reinsurer', 'Rating', 'Premium Ceded YTD', 'Claims Outstanding', 'Net Exposure', '% of Programme', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {data.reinsuerConcentration.map((r) => {
                const treaty = reinsuranceTreatyLog.find((t) => t.reinsurer_name === r.reinsurer);
                return (
                  <tr key={r.reinsurer} className="hover:bg-lw-red/5 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-lw-darkText">{r.reinsurer}</td>
                    <td className="px-4 py-2.5 font-mono font-bold" style={{ color: RATING_COLOR[r.rating] ?? '#7A92B0' }}>
                      {r.rating}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-lw-darkText">{bn(r.premiumCeded)}</td>
                    <td className="px-4 py-2.5 font-mono text-lw-amber">{bn(treaty?.recoveries_outstanding ?? 0)}</td>
                    <td className="px-4 py-2.5 font-mono text-lw-darkText">{bn(treaty?.counterparty_exposure ?? 0)}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: r.pctOfProgramme > 25 ? '#DC2626' : '#E8EDF5' }}>
                      {pct(r.pctOfProgramme)}
                    </td>
                    <td className="px-4 py-2.5"><RAGBadge status={r.rag} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Broker credit + Bond issuer */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard
          title="Broker Premium Debtor Book"
          subtitle="Top 20 brokers by outstanding premium balance"
          tableContent={<DataTable rows={brokerRows} filename="broker_credit_risk" />}
        >
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {brokerMaster.slice(0, 10).map((b) => {
              const total = b.premium_outstanding;
              const badDebt = b.debtor_aging_60 + b.debtor_aging_90 + b.debtor_aging_90plus;
              const rag = badDebt / total > 0.3 ? 'Red' : badDebt / total > 0.15 ? 'Amber' : 'Green';
              return (
                <div key={b.broker_id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-lw-darkText truncate max-w-[160px]">{b.broker_name}</span>
                      <span className="text-xs font-mono text-lw-darkMuted flex-shrink-0">{bn(total)}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-lw-darkBorder">
                      <div className="bg-lw-green h-full" style={{ width: pct(b.debtor_aging_30 / total * 100) }} />
                      <div className="bg-lw-amber h-full" style={{ width: pct(b.debtor_aging_60 / total * 100) }} />
                      <div className="bg-orange-500 h-full" style={{ width: pct(b.debtor_aging_90 / total * 100) }} />
                      <div className="bg-lw-danger h-full" style={{ width: pct(b.debtor_aging_90plus / total * 100) }} />
                    </div>
                  </div>
                  <RAGBadge status={rag} size="sm" />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Bond Issuer Concentration" subtitle="Fixed income exposure as % of bond portfolio · 10% limit (red line)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bondIssuers} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={pct} axisLine={false} tickLine={false} domain={[0, 35]} />
              <YAxis type="category" dataKey="issuer" tick={{ fontSize: 9, fill: '#7A92B0' }} width={110} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [pct(v), '% of portfolio']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <ReferenceLine x={10} stroke="#DC2626" strokeDasharray="4 2" label={{ value: '10% limit', fill: '#DC2626', fontSize: 9, position: 'top' }} />
              <Bar dataKey="pct" name="% of Portfolio" radius={[0, 4, 4, 0]}>
                {bondIssuers.map((entry, i) => (
                  <rect key={i} fill={entry.pct > 10 ? '#DC2626' : '#C8102E'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Intercompany matrix */}
      <SectionCard title="Intercompany Exposure Matrix" subtitle="Intra-group balances in ₦bn (rows = creditor, columns = debtor)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                <th className="px-4 py-3 text-left font-semibold text-lw-darkMuted">From \ To</th>
                {icEntities.map((e) => (
                  <th key={e} className="px-4 py-3 text-center font-semibold text-lw-darkMuted">{e}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {icEntities.map((from) => (
                <tr key={from} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-lw-gold font-mono">{from}</td>
                  {icEntities.map((to) => {
                    const val = icMatrix[from]?.[to] ?? 0;
                    return (
                      <td key={to} className="px-4 py-2.5 text-center font-mono">
                        {val > 0 ? (
                          <span className="text-lw-amber font-semibold">{val.toFixed(1)}bn</span>
                        ) : (
                          <span className="text-lw-darkBorder">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default CreditRisk;
