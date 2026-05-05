import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, Legend,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { useFilterStore } from '../../store/filterStore';
import { getConsolidatedSummary } from '../../services/consolidationService';
import { BarChart2, TrendingUp, Users, Target } from 'lucide-react';

const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold text-lw-darkText mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {Math.abs(p.value) > 1e6 ? bn(p.value) : pct(p.value)}
        </p>
      ))}
    </div>
  );
};

// Heat-map cell colour based on performance vs budget
function heatColor(pctOfBudget: number): string {
  if (pctOfBudget >= 110) return '#00A86B';
  if (pctOfBudget >= 100) return '#22c55e88';
  if (pctOfBudget >= 85)  return '#F59E0B88';
  return '#DC262688';
}

const LOB_DATA = [
  { lob: 'Motor',          gwp: 12_800_000_000, claims: 8_200_000_000, expenses: 2_900_000_000, result: 1_700_000_000 },
  { lob: 'Marine',         gwp: 4_200_000_000,  claims: 2_100_000_000, expenses: 850_000_000,  result: 1_250_000_000 },
  { lob: 'Fire & Property',gwp: 6_800_000_000,  claims: 3_400_000_000, expenses: 1_300_000_000, result: 2_100_000_000 },
  { lob: 'Engineering',    gwp: 3_100_000_000,  claims: 1_500_000_000, expenses: 620_000_000,  result: 980_000_000 },
  { lob: 'Oil & Gas',      gwp: 7_500_000_000,  claims: 4_200_000_000, expenses: 1_500_000_000, result: 1_800_000_000 },
  { lob: 'Aviation',       gwp: 1_800_000_000,  claims: 900_000_000,   expenses: 360_000_000,  result: 540_000_000 },
  { lob: 'Life Individual',gwp: 15_200_000_000, claims: 7_600_000_000, expenses: 3_040_000_000, result: 4_560_000_000 },
  { lob: 'Life Group',     gwp: 8_400_000_000,  claims: 4_620_000_000, expenses: 1_680_000_000, result: 2_100_000_000 },
  { lob: 'Annuities',      gwp: 5_600_000_000,  claims: 3_640_000_000, expenses: 840_000_000,  result: 1_120_000_000 },
  { lob: 'Health',         gwp: 4_800_000_000,  claims: 3_840_000_000, expenses: 720_000_000,  result: 240_000_000 },
];

const CHANNEL_DATA = [
  { channel: 'Broker',        gwp: 38_200_000_000, pct: 58, margin: 12.5 },
  { channel: 'Direct',        gwp: 11_900_000_000, pct: 18, margin: 18.2 },
  { channel: 'Bancassurance', gwp: 7_920_000_000,  pct: 12, margin: 9.8  },
  { channel: 'Digital',       gwp: 5_280_000_000,  pct: 8,  margin: 22.1 },
  { channel: 'Agent',         gwp: 2_640_000_000,  pct: 4,  margin: 7.3  },
];

