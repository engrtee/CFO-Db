import React from 'react';
import { SectionCard } from '../SectionCard';
import { KPICard } from '../KPICard';
import { RAGBadge } from '../common/RAGBadge';
import { getRiskSummary } from '../../services/riskService';
import { useFilterStore } from '../../store/filterStore';
import { useMemo } from 'react';
import { Monitor, AlertTriangle, Clock, Users, Shield } from 'lucide-react';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';

const RISK_EVENTS = [
  { id: 'ORE-001', date: '2025-04-18', category: 'IT', description: 'Core insurance platform scheduled maintenance overrun causing 2.1hr downtime', subsidiary: 'LWG', impact: 0, status: 'Closed', root_cause: 'Vendor patch deployment failure' },
  { id: 'ORE-002', date: '2025-03-22', category: 'Process', description: 'Premium ledger reconciliation variance of ₦12m identified in month-end close', subsidiary: 'LWL', impact: 12_000_000, status: 'Closed', root_cause: 'Manual data entry error — controls strengthened' },
  { id: 'ORE-003', date: '2025-02-14', category: 'Fraud', description: 'Suspected staged accident — Motor claim ₦8.5m referred to SIU', subsidiary: 'LWG', impact: 8_500_000, status: 'Open', root_cause: 'Under investigation' },
  { id: 'ORE-004', date: '2025-01-30', category: 'External', description: 'Third-party service provider data breach — customer notification issued', subsidiary: 'LWH', impact: 0, status: 'Closed', root_cause: 'Vendor security controls inadequate — contract terminated' },
  { id: 'ORE-005', date: '2024-12-10', category: 'IT', description: 'Ransomware attempt on endpoint — quarantined before execution', subsidiary: 'LWC', impact: 0, status: 'Closed', root_cause: 'Phishing email — user training initiated' },
  { id: 'ORE-006', date: '2024-11-05', category: 'Process', description: 'Regulatory return filed one day late due to system unavailability', subsidiary: 'LWN', impact: 0, status: 'Closed', root_cause: 'PenCom portal downtime on submission day' },
];

const FRAUD_ALERTS = [
  { claim_id: 'CLM-09821', type: 'Staged Accident', amount: 8_500_000, subsidiary: 'LWG', referral_date: '2025-03-22', siu_status: 'Under Investigation', outcome: 'Pending' },
  { claim_id: 'CLM-07433', type: 'Inflated Repair', amount: 3_200_000, subsidiary: 'LWG', referral_date: '2025-02-10', siu_status: 'Completed', outcome: 'Repudiated' },
  { claim_id: 'CLM-05612', type: 'Duplicate Claim', amount: 6_800_000, subsidiary: 'LWL', referral_date: '2024-12-18', siu_status: 'Completed', outcome: 'Repudiated' },
  { claim_id: 'CLM-04199', type: 'False Death', amount: 45_000_000, subsidiary: 'LWL', referral_date: '2024-10-05', siu_status: 'Referred to Police', outcome: 'Prosecution' },
  { claim_id: 'CLM-03887', type: 'Inflated Repair', amount: 2_100_000, subsidiary: 'LWG', referral_date: '2024-09-14', siu_status: 'Completed', outcome: 'Partial Settlement' },
  { claim_id: 'CLM-02441', type: 'Staged Accident', amount: 5_600_000, subsidiary: 'LWG', referral_date: '2024-08-01', siu_status: 'Completed', outcome: 'Repudiated' },
  { claim_id: 'CLM-01993', type: 'Duplicate Claim', amount: 1_800_000, subsidiary: 'LWH', referral_date: '2024-07-22', siu_status: 'Completed', outcome: 'Repudiated' },
];

