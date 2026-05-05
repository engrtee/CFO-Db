import React from 'react';
import { SectionCard } from '../SectionCard';
import { RAGBadge } from '../common/RAGBadge';
import { CheckCircle, AlertTriangle, XCircle, Calendar, Clock } from 'lucide-react';
import type { RAGStatus } from '../../types/subsidiary.types';

interface ComplianceCardProps {
  requirement: string;
  regulator: string;
  regulatorColor: string;
  frequency: string;
  status: 'COMPLIANT' | 'REVIEW' | 'BREACH';
  lastFiled: string;
  nextDue: string;
}

const STATUS_RAG: Record<string, RAGStatus> = {
  COMPLIANT: 'Green', REVIEW: 'Amber', BREACH: 'Red',
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date('2025-05-05');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  requirement, regulator, regulatorColor, frequency, status, lastFiled, nextDue,
}) => {
  const rag = STATUS_RAG[status];
  const days = daysUntil(nextDue);
  const Icon = rag === 'Red' ? XCircle : rag === 'Amber' ? AlertTriangle : CheckCircle;

  return (
    <div className={`bg-lw-darkCard2 border rounded-2xl p-5 flex flex-col gap-3 hover:border-lw-gold/30 transition-colors ${
      rag === 'Red' ? 'border-lw-danger/40' : rag === 'Amber' ? 'border-lw-amber/40' : 'border-lw-darkBorder'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white flex-shrink-0"
          style={{ background: regulatorColor }}
        >
          {regulator}
        </div>
        <RAGBadge status={rag} label={status} size="sm" />
      </div>

      {/* Title */}
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${rag === 'Red' ? 'text-lw-danger' : rag === 'Amber' ? 'text-lw-amber' : 'text-lw-green'}`} />
        <h3 className="text-sm font-semibold text-lw-darkText leading-snug">{requirement}</h3>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between text-lw-darkMuted">
          <span>Frequency</span>
          <span className="text-lw-darkText font-medium">{frequency}</span>
        </div>
        <div className="flex items-center justify-between text-lw-darkMuted">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Last Filed</span>
          <span className="font-mono text-lw-darkText">{lastFiled}</span>
        </div>
        <div className="flex items-center justify-between text-lw-darkMuted">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Next Due</span>
          <span className="font-mono text-lw-darkText">{nextDue}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className={`px-3 py-2 rounded-lg text-xs font-semibold text-center font-mono ${
        days < 14 ? 'bg-lw-danger/15 text-lw-danger' :
        days < 30 ? 'bg-lw-amber/15 text-lw-amber' :
        'bg-lw-green/10 text-lw-green'
      }`}>
        {days > 0 ? `${days} days to deadline` : days === 0 ? 'Due today' : `${Math.abs(days)} days overdue`}
      </div>
    </div>
  );
};

const REQUIREMENTS: ComplianceCardProps[] = [
  { requirement: 'Solvency Margin Filing', regulator: 'NAICOM', regulatorColor: '#C8102E', frequency: 'Quarterly', status: 'COMPLIANT', lastFiled: 'Mar 2025', nextDue: '2025-06-30' },
  { requirement: 'Annual Returns', regulator: 'NAICOM', regulatorColor: '#C8102E', frequency: 'Annual', status: 'COMPLIANT', lastFiled: 'Mar 2025', nextDue: '2026-03-31' },
  { requirement: 'Risk-Based Supervision Report', regulator: 'NAICOM', regulatorColor: '#C8102E', frequency: 'Semi-annual', status: 'COMPLIANT', lastFiled: 'Dec 2024', nextDue: '2025-06-30' },
  { requirement: 'Prescribed Assets Schedule', regulator: 'NAICOM', regulatorColor: '#C8102E', frequency: 'Quarterly', status: 'REVIEW', lastFiled: 'Mar 2025', nextDue: '2025-06-30' },
  { requirement: 'Actuarial Valuation', regulator: 'NAICOM', regulatorColor: '#C8102E', frequency: 'Annual', status: 'COMPLIANT', lastFiled: 'Dec 2024', nextDue: '2025-12-31' },
  { requirement: 'RSA Remittance Report', regulator: 'PenCom', regulatorColor: '#0A4C7A', frequency: 'Monthly', status: 'COMPLIANT', lastFiled: 'Apr 2025', nextDue: '2025-05-31' },
  { requirement: 'HMO Operational Report', regulator: 'NHIA', regulatorColor: '#006B3C', frequency: 'Quarterly', status: 'COMPLIANT', lastFiled: 'Mar 2025', nextDue: '2025-06-30' },
  { requirement: 'Asset Management Returns', regulator: 'SEC Nigeria', regulatorColor: '#4B0082', frequency: 'Quarterly', status: 'COMPLIANT', lastFiled: 'Mar 2025', nextDue: '2025-06-30' },
];

