import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart, Line,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { useFilterStore } from '../../store/filterStore';
import { getPremiumSummary } from '../../services/premiumService';
import { useAuthStore } from '../../store/authStore';
import { customerMaster } from '../../data/customer_master';
import { brokerMaster } from '../../data/broker_master';
import { TrendingUp, RefreshCw, Activity } from 'lucide-react';

const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

const DONUT_COLORS = ['#C8102E', '#C9A84C', '#00A86B', '#7A92B0', '#F59E0B'];

const PremiumIntelligence: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();
  const { canViewTransactionDetail } = useAuthStore();
  const showDetail = canViewTransactionDetail();

  const data = useMemo(
    () => getPremiumSummary({ subsidiaryCode: 'ALL', period, currency }),
    [period, currency]
  );

  const fmtVal = (v: number) =>
    currency === 'USD' ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn' : bn(v);

  // Top 20 customers
  const top20Rows = customerMaster
    .sort((a, b) => b.total_gwp_ytd - a.total_gwp_ytd)
    .slice(0, 20)
    .map((c, i) => ({
      rank: i + 1,
      client_name: showDetail ? c.customer_name : '[RESTRICTED]',
      sector: c.sector,
      policy_type: 'Multi-line',
      subsidiary: c.primary_subsidiary,
      gwp_ytd: c.total_gwp_ytd,
      status: c.renewal_status,
    })) as Record<string, unknown>[];

  // Top 10 brokers
  const top10Brokers = brokerMaster
    .sort((a, b) => b.gwp_ytd - a.gwp_ytd)
    .slice(0, 10);

  // LOB bar
  const lobBarData = data.gwpByLOB.map((l) => ({ lob: l.lob.replace(' & ', '/').replace(' Individual', '').replace(' Group', ' Grp'), value: l.value }));

  // New vs renewal trend
  const trendData = data.monthlyTrend;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Premium Intelligence</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Group GWP analytics by channel, LOB, and client · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard title="Total GWP (YTD)" value={data.totalGWP} formatter={fmtVal} icon={TrendingUp} change={14.2} changeLabel="vs budget" />
        <KPICard title="New Business GWP" value={data.newBusinessGWP} formatter={fmtVal} change={22.5} changeLabel="vs prior year" />
        <KPICard title="Renewal GWP" value={data.renewalGWP} formatter={fmtVal} change={8.1} changeLabel="vs prior year" />
        <KPICard title="Renewal Retention Rate" value={data.renewalRetentionRate} formatter={pct} icon={RefreshCw}
          ragStatus={data.renewalRetentionRate >= 85 ? 'Green' : data.renewalRetentionRate >= 75 ? 'Amber' : 'Red'}
          subtitle="Target: ≥ 85%" />
        <KPICard title="Collection Efficiency" value={data.collectionEfficiency} formatter={pct} icon={Activity}
          ragStatus={data.collectionEfficiency >= 90 ? 'Green' : data.collectionEfficiency >= 80 ? 'Amber' : 'Red'} />
      </div>

      {/* Channel donut + LOB bar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="GWP by Distribution Channel" subtitle="Premium split and channel mix">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={200}>
              <PieChart>
                <Pie data={data.gwpByChannel as unknown as { name: string; value: number }[]} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" animationDuration={800}>
                  {data.gwpByChannel.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [fmtVal(v), name]} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.gwpByChannel.map((c, i) => (
                <div key={c.channel} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-xs text-lw-darkText flex-1">{c.channel}</span>
                  <span className="text-xs font-mono text-lw-darkMuted">{fmtVal(c.value)}</span>
                  <span className="text-xs font-mono text-lw-gold w-10 text-right">{pct(c.pct)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="GWP by Line of Business" subtitle="Horizontal bar by LOB — YTD">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={lobBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={fmtVal} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="lob" tick={{ fontSize: 9, fill: '#7A92B0' }} width={75} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [fmtVal(v), 'GWP']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <Bar dataKey="value" fill="#C8102E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* New business vs renewals trend */}
      <SectionCard title="New Business vs Renewals — 12 Month Trend" subtitle="Stacked premium by type">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={fmtVal} axisLine={false} tickLine={false} width={65} />
            <Tooltip formatter={(v: number, n: string) => [fmtVal(v), n]} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
            <Bar dataKey="newBusiness" name="New Business" stackId="gwp" fill="#C8102E" />
            <Bar dataKey="renewals" name="Renewals" stackId="gwp" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="total" name="Total GWP" stroke="#00A86B" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Top 20 premium clients */}
      <SectionCard title="Top 20 Premium Clients (YTD)" subtitle={!showDetail ? 'Client names restricted in CEO view' : 'Sorted by GWP descending'}>
        {!showDetail && (
          <div className="mb-3 px-3 py-2 bg-lw-amber/10 border border-lw-amber/20 rounded-lg text-xs text-lw-amber">
            Client counterparty identities are restricted to CFO role. Showing aggregate values only.
          </div>
        )}
        <DataTable rows={top20Rows} filename="top20_premium_clients" columns={['rank', 'client_name', 'sector', 'subsidiary', 'gwp_ytd', 'status']} />
      </SectionCard>

      {/* Top 10 brokers */}
      <SectionCard title="Top 10 Brokers by GWP" subtitle="YTD premium production with year-on-year growth">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Broker Name', 'GWP YTD', '% of Total', 'YoY Growth', 'Tier'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {top10Brokers.map((b) => {
                const yoy = ((b.gwp_ytd - b.gwp_prior_year) / b.gwp_prior_year) * 100;
                const totalGWP = data.totalGWP;
                return (
                  <tr key={b.broker_id} className="hover:bg-lw-red/5 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-lw-darkText">{b.broker_name}</td>
                    <td className="px-4 py-2.5 font-mono text-lw-darkText">{fmtVal(b.gwp_ytd)}</td>
                    <td className="px-4 py-2.5 font-mono text-lw-darkMuted">{pct(b.gwp_ytd / totalGWP * 100)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`flex items-center gap-1 font-mono font-semibold ${yoy >= 0 ? 'text-lw-green' : 'text-lw-danger'}`}>
                        {yoy >= 0 ? '↑' : '↓'} {Math.abs(yoy).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-lw-darkMuted">{b.broker_tier}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default PremiumIntelligence;
