import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { WaterfallChart } from '../common/WaterfallChart';
import { RAGBadge } from '../common/RAGBadge';
import { useFilterStore } from '../../store/filterStore';
import { getLiquiditySummary } from '../../services/liquidityService';
import { Droplets, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

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
          {p.name}: {bn(p.value)}
        </p>
      ))}
    </div>
  );
};

const LiquidityCashFlow: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getLiquiditySummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency]
  );

  const formatVal = (v: number) =>
    currency === 'USD'
      ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn'
      : bn(v);

  // Build receivables table rows
  const receivablesRows = data.receivablesAging.map((r) => ({
    subsidiary: r.subsidiary,
    '0-30 days': r.aging30,
    '31-60 days': r.aging60,
    '61-90 days': r.aging90,
    '90+ days': r.aging90plus,
    total: r.aging30 + r.aging60 + r.aging90 + r.aging90plus,
  })) as Record<string, unknown>[];

  // Cash position bar data
  const cashBarData = data.cashBySubsidiary.map((s) => ({
    name: s.subsidiary,
    cash: s.cash,
  }));

  // 30/60/90 forecast (simplified)
  const forecastData = [
    { bucket: '0-30 Days', inflows: 45_000_000_000, outflows: 32_000_000_000 },
    { bucket: '31-60 Days', inflows: 38_000_000_000, outflows: 28_000_000_000 },
    { bucket: '61-90 Days', inflows: 42_000_000_000, outflows: 35_000_000_000 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Liquidity & Cash Flow</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Consolidated liquidity position · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Cash (Consolidated)"
          value={data.totalCashNGN}
          formatter={formatVal}
          icon={Droplets}
          change={5.8}
          changeLabel="vs prior month"
        />
        <KPICard
          title="Claims Paying Ability"
          value={data.claimsPayingAbilityRatio}
          formatter={pct}
          ragStatus={data.ragClaimsPayingAbility}
          icon={AlertTriangle}
          subtitle="Target: ≥ 130%"
        />
        <KPICard
          title="Free Cash Flow YTD"
          value={data.freeCashFlowYTD}
          formatter={formatVal}
          icon={TrendingUp}
          change={12.3}
          changeLabel="vs prior year"
        />
        <KPICard
          title="RI Recoveries Outstanding"
          value={data.reinsuranceRecoveriesOutstanding}
          formatter={formatVal}
          icon={Clock}
          subtitle="Recoveries awaited"
        />
        <KPICard
          title="Premium Receivables"
          value={data.premiumReceivables}
          formatter={formatVal}
          icon={AlertTriangle}
          subtitle="Total debtor book"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Cash Position by Subsidiary" subtitle="Current available balances">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cashBarData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#7A92B0' }} width={50} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="cash" name="Cash Balance" fill="#C8102E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Cash Flow Waterfall YTD" subtitle="Opening → Operating → Investing → Financing → Closing">
          <WaterfallChart data={data.cashflowWaterfall} height={240} />
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="30/60/90-Day Cash Forecast" subtitle="Projected inflows vs outflows">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={forecastData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="inflows" name="Projected Inflows" fill="#00A86B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflows" name="Projected Outflows" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Receivables Aging"
          subtitle="Premium debtor book by subsidiary"
          tableContent={<DataTable rows={receivablesRows} filename="receivables_aging" />}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.receivablesAging} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="subsidiary" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={65} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="aging30" name="0-30 days" stackId="aging" fill="#00A86B" />
              <Bar dataKey="aging60" name="31-60 days" stackId="aging" fill="#F59E0B" />
              <Bar dataKey="aging90" name="61-90 days" stackId="aging" fill="#F97316" />
              <Bar dataKey="aging90plus" name="90+ days" stackId="aging" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Intercompany table */}
      <SectionCard title="Intercompany Balances" subtitle="Intra-group positions requiring elimination">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Entity (From)', 'Entity (To)', 'Amount', 'Type', 'Ageing (days)', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-semibold text-lw-darkMuted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {[
                { from: 'LWL', to: 'LWC', amount: 2_500_000_000, type: 'Receivable', ageing: 15, status: 'Pending' },
                { from: 'LWG', to: 'LWH', amount: 800_000_000, type: 'Payable', ageing: 8, status: 'Pending' },
                { from: 'LWT', to: 'LWP', amount: 350_000_000, type: 'Receivable', ageing: 30, status: 'Eliminated' },
                { from: 'LWN', to: 'LWC', amount: 1_200_000_000, type: 'Receivable', ageing: 5, status: 'Pending' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-2.5 text-lw-gold font-mono font-semibold">{row.from}</td>
                  <td className="px-4 py-2.5 text-lw-darkText font-mono">{row.to}</td>
                  <td className="px-4 py-2.5 text-lw-darkText font-mono">{bn(row.amount)}</td>
                  <td className="px-4 py-2.5 text-lw-darkText">{row.type}</td>
                  <td className="px-4 py-2.5 text-lw-darkText font-mono">{row.ageing}</td>
                  <td className="px-4 py-2.5">
                    <RAGBadge status={row.status === 'Eliminated' ? 'Green' : 'Amber'} label={row.status} size="sm" />
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

export default LiquidityCashFlow;
