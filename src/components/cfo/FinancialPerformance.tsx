/**
 * FinancialPerformance.tsx
 * CFO Module 1 — Financial Performance
 * Leadway Assurance Executive Dashboard
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { WaterfallChart } from '../common/WaterfallChart';
import { useFilterStore } from '../../store/filterStore';
import { getFinancialSummary } from '../../services/financialService';

// ─── Formatters ───────────────────────────────────────────────────────────────
const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

// ─── Tooltip types ────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
const GWPTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-lw-darkText mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-lw-darkMuted">{p.name}:</span>
          <span className="font-mono text-lw-gold">{bn(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const LossRatioTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-lw-darkText mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-lw-darkMuted">Loss Ratio:</span>
          <span className="font-mono text-lw-gold">{p.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── LOB Loss Ratio data (hardcoded as per spec) ──────────────────────────────
interface LOBRow {
  lob: string;
  lossRatio: number;
  isLife: boolean;
}

const LOB_DATA: LOBRow[] = [
  { lob: 'Motor',          lossRatio: 68, isLife: false },
  { lob: 'Marine',         lossRatio: 55, isLife: false },
  { lob: 'Fire',           lossRatio: 61, isLife: false },
  { lob: 'Engineering',    lossRatio: 52, isLife: false },
  { lob: 'Oil & Gas',      lossRatio: 74, isLife: false },
  { lob: 'Life Individual',lossRatio: 55, isLife: true  },
  { lob: 'Life Group',     lossRatio: 48, isLife: true  },
  { lob: 'Health',         lossRatio: 79, isLife: true  },
];

function getLobRag(row: LOBRow): string {
  const threshold = row.isLife ? 80 : 70;
  if (row.lossRatio >= threshold)   return '#DC2626'; // Red
  if (row.lossRatio >= threshold - 10) return '#F59E0B'; // Amber
  return '#00A86B'; // Green
}

// ─── Component ────────────────────────────────────────────────────────────────
const FinancialPerformanceInner: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getFinancialSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency],
  );

  // Build P&L waterfall data
  const waterfallData = useMemo(() => [
    { label: 'GWP',               value: data.gwp,               isTotal: false },
    { label: 'Reinsurance Ceded', value: -data.reinsuranceCeded, isTotal: false },
    { label: 'Net Earned Premium',value: data.nep,               isTotal: true  },
    { label: 'Claims Incurred',   value: -data.claimsIncurred,   isTotal: false },
    { label: 'Expenses',          value: -data.managementExpenses,isTotal: false },
    { label: 'Underwriting Result',value: data.underwritingProfit,isTotal: true  },
    { label: 'Investment Income', value: data.investmentIncome,  isTotal: false },
    { label: 'Other Income',      value: 0,                      isTotal: false },
    { label: 'PBT',               value: data.pbt,               isTotal: true  },
    { label: 'Tax',               value: -data.tax,              isTotal: false },
    { label: 'PAT',               value: data.pat,               isTotal: true  },
  ], [data]);

  // Monthly trend for GWP chart
  const trendChartData = data.monthlyTrend.map((pt) => ({
    period: pt.period.slice(-5), // e.g. "01-25"
    gwp: pt.gwp,
    nep: pt.nep,
    claims: pt.claims,
    pat: pt.pat,
  }));

  // P&L variance table rows typed for DataTable
  type VarianceRow = Record<string, unknown>;
  const varianceRows: VarianceRow[] = data.plVarianceTable.map((r) => ({
    account:     r.account,
    actual:      r.actual,
    budget:      r.budget,
    varianceNgn: r.varianceNgn,
    variancePct: r.variancePct,
    priorYear:   r.priorYear,
    yoyPct:      r.yoyPct,
    rag:         r.rag,
  }));

  const getVarianceRowClass = (row: VarianceRow): string => {
    const v = row.varianceNgn as number;
    return v < 0 ? 'text-lw-danger' : '';
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Written Premium"
          value={data.gwp}
          formatter={bn}
          change={data.budgetVariancePct}
          changeLabel="vs budget"
        />
        <KPICard
          title="Net Earned Premium"
          value={data.nep}
          formatter={bn}
        />
        <KPICard
          title="Net Claims Incurred"
          value={data.claimsIncurred}
          formatter={bn}
          isPositiveGood={false}
        />
        <KPICard
          title="Loss Ratio"
          value={data.lossRatio}
          formatter={pct}
          ragStatus={data.ragLossRatio}
          isPositiveGood={false}
        />
        <KPICard
          title="Combined Ratio"
          value={data.combinedRatio}
          formatter={pct}
          ragStatus={data.ragCombinedRatio}
          isPositiveGood={false}
        />
        <KPICard
          title="Underwriting P&L"
          value={data.underwritingProfit}
          formatter={bn}
        />
        <KPICard
          title="Investment Income"
          value={data.investmentIncome}
          formatter={bn}
        />
        <KPICard
          title="PAT"
          value={data.pat}
          formatter={bn}
        />
      </div>

      {/* ── Charts Row 1 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* GWP Trend */}
        <SectionCard title="GWP Trend — 12 Month" subtitle="Gross Written Premium vs Prior Year">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: '#7A92B0' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7A92B0' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '₦' + (v / 1e9).toFixed(0) + 'bn'}
                width={60}
              />
              <Tooltip content={<GWPTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#7A92B0', paddingTop: 8 }}
              />
              <ReferenceLine
                y={data.budgetGwp / (data.monthlyTrend.length || 1)}
                stroke="#C9A84C"
                strokeDasharray="6 3"
                label={{ value: 'Budget', fill: '#C9A84C', fontSize: 10 }}
              />
              <Bar dataKey="gwp" name="GWP" fill="#C8102E" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Line
                dataKey="pat"
                name="Prior Year GWP (indicative)"
                stroke="#7A92B0"
                strokeDasharray="4 2"
                dot={false}
                type="monotone"
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* P&L Waterfall */}
        <SectionCard title="P&L Waterfall" subtitle="GWP through to PAT">
          <WaterfallChart data={waterfallData} height={280} unit="₦" divisor={1e9} />
        </SectionCard>
      </div>

      {/* ── Charts Row 2 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Loss Ratio by LOB */}
        <SectionCard
          title="Loss Ratio by Line of Business"
          subtitle="NAICOM thresholds: General 70% | Life 80%"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={LOB_DATA}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#7A92B0' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v + '%'}
              />
              <YAxis
                type="category"
                dataKey="lob"
                tick={{ fontSize: 10, fill: '#7A92B0' }}
                axisLine={false}
                tickLine={false}
                width={95}
              />
              <Tooltip content={<LossRatioTooltip />} />
              <ReferenceLine
                x={70}
                stroke="#F59E0B"
                strokeDasharray="4 2"
                label={{ value: '70% General', fill: '#F59E0B', fontSize: 9, position: 'top' }}
              />
              <ReferenceLine
                x={80}
                stroke="#DC2626"
                strokeDasharray="4 2"
                label={{ value: '80% Life', fill: '#DC2626', fontSize: 9, position: 'top' }}
              />
              <Bar dataKey="lossRatio" name="Loss Ratio" radius={[0, 3, 3, 0]}>
                {LOB_DATA.map((entry, index) => (
                  <Cell key={index} fill={getLobRag(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* P&L Variance Table */}
        <SectionCard
          title="P&L Variance Analysis"
          subtitle="Actual vs Budget vs Prior Year"
        >
          <DataTable
            rows={varianceRows}
            columns={['account', 'actual', 'budget', 'varianceNgn', 'variancePct', 'priorYear', 'yoyPct']}
            filename="pl_variance"
            getRowClass={getVarianceRowClass}
          />
        </SectionCard>
      </div>
    </div>
  );
};

// ─── Export with error boundary ───────────────────────────────────────────────
const FinancialPerformance: React.FC = () => {
  try {
    return <FinancialPerformanceInner />;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return (
      <div className="bg-lw-darkCard border border-lw-danger rounded-2xl p-8 text-center">
        <p className="text-lw-danger font-semibold text-sm">Financial Performance module failed to load</p>
        <p className="text-lw-darkMuted text-xs mt-2">{message}</p>
      </div>
    );
  }
};

export default FinancialPerformance;
