import React, { useMemo } from 'react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, ComposedChart, Legend, Cell,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { useFilterStore } from '../../store/filterStore';
import { getConsolidatedSummary } from '../../services/consolidationService';
import { TrendingUp, Shield, BarChart2, Activity } from 'lucide-react';

const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';
const big = (v: number) => (v / 1e9).toFixed(1) + 'bn';

// 12-month trend data (mock)
const GWP_TREND = [
  { period: 'May-24', gwp: 5_100_000_000, budget: 5_300_000_000, py: 4_450_000_000 },
  { period: 'Jun-24', gwp: 5_400_000_000, budget: 5_300_000_000, py: 4_680_000_000 },
  { period: 'Jul-24', gwp: 5_200_000_000, budget: 5_400_000_000, py: 4_510_000_000 },
  { period: 'Aug-24', gwp: 5_600_000_000, budget: 5_400_000_000, py: 4_820_000_000 },
  { period: 'Sep-24', gwp: 5_900_000_000, budget: 5_500_000_000, py: 5_100_000_000 },
  { period: 'Oct-24', gwp: 6_100_000_000, budget: 5_600_000_000, py: 5_290_000_000 },
  { period: 'Nov-24', gwp: 6_400_000_000, budget: 5_700_000_000, py: 5_530_000_000 },
  { period: 'Dec-24', gwp: 7_200_000_000, budget: 6_000_000_000, py: 6_200_000_000 },
  { period: 'Jan-25', gwp: 5_800_000_000, budget: 5_900_000_000, py: 5_020_000_000 },
  { period: 'Feb-25', gwp: 6_100_000_000, budget: 6_000_000_000, py: 5_280_000_000 },
  { period: 'Mar-25', gwp: 6_500_000_000, budget: 6_200_000_000, py: 5_620_000_000 },
  { period: 'Apr-25', gwp: 6_800_000_000, budget: 6_300_000_000, py: 5_880_000_000 },
];

const PAT_TREND = [
  { period: 'May-24', pat: 820_000_000 },  { period: 'Jun-24', pat: 920_000_000 },
  { period: 'Jul-24', pat: -140_000_000 }, { period: 'Aug-24', pat: 1_050_000_000 },
  { period: 'Sep-24', pat: 980_000_000 },  { period: 'Oct-24', pat: 1_120_000_000 },
  { period: 'Nov-24', pat: 1_280_000_000 },{ period: 'Dec-24', pat: 1_850_000_000 },
  { period: 'Jan-25', pat: 890_000_000 },  { period: 'Feb-25', pat: 1_020_000_000 },
  { period: 'Mar-25', pat: 1_180_000_000 },{ period: 'Apr-25', pat: 1_350_000_000 },
];

const SOLVENCY_TREND = [
  { period: 'May-24', ratio: 21.2 }, { period: 'Jun-24', ratio: 21.8 },
  { period: 'Jul-24', ratio: 20.5 }, { period: 'Aug-24', ratio: 21.5 },
  { period: 'Sep-24', ratio: 22.1 }, { period: 'Oct-24', ratio: 21.9 },
  { period: 'Nov-24', ratio: 22.8 }, { period: 'Dec-24', ratio: 23.2 },
  { period: 'Jan-25', ratio: 22.4 }, { period: 'Feb-25', ratio: 22.8 },
  { period: 'Mar-25', ratio: 23.5 }, { period: 'Apr-25', ratio: 23.1 },
];