const ProfitabilityAnalytics: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const consolidated = useMemo(
    () => getConsolidatedSummary(period, currency),
    [period, currency]
  );

  const formatVal = (v: number) =>
    currency === 'USD' ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn' : bn(v);

  // Policy trend (12 months mock)
  const policyTrend = Array.from({ length: 12 }, (_, i) => {
    const labels = ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
    return {
      period: labels[i] + (i < 7 ? '-24' : '-25'),
      newBusiness: 4200 + Math.round(Math.random() * 800),
      renewals: 12500 + Math.round(Math.random() * 1500),
      totalInForce: 148000 + i * 2200,
    };
  });

  // Subsidiary P&L matrix (heat map)
  const matrixRows = consolidated.subsidiaryBreakdown.map((s) => ({
    subsidiary: s.code,
    gwp: s.gwp,
    pat: s.pat,
    roe: s.roe,
    combined_ratio: s.combinedRatio,
    headcount: s.headcount,
    ytd_vs_budget: s.ytdVsBudgetPct,
    _budgetPct: s.ytdVsBudgetPct,
  }));

  const expenseData = [
    { period: 'Jan-25', acquisition: 4_200_000_000, management: 6_800_000_000, riCommission: -2_100_000_000 },
    { period: 'Feb-25', acquisition: 4_500_000_000, management: 7_100_000_000, riCommission: -2_300_000_000 },
    { period: 'Mar-25', acquisition: 4_800_000_000, management: 7_400_000_000, riCommission: -2_500_000_000 },
    { period: 'Apr-25', acquisition: 5_100_000_000, management: 7_800_000_000, riCommission: -2_700_000_000 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Profitability Analytics</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Group profitability intelligence · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Group GWP" value={consolidated.groupGWP} formatter={formatVal} icon={BarChart2} change={14.2} changeLabel="vs prior year" />
        <KPICard title="Group PAT" value={consolidated.groupPAT} formatter={formatVal} icon={TrendingUp} change={18.5} changeLabel="vs prior year" />
        <KPICard title="Group ROE" value={consolidated.groupROE} formatter={pct} icon={Target}
          ragStatus={consolidated.groupROE >= 15 ? 'Green' : consolidated.groupROE >= 10 ? 'Amber' : 'Red'} subtitle="Target ≥ 15%" />
        <KPICard title="Group Loss Ratio" value={consolidated.groupLossRatio} formatter={pct} icon={Users}
          ragStatus={consolidated.groupLossRatio < 65 ? 'Green' : consolidated.groupLossRatio < 75 ? 'Amber' : 'Red'} />
      </div>

      {/* Subsidiary heat map */}
      <SectionCard title="Subsidiary P&L Performance Matrix" subtitle="Colour intensity = performance vs budget target">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Subsidiary', 'GWP', 'PAT', 'ROE', 'Combined Ratio', 'Headcount', 'YTD vs Budget'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {matrixRows.map((row) => (
                <tr key={row.subsidiary} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-lw-gold font-mono">{row.subsidiary}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{bn(row.gwp)}</td>
                  <td className="px-4 py-3 font-mono text-lw-green">{bn(row.pat)}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: row.roe >= 15 ? '#00A86B' : '#F59E0B' }}>{pct(row.roe)}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: row.combined_ratio < 100 ? '#00A86B' : '#DC2626' }}>{pct(row.combined_ratio)}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{row.headcount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-lw-darkBorder rounded-full h-2 max-w-[80px]">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: Math.min(row.ytd_vs_budget, 120) + '%',
                            background: heatColor(row.ytd_vs_budget),
                          }}
                        />
                      </div>
                      <span className="font-mono text-lw-darkText w-12 text-right">{pct(row.ytd_vs_budget)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* LOB profitability + Channel mix */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Profitability by Line of Business" subtitle="GWP → Claims → Expenses → Underwriting Result">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={LOB_DATA} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="lob" tick={{ fontSize: 9, fill: '#7A92B0' }} width={90} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="gwp" name="GWP" fill="#C8102E" radius={[0, 3, 3, 0]} />
              <Bar dataKey="claims" name="Claims" fill="#DC2626" radius={[0, 3, 3, 0]} fillOpacity={0.7} />
              <Bar dataKey="result" name="UW Result" fill="#00A86B" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Channel Mix & Profitability" subtitle="GWP split by distribution channel with margin">
          <div className="space-y-3">
            {CHANNEL_DATA.map((c) => (
              <div key={c.channel} className="flex items-center gap-3">
                <span className="text-xs text-lw-darkMuted w-28 flex-shrink-0">{c.channel}</span>
                <div className="flex-1 bg-lw-darkBorder rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all bg-lw-red"
                    style={{ width: c.pct + '%' }}
                  />
                </div>
                <span className="text-xs font-mono text-lw-darkText w-8 text-right">{c.pct}%</span>
                <span className="text-xs font-mono w-16 text-right" style={{ color: c.margin > 15 ? '#00A86B' : '#F59E0B' }}>
                  {pct(c.margin)} margin
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-lw-darkBorder">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={CHANNEL_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
                <XAxis dataKey="channel" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={pct} axisLine={false} tickLine={false} domain={[0, 30]} />
                <Tooltip formatter={(v: number) => [pct(v), 'Margin']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
                <Bar dataKey="margin" name="Profit Margin %" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Expense ratio + Policy trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Expense Ratio Decomposition" subtitle="Acquisition + Management − RI Commission = Net Expense Ratio">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expenseData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="acquisition" name="Acquisition Cost" stackId="exp" fill="#C8102E" />
              <Bar dataKey="management" name="Management Expense" stackId="exp" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="riCommission" name="RI Commission Income" stackId="exp" fill="#00A86B" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Policy Count Trend" subtitle="New business, renewals, and total in-force">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={policyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar yAxisId="left" dataKey="newBusiness" name="New Business" stackId="policies" fill="#C8102E" />
              <Bar yAxisId="left" dataKey="renewals" name="Renewals" stackId="policies" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="totalInForce" name="Total In-Force" stroke="#00A86B" strokeWidth={2} dot={false} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
};

export default ProfitabilityAnalytics;
