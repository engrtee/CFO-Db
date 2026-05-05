/**
 * InvestmentPortfolio.tsx
 * CFO Module 2 — Investment Portfolio
 * Leadway Assurance Executive Dashboard
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { GaugeChart } from '../common/GaugeChart';
import { useFilterStore } from '../../store/filterStore';
import { getInvestmentSummary } from '../../services/investmentService';
import type { RAGStatus } from '../../types/subsidiary.types';

// ─── Formatters ───────────────────────────────────────────────────────────────
const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

// ─── Tooltip type ─────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

// ─── Asset class colours ──────────────────────────────────────────────────────
const ASSET_COLORS: Record<string, string> = {
  FGS:           '#00A86B',
  StateBond:     '#C9A84C',
  CorporateBond: '#60A5FA',
  Equity:        '#F59E0B',
  MMI:           '#A78BFA',
  RealEstate:    '#FB923C',
  Offshore:      '#EC4899',
};

const FALLBACK_COLORS = [
  '#00A86B', '#C9A84C', '#60A5FA', '#F59E0B',
  '#A78BFA', '#FB923C', '#EC4899', '#34D399',
];

// ─── Maturity bucket gradient colours ────────────────────────────────────────
const MATURITY_COLORS = [
  '#C9A84C', '#F59E0B', '#FB923C', '#EF4444', '#DC2626', '#B91C1C',
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const InvestmentTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
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

const PieTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-lw-darkText mb-1">{item.name}</p>
      <p className="font-mono text-lw-gold">{bn(item.value)}</p>
    </div>
  );
};

// ─── Donut label renderer ─────────────────────────────────────────────────────
interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
}

const renderDonutLabel = ({
  cx, cy, midAngle, outerRadius, name, percent,
}: PieLabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.04) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#7A92B0"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={9}
    >
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const InvestmentPortfolioInner: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getInvestmentSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency],
  );

  // Build pie data from byAssetClass
  const pieData = useMemo(
    () =>
      Object.entries(data.byAssetClass).map(([name, value]) => ({ name, value })),
    [data.byAssetClass],
  );

  const totalAUM = data.totalAUM;

  // RAG for AUM card — based on prescribedAssetRatio
  const aumRag: RAGStatus = data.ragPrescribedAssets;

  // Typed rows for DataTable
  type HoldingRow = Record<string, unknown>;
  const holdingRows: HoldingRow[] = data.top10Holdings.map((h) => ({
    issuer_name:           h.issuer_name,
    instrument_type:       h.instrument_type,
    face_value:            h.face_value,
    current_market_value:  h.current_market_value,
    unrealised_gain_loss:  h.unrealised_gain_loss,
    yield_to_maturity:     h.yield_to_maturity,
    maturity_date:         h.maturity_date,
    prescribed_asset_flag: h.prescribed_asset_flag,
    subsidiary_code:       h.subsidiary_code,
  }));

  const getHoldingRowClass = (row: HoldingRow): string => {
    const issuer = row.issuer_name as string;
    return data.concentrationFlags.includes(issuer) ? 'text-lw-amber' : '';
  };

  // Maturity ladder chart data
  const maturityChartData = data.maturityLadder.map((b, i) => ({
    bucket: b.bucket,
    value: b.value,
    fill: MATURITY_COLORS[i] ?? MATURITY_COLORS[MATURITY_COLORS.length - 1],
  }));

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total AUM"
          value={totalAUM}
          formatter={bn}
          ragStatus={aumRag}
        />
        <KPICard
          title="Prescribed Assets Ratio"
          value={data.prescribedAssetRatio}
          formatter={pct}
          ragStatus={data.ragPrescribedAssets}
          subtitle="NAICOM min 50%"
        />
        <KPICard
          title="Portfolio Yield"
          value={data.portfolioYield}
          formatter={pct}
          subtitle="Annualised"
        />
        <KPICard
          title="Unrealised G/L"
          value={data.unrealisedGainLoss}
          formatter={bn}
          isPositiveGood={true}
        />
        <KPICard
          title="ALM Duration Gap"
          value={data.durationGap}
          formatter={(v) => v.toFixed(2) + 'yrs'}
          subtitle="Asset minus liability duration"
        />
      </div>

      {/* ── Charts Row 1 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Asset Allocation Donut */}
        <SectionCard
          title="Asset Allocation"
          subtitle={`Total AUM: ${bn(totalAUM)}`}
        >
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderDonutLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={ASSET_COLORS[entry.name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#E8EDF5"
                  fontSize={13}
                  fontWeight="bold"
                  fontFamily="IBM Plex Mono"
                >
                  {bn(totalAUM)}
                </text>
                <text
                  x="50%"
                  y="54%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#7A92B0"
                  fontSize={9}
                  fontFamily="DM Sans"
                >
                  Total AUM
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* NAICOM Prescribed Asset Gauge */}
        <SectionCard
          title="NAICOM Prescribed Asset Compliance"
          subtitle="Legal minimum: 50% (NAICOM Guideline 2019, s.4.1)"
        >
          <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
            <GaugeChart
              value={data.prescribedAssetRatio}
              min={0}
              max={100}
              greenThreshold={60}
              amberThreshold={50}
              label="Prescribed Assets"
              unit="%"
              rag={data.ragPrescribedAssets}
              size={220}
            />
            <div className="text-center space-y-1">
              <p className="text-xs text-lw-darkMuted">
                Legal minimum: <span className="text-lw-amber font-semibold">50%</span> (NAICOM Guideline 2019, s.4.1)
              </p>
              <p className="text-xs text-lw-darkMuted">
                Actual: <span className="font-mono text-lw-gold">{pct(data.prescribedAssetRatio)}</span>
                &nbsp;|&nbsp; Status:{' '}
                <span className={
                  data.ragPrescribedAssets === 'Red' ? 'text-lw-danger' :
                  data.ragPrescribedAssets === 'Amber' ? 'text-lw-amber' :
                  'text-lw-green'
                }>
                  {data.ragPrescribedAssets}
                </span>
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Charts Row 2 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Maturity Ladder */}
        <SectionCard
          title="Maturity Ladder"
          subtitle="Fixed income securities by time to maturity"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={maturityChartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 11, fill: '#7A92B0' }}
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
              <Tooltip content={<InvestmentTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#7A92B0', paddingTop: 8 }} />
              <Bar dataKey="value" name="Face Value (₦bn)" radius={[4, 4, 0, 0]}>
                {maturityChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Top 10 Holdings Table */}
        <SectionCard
          title="Top 10 Holdings"
          subtitle="By current market value — amber rows = concentration flag (>10% of AUM)"
        >
          <DataTable
            rows={holdingRows}
            columns={[
              'issuer_name',
              'instrument_type',
              'face_value',
              'current_market_value',
              'unrealised_gain_loss',
              'yield_to_maturity',
              'maturity_date',
              'prescribed_asset_flag',
              'subsidiary_code',
            ]}
            filename="top10_holdings"
            getRowClass={getHoldingRowClass}
          />
        </SectionCard>
      </div>
    </div>
  );
};

// ─── Export with error boundary ───────────────────────────────────────────────
const InvestmentPortfolio: React.FC = () => {
  try {
    return <InvestmentPortfolioInner />;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return (
      <div className="bg-lw-darkCard border border-lw-danger rounded-2xl p-8 text-center">
        <p className="text-lw-danger font-semibold text-sm">Investment Portfolio module failed to load</p>
        <p className="text-lw-darkMuted text-xs mt-2">{message}</p>
      </div>
    );
  }
};

export default InvestmentPortfolio;