const GroupExecutiveSummary: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getConsolidatedSummary(period, currency),
    [period, currency]
  );

  const fmtVal = (v: number) => currency === 'USD'
    ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn'
    : bn(v);

  const solvencyRag = data.groupSolvencyRatio > 20 ? 'Green' : data.groupSolvencyRatio > 15 ? 'Amber' : 'Red';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-lw-darkText font-serif">Group Executive Summary</h1>
          <p className="text-xs text-lw-darkMuted mt-0.5">Leadway Assurance Group consolidated · {period}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-lw-darkMuted">
          <span className="px-2 py-1 bg-lw-amber/10 border border-lw-amber/30 rounded-lg text-lw-amber font-semibold">
            Market Share: ~18% · Q1 2025 estimate
          </span>
        </div>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Group GWP (YTD)" value={data.groupGWP} formatter={fmtVal} icon={BarChart2}
          change={14.2} changeLabel="vs budget" ragStatus="Green" />
        <KPICard title="Group PAT (YTD)" value={data.groupPAT} formatter={fmtVal} icon={TrendingUp}
          change={18.5} changeLabel="vs budget" ragStatus="Green" />
        <KPICard title="Group ROE (Annualised)" value={data.groupROE} formatter={pct} icon={Activity}
          ragStatus={data.groupROE >= 15 ? 'Green' : 'Amber'} subtitle="Target: ≥ 15%" />
        <KPICard title="Solvency Margin (Group)" value={data.groupSolvencyRatio} formatter={pct} icon={Shield}
          ragStatus={solvencyRag} subtitle="NAICOM min: 15%" />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <KPICard title="Net Claims Ratio" value={data.groupLossRatio} formatter={pct}
          ragStatus={data.groupLossRatio < 65 ? 'Green' : data.groupLossRatio < 75 ? 'Amber' : 'Red'} />
        <KPICard title="Total AUM" value={data.groupAUM} formatter={fmtVal} />
        <KPICard title="Total Shareholders' Funds" value={data.groupTSF} formatter={fmtVal} change={12.5} changeLabel="YoY" />
        <KPICard title="Consolidated Cash" value={data.groupCash} formatter={fmtVal} change={5.8} changeLabel="vs last month" />
        <KPICard title="Total Active Policies" value={162_450} formatter={(v) => Math.round(v).toLocaleString()} subtitle="+2,840 MoM" />
        <KPICard title="Group NEP" value={data.groupNEP} formatter={fmtVal} change={11.2} changeLabel="vs budget" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="GWP vs Budget vs Prior Year" subtitle="12-month trend" className="xl:col-span-2" printable>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={GWP_TREND} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={(v) => '₦' + big(v)} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                formatter={(v: number, name: string) => [bn(v), name]}
                contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="gwp" name="GWP Actual" fill="#C8102E" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="budget" name="Budget" stroke="#C9A84C" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="py" name="Prior Year" stroke="#7A92B0" strokeWidth={1.5} strokeDasharray="2 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Group PAT Trend" subtitle="Profitable (green) vs loss (red) months">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PAT_TREND} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={(v) => '₦' + big(v)} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v: number) => [bn(v), 'PAT']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#7A92B0" strokeDasharray="3 3" />
              <Bar dataKey="pat" name="PAT" radius={[4, 4, 0, 0]}>
                {PAT_TREND.map((entry, i) => (
                  <Cell key={i} fill={entry.pat >= 0 ? '#00A86B' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Solvency margin trend */}
      <SectionCard title="Solvency Margin Trend" subtitle="12-month rolling · NAICOM minimum 15%">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={SOLVENCY_TREND} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={pct} axisLine={false} tickLine={false} domain={[10, 28]} />
            <Tooltip formatter={(v: number) => [pct(v), 'Solvency Ratio']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
            <ReferenceLine y={15} stroke="#DC2626" strokeDasharray="4 2" label={{ value: '15% NAICOM min', fill: '#DC2626', fontSize: 9, position: 'right' }} />
            <ReferenceLine y={20} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: '20% amber', fill: '#F59E0B', fontSize: 9, position: 'right' }} />
            <Line type="monotone" dataKey="ratio" name="Solvency Ratio" stroke="#00A86B" strokeWidth={2.5} dot={{ r: 3, fill: '#00A86B' }} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
};

export default GroupExecutiveSummary;