const OperationalRisk: React.FC = () => {
  const { subsidiaryCode, currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const data = useMemo(
    () => getRiskSummary({ subsidiaryCode, period, currency }),
    [subsidiaryCode, period, currency]
  );

  const KRI_ICONS: Record<string, React.ElementType> = {
    system_downtime: Monitor,
    policy_error_rate: AlertTriangle,
    motor_claims_cycle: Clock,
    life_claims_cycle: Clock,
    staff_turnover: Users,
    it_security_incidents: Shield,
  };

  const catColor: Record<string, string> = {
    IT: '#C8102E', Process: '#F59E0B', Fraud: '#DC2626', External: '#7A92B0',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Operational Risk</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Key risk indicators, events, and fraud monitoring</p>
      </div>

      {/* KRI Grid */}
      <SectionCard title="Key Risk Indicators (KRIs)" subtitle="Monthly operational performance vs threshold targets">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {data.kris.map((kri) => {
            const Icon = KRI_ICONS[kri.kri] ?? Monitor;
            return (
              <div key={kri.kri} className={`bg-lw-darkCard2 border rounded-xl p-4 ${
                kri.rag === 'Red' ? 'border-lw-danger/40' : kri.rag === 'Amber' ? 'border-lw-amber/40' : 'border-lw-darkBorder'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-4 h-4 text-lw-darkMuted" />
                  <RAGBadge status={kri.rag} size="sm" />
                </div>
                <p className="text-xs text-lw-darkMuted uppercase tracking-wide mb-1">
                  {kri.kri.replace(/_/g, ' ')}
                </p>
                <p className="text-xl font-bold font-mono text-lw-darkText">
                  {kri.value.toFixed(kri.unit === '%' ? 1 : 0)}{kri.unit}
                </p>
                <p className="text-xs text-lw-darkMuted mt-1">
                  Target: {kri.unit === 'count' ? kri.target : kri.target.toFixed(kri.unit === '%' ? 1 : 0) + kri.unit}
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Risk event log */}
      <SectionCard title="Operational Risk Event Log" subtitle="Recent risk events across the group">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Event ID', 'Date', 'Category', 'Description', 'Subsidiary', 'Financial Impact', 'Status', 'Root Cause'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {RISK_EVENTS.map((e) => (
                <tr key={e.id} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-lw-gold">{e.id}</td>
                  <td className="px-3 py-2.5 font-mono text-lw-darkMuted whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: catColor[e.category] + '22', color: catColor[e.category] }}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-lw-darkText max-w-[240px] truncate">{e.description}</td>
                  <td className="px-3 py-2.5 font-mono text-lw-darkMuted">{e.subsidiary}</td>
                  <td className="px-3 py-2.5 font-mono text-lw-darkText">{e.impact > 0 ? bn(e.impact) : '—'}</td>
                  <td className="px-3 py-2.5">
                    <RAGBadge status={e.status === 'Open' ? 'Red' : 'Green'} label={e.status} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 text-lw-darkMuted max-w-[180px] truncate">{e.root_cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Fraud alerts */}
      <SectionCard title="Fraud Alerts" subtitle="SIU referrals and fraud-flagged claims">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lw-darkBorder">
                {['Claim ID', 'Type', 'Amount', 'Subsidiary', 'Referral Date', 'SIU Status', 'Outcome'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {FRAUD_ALERTS.map((f) => (
                <tr key={f.claim_id} className="hover:bg-lw-red/5 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-lw-gold">{f.claim_id}</td>
                  <td className="px-4 py-2.5 text-lw-darkText">{f.type}</td>
                  <td className="px-4 py-2.5 font-mono text-lw-danger font-semibold">{bn(f.amount)}</td>
                  <td className="px-4 py-2.5 font-mono text-lw-darkMuted">{f.subsidiary}</td>
                  <td className="px-4 py-2.5 font-mono text-lw-darkMuted whitespace-nowrap">{f.referral_date}</td>
                  <td className="px-4 py-2.5 text-lw-darkText">{f.siu_status}</td>
                  <td className="px-4 py-2.5">
                    <RAGBadge
                      status={f.outcome === 'Repudiated' || f.outcome === 'Prosecution' ? 'Green' : f.outcome === 'Pending' ? 'Amber' : 'Green'}
                      label={f.outcome}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-6 text-xs text-lw-darkMuted font-mono">
          <span>Total fraud-flagged: <span className="text-lw-danger font-bold">7 claims</span></span>
          <span>Total exposure: <span className="text-lw-danger font-bold">{bn(FRAUD_ALERTS.reduce((s, f) => s + f.amount, 0))}</span></span>
          <span>Repudiated/Prosecuted: <span className="text-lw-green font-bold">{FRAUD_ALERTS.filter((f) => f.outcome === 'Repudiated' || f.outcome === 'Prosecution').length}</span></span>
        </div>
      </SectionCard>
    </div>
  );
};

export default OperationalRisk;
