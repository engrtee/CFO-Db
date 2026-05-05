import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, Legend,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { RAGBadge } from '../common/RAGBadge';
import { useFilterStore } from '../../store/filterStore';
import { getClaimsSummary } from '../../services/claimsService';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, Clock, Shield, Activity } from 'lucide-react';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

// 24-month loss ratio trend by LOB (mock)
const LOSS_RATIO_TREND = [
  { period: 'May-23', motor: 62, fire: 45, life: 52, health: 72 },
  { period: 'Aug-23', motor: 65, fire: 48, life: 54, health: 74 },
  { period: 'Nov-23', motor: 60, fire: 52, life: 51, health: 78 },
  { period: 'Feb-24', motor: 63, fire: 44, life: 55, health: 76 },
  { period: 'May-24', motor: 67, fire: 41, life: 53, health: 79 },
  { period: 'Aug-24', motor: 64, fire: 47, life: 57, health: 81 },
  { period: 'Nov-24', motor: 61, fire: 49, life: 54, health: 77 },
  { period: 'Feb-25', motor: 65, fire: 43, life: 56, health: 80 },
];

const ClaimsIntelligence: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();
  const { canViewTransactionDetail } = useAuthStore();
  const showDetail = canViewTransactionDetail();

  const data = useMemo(
    () => getClaimsSummary({ subsidiaryCode: 'ALL', period, currency }),
    [period, currency]
  );

  const fmtVal = (v: number) =>
    currency === 'USD' ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn' : bn(v);

  // Top 20 claims (masked in CEO view)
  const top20Claims = data.largeLossItems.slice(0, 20).map((c, i) => ({
    rank: i + 1,
    claim_value: c.gross_claim_amount,
    lob: c.line_of_business,
    subsidiary: c.subsidiary_code,
    status: c.claim_status,
    days_open: c.settlement_days ?? 'Open',
    claim_handler: showDetail ? c.claim_handler_id : '[RESTRICTED]',
  })) as Record<string, unknown>[];

  // LOB frequency vs severity
  const lobFvsS = data.claimsByLOB.map((l) => ({
    lob: l.lob.replace(' & ', '/').replace(' Individual', '').replace(' Group', ' Grp'),
    count: l.count,
    avgValue: l.avgValue / 1e6, // ₦m
  }));

  // Settlement cycle vs SLA
  const cycleData = data.settlementCycleByLOB.map((c) => ({
    lob: c.lob.replace(' & ', '/').replace(' Individual', '').replace(' Group', ' Grp'),
    actual: c.avgDays,
    sla: c.slaTarget,
    rag: c.ragStatus,
  }));

  // Litigation stats
  const litigationCount = data.litigationCount;
  const litigationValue = data.largeLossItems
    .filter((c) => c.claim_status === 'Litigation')
    .reduce((s, c) => s + c.gross_claim_amount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Claims Intelligence</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Group consolidated claims analytics · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <KPICard title="Total Claims Incurred (Gross YTD)" value={data.totalGrossClaims} formatter={fmtVal} icon={AlertTriangle} />
        <KPICard title="Net Claims (after RI)" value={data.totalNetClaims} formatter={fmtVal} icon={Shield}
          change={-5.2} changeLabel="vs prior year" isPositiveGood={false} />
        <KPICard title="RI Recovery Rate" value={data.riRecoveryRate} formatter={pct}
          ragStatus={data.riRecoveryRate >= 30 ? 'Green' : data.riRecoveryRate >= 20 ? 'Amber' : 'Red'} />
        <KPICard title="Avg Settlement Time" value={data.avgSettlementDays} formatter={(v) => Math.round(v) + ' days'} icon={Clock}
          ragStatus={data.avgSettlementDays <= 30 ? 'Green' : data.avgSettlementDays <= 60 ? 'Amber' : 'Red'} />
        <KPICard title="Outstanding Reserve (OCR+IBNR)" value={data.reserveAdequacy.reduce((s, r) => s + r.total_reserve, 0)} formatter={fmtVal} />
        <KPICard title="Fraud-Flagged Claims" value={data.fraudItems.length} formatter={(v) => Math.round(v) + ' claims'}
          ragStatus="Amber" subtitle={fmtVal(data.fraudItems.reduce((s, f) => s + f.gross_claim_amount, 0))} />
      </div>

      {/* LOB frequency/severity + Settlement cycle */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Claims by Line of Business" subtitle="Frequency (count) left axis · Severity (avg ₦m) right axis">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={lobFvsS} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
              <XAxis dataKey="lob" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="count" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="severity" orientation="right" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} tickFormatter={(v) => '₦' + v + 'm'} />
              <Tooltip contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar yAxisId="count" dataKey="count" name="Claims Count" fill="#C8102E" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="severity" dataKey="avgValue" name="Avg Value (₦m)" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Settlement Cycle by LOB vs SLA" subtitle="Actual days vs SLA target — Red = SLA breach">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cycleData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} tickFormatter={(v) => v + 'd'} />
              <YAxis type="category" dataKey="lob" tick={{ fontSize: 9, fill: '#7A92B0' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} formatter={(v: number, n: string) => [v + ' days', n]} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              <Bar dataKey="actual" name="Actual Days">
                {cycleData.map((entry, i) => (
                  <rect key={i} fill={entry.rag === 'Red' ? '#DC2626' : entry.rag === 'Amber' ? '#F59E0B' : '#00A86B'} />
                ))}
              </Bar>
              <Bar dataKey="sla" name="SLA Target" fill="#243654" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* 24-month loss ratio trend */}
      <SectionCard title="Claims Ratio Trend — 24 Month Rolling" subtitle="Loss ratio by key LOB (quarterly)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={LOSS_RATIO_TREND} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={pct} axisLine={false} tickLine={false} domain={[30, 90]} />
            <Tooltip formatter={(v: number) => [pct(v), '']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
            <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="4 2" label={{ value: '70% General limit', fill: '#DC2626', fontSize: 9, position: 'right' }} />
            <Line type="monotone" dataKey="motor" name="Motor" stroke="#C8102E" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fire" name="Fire & Property" stroke="#C9A84C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="life" name="Life" stroke="#00A86B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="health" name="Health" stroke="#F59E0B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Litigation + Top claims */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Litigation Claims" subtitle="Claims in dispute">
          <div className="space-y-4">
            <div className="bg-lw-danger/10 border border-lw-danger/20 rounded-xl p-4">
              <p className="text-xs text-lw-darkMuted mb-1">Claims in Litigation</p>
              <p className="text-3xl font-bold font-mono text-lw-danger">{litigationCount}</p>
            </div>
            <div className="bg-lw-amber/10 border border-lw-amber/20 rounded-xl p-4">
              <p className="text-xs text-lw-darkMuted mb-1">₦ Value in Dispute</p>
              <p className="text-xl font-bold font-mono text-lw-amber">{fmtVal(litigationValue)}</p>
            </div>
            <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl p-4">
              <p className="text-xs text-lw-darkMuted mb-1">% of Total Outstanding</p>
              <p className="text-xl font-bold font-mono text-lw-darkText">
                {data.totalGrossClaims > 0 ? pct(litigationValue / data.totalGrossClaims * 100) : '—'}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Top 20 Large Loss Claims" subtitle={!showDetail ? 'Claim handler IDs restricted in CEO view' : 'Sorted by claim value'} className="xl:col-span-2">
          {!showDetail && (
            <div className="mb-3 px-3 py-2 bg-lw-amber/10 border border-lw-amber/20 rounded-lg text-xs text-lw-amber">
              Individual claim handler identities are restricted to CFO role.
            </div>
          )}
          <DataTable rows={top20Claims} filename="top20_large_loss_claims" columns={['rank', 'claim_value', 'lob', 'subsidiary', 'status', 'days_open']} />
        </SectionCard>
      </div>
    </div>
  );
};

export default ClaimsIntelligence;
