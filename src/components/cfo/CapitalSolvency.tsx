import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, Legend,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { RAGBadge } from '../common/RAGBadge';
import { GaugeChart } from '../common/GaugeChart';
import { useFilterStore } from '../../store/filterStore';
import { getCapitalSummary } from '../../services/capitalService';
import { Shield, TrendingUp, DollarSign, Target } from 'lucide-react';

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
          {p.name}: {typeof p.value === 'number' && Math.abs(p.value) > 1e6 ? bn(p.value) : p.value?.toFixed?.(1) + '%'}
        </p>
      ))}
    </div>
  );
};

const CapitalSolvency: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getCapitalSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency]
  );

  const formatVal = (v: number) =>
    currency === 'USD' ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn' : bn(v);

  // Summary table rows for export
  const summaryTableRows = data.entities.map((e) => ({
    entity: e.subsidiaryCode,
    paid_up_capital: e.paidUpCapital,
    naicom_minimum: e.naicomMinimum,
    headroom: e.headroom,
    solvency_ratio: e.solvencyMarginRatio,
    tsf: e.totalShareholdersFunds,
    solvency_status: e.ragSolvency,
    capital_status: e.ragMinCapital,
  })) as Record<string, unknown>[];

  // ROE trend (mock 12 months)
  const roeTrend = [
    { period: 'May-24', roe: 14.2 }, { period: 'Jun-24', roe: 15.1 },
    { period: 'Jul-24', roe: 13.8 }, { period: 'Aug-24', roe: 16.2 },
    { period: 'Sep-24', roe: 15.5 }, { period: 'Oct-24', roe: 14.9 },
    { period: 'Nov-24', roe: 17.1 }, { period: 'Dec-24', roe: 18.3 },
    { period: 'Jan-25', roe: 16.8 }, { period: 'Feb-25', roe: 17.5 },
    { period: 'Mar-25', roe: 18.2 }, { period: 'Apr-25', roe: 17.9 },
  ];

  // Capital vs minimum bar data
  const capitalBarData = data.entities.map((e) => ({
    name: e.subsidiaryCode,
    actual: e.paidUpCapital,
    minimum: e.naicomMinimum,
    headroom: e.headroom,
  }));

  // TSF decomposition (mock)
  const tsfData = data.entities.map((e) => ({
    name: e.subsidiaryCode,
    paidUp: e.paidUpCapital,
    sharePremiun: e.paidUpCapital * 0.15,
    retainedEarnings: e.totalShareholdersFunds * 0.45,
    otherReserves: e.totalShareholdersFunds * 0.1,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Capital & Solvency</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Regulatory capital compliance · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard
          title="Consolidated Solvency Margin"
          value={data.consolidatedSolvencyRatio}
          formatter={pct}
          ragStatus={data.consolidatedSolvencyRatio > 20 ? 'Green' : data.consolidatedSolvencyRatio > 15 ? 'Amber' : 'Red'}
          icon={Shield}
          subtitle="NAICOM minimum: 15%"
        />
        <KPICard
          title="Capital Headroom"
          value={data.consolidatedHeadroom}
          formatter={formatVal}
          icon={Target}
          subtitle="Above NAICOM minimum"
          change={8.2}
          changeLabel="vs Q4 2024"
        />
        <KPICard
          title="Total Shareholders' Funds"
          value={data.consolidatedTSF}
          formatter={formatVal}
          icon={DollarSign}
          change={12.5}
          changeLabel="YoY growth"
        />
        <KPICard
          title="Group ROE (Annualised)"
          value={data.groupROE}
          formatter={pct}
          ragStatus={data.groupROE >= 15 ? 'Green' : data.groupROE >= 10 ? 'Amber' : 'Red'}
          icon={TrendingUp}
          subtitle="Target: ≥ 15%"
        />
        <KPICard
          title="Group ROA"
          value={data.groupROA}
          formatter={pct}
          icon={TrendingUp}
          subtitle="Return on total assets"
        />
      </div>

      {/* Solvency gauges */}
      <SectionCard title="Solvency Margin by Entity" subtitle="NAICOM minimum 15% · Green > 20% · Amber 15–20%">
        <div className="flex flex-wrap items-center justify-around gap-6 py-2">
          {data.entities.map((e) => (
            <div key={e.subsidiaryCode} className="flex flex-col items-center gap-2">
              <GaugeChart
                value={e.solvencyMarginRatio}
                min={0}
                max={40}
                greenThreshold={20}
                amberThreshold={15}
                label={e.subsidiaryCode}
                unit="%"
                rag={e.ragSolvency}
                size={150}
              />
              <RAGBadge status={e.ragSolvency} size="sm" />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Capital compliance + TSF decomposition */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Minimum Capital Compliance" subtitle="Actual paid-up capital vs NAICOM minimum">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={capitalBarData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="actual" name="Paid-Up Capital" fill="#C8102E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="minimum" name="NAICOM Minimum" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Shareholders' Funds Decomposition" subtitle="Capital structure by entity">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tsfData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="paidUp" name="Paid-Up Capital" stackId="tsf" fill="#C8102E" />
              <Bar dataKey="sharePremiun" name="Share Premium" stackId="tsf" fill="#C9A84C" />
              <Bar dataKey="retainedEarnings" name="Retained Earnings" stackId="tsf" fill="#00A86B" />
              <Bar dataKey="otherReserves" name="Other Reserves" stackId="tsf" fill="#7A92B0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ROE trend */}
      <SectionCard title="ROE Trend — 12 Month Rolling" subtitle="Return on equity vs 15% strategic target">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={roeTrend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={pct} axisLine={false} tickLine={false} domain={[8, 22]} />
            <Tooltip formatter={(v: number) => [pct(v), 'ROE']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine y={15} stroke="#C9A84C" strokeDasharray="5 5" label={{ value: '15% target', fill: '#C9A84C', fontSize: 10 }} />
            <Line type="monotone" dataKey="roe" name="ROE" stroke="#C8102E" strokeWidth={2} dot={{ r: 3, fill: '#C8102E' }} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Capital compliance summary table */}
      <SectionCard
        title="Capital Compliance Summary"
        subtitle="Entity-level regulatory capital status"
        printable
        tableContent={<DataTable rows={summaryTableRows} filename="capital_compliance" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Entity', 'Paid-Up Capital', 'NAICOM Minimum', 'Headroom', 'Solvency Ratio', 'Capital Status', 'Solvency Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {data.entities.map((e) => (
                <tr key={e.subsidiaryCode} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-lw-gold font-mono">{e.subsidiaryCode}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{bn(e.paidUpCapital)}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkMuted">{bn(e.naicomMinimum)}</td>
                  <td className="px-4 py-3 font-mono text-lw-green">{bn(e.headroom)}</td>
                  <td className="px-4 py-3 font-mono text-lw-darkText">{pct(e.solvencyMarginRatio)}</td>
                  <td className="px-4 py-3"><RAGBadge status={e.ragMinCapital} size="sm" /></td>
                  <td className="px-4 py-3"><RAGBadge status={e.ragSolvency} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default CapitalSolvency;