const ComplianceStatus: React.FC = () => {
  const totalItems = REQUIREMENTS.length;
  const compliant = REQUIREMENTS.filter((r) => r.status === 'COMPLIANT').length;
  const review = REQUIREMENTS.filter((r) => r.status === 'REVIEW').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-lw-darkText font-serif">Compliance Status</h1>
          <p className="text-xs text-lw-darkMuted mt-0.5">Regulatory filing compliance board — all subsidiaries</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-lw-green font-semibold">{compliant}/{totalItems} Compliant</span>
          {review > 0 && <span className="text-lw-amber font-semibold">{review} Under Review</span>}
        </div>
      </div>

      {/* Compliance cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {REQUIREMENTS.map((req) => (
          <ComplianceCard key={req.requirement} {...req} />
        ))}
      </div>

      {/* IFRS Status Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="IFRS 17 — Insurance Contract Status" subtitle="CSM, Insurance Revenue, and Service Expenses">
          <div className="space-y-3">
            {[
              { label: 'CSM Balance (Opening)', value: '₦42.8bn', color: 'text-lw-green' },
              { label: 'CSM Accretion (YTD)', value: '₦6.2bn', color: 'text-lw-green' },
              { label: 'Insurance Revenue (YTD)', value: '₦38.4bn', color: 'text-lw-darkText' },
              { label: 'Insurance Service Expense (YTD)', value: '₦29.1bn', color: 'text-lw-danger' },
              { label: 'Insurance Finance Income/(Expense)', value: '₦1.8bn', color: 'text-lw-green' },
              { label: 'Net Insurance Result', value: '₦11.1bn', color: 'text-lw-green' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-lw-darkBorder last:border-0">
                <span className="text-xs text-lw-darkMuted">{row.label}</span>
                <span className={`text-sm font-mono font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 bg-lw-green/10 border border-lw-green/20 rounded-lg text-xs text-lw-green">
            IFRS 17 adopted effective 1 Jan 2023 — modified retrospective approach. Investment result separated from insurance result.
          </div>
        </SectionCard>

        <SectionCard title="IFRS 9 — Financial Instruments" subtitle="ECL provisions and asset classification">
          <div className="space-y-3">
            {/* ECL provisions */}
            <p className="text-xs font-semibold text-lw-darkMuted uppercase tracking-wide">ECL Provisions</p>
            {[
              { label: 'RI Recoverables ECL (Stage 1)', value: '₦0.8bn', color: 'text-lw-green' },
              { label: 'Premium Receivables ECL (Stage 1)', value: '₦0.6bn', color: 'text-lw-green' },
              { label: 'Premium Receivables ECL (Stage 2)', value: '₦0.4bn', color: 'text-lw-amber' },
              { label: 'Total ECL Provision', value: '₦1.8bn', color: 'text-lw-amber' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-lw-darkMuted">{row.label}</span>
                <span className={`text-sm font-mono font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
            <div className="border-t border-lw-darkBorder pt-3">
              <p className="text-xs font-semibold text-lw-darkMuted uppercase tracking-wide mb-2">Asset Classification (₦bn)</p>
              {[
                { label: 'FVTPL', value: '₦18.4bn', pct: '14%' },
                { label: 'FVTOCI', value: '₦28.2bn', pct: '21%' },
                { label: 'Amortised Cost', value: '₦88.1bn', pct: '65%' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-lw-darkMuted w-32">{row.label}</span>
                  <div className="flex-1 bg-lw-darkBorder rounded-full h-2">
                    <div className="h-2 rounded-full bg-lw-red" style={{ width: row.pct }} />
                  </div>
                  <span className="text-xs font-mono text-lw-darkText w-14 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ComplianceStatus;
