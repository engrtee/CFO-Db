import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import { SectionCard } from '../SectionCard';
import { DataTable } from '../DataTable';
import { KPICard } from '../KPICard';
import { RAGBadge } from '../common/RAGBadge';
import { getRiskSummary } from '../../services/riskService';
import { getClaimsSummary } from '../../services/claimsService';
import { useFilterStore } from '../../store/filterStore';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';
const m  = (v: number) => '₦' + (Math.abs(v) / 1e6).toFixed(1) + 'm';

const perils = [
  { peril: 'Flood',                pml: 18.5e9, riCover: 15.2e9 },
  { peril: 'Fire',                 pml: 12.8e9, riCover: 10.5e9 },
  { peril: 'Windstorm',            pml: 8.4e9,  riCover: 7.1e9  },
  { peril: 'Industrial Explosion', pml: 22.1e9, riCover: 18.8e9 },
];

interface PMLTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

const PMLTooltip: React.FC<PMLTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-lw-darkCard border border-lw-darkBorder rounded-lg p-3 text-xs">
      <p className="text-lw-darkText font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {bn(p.value)}</p>
      ))}
    </div>
  );
};

const perilChartData = perils.map((p) => ({
  peril:      p.peril,
  PML:        p.pml,
  'RI Cover': p.riCover,
  net:        p.pml - p.riCover,
}));

export const InsuranceRisk: React.FC = () => {
  const { subsidiaryCode, currency } = useFilterStore();
  const period = useFilterStore((s) => s.getAccountingPeriod());

  const risk   = useMemo(() => getRiskSummary({ subsidiaryCode, period, currency }), [subsidiaryCode, period, currency]);
  const claims = useMemo(() => getClaimsSummary({ subsidiaryCode, period, currency }), [subsidiaryCode, period, currency]);

  const { reserveAdequacy, reinsuerConcentration } = risk;
  const { largeLossItems } = claims;

  const totalLargeLossCount    = largeLossItems.length;
  const totalLargeLossExposure = largeLossItems.reduce((s, c) => s + c.gross_claim_amount, 0);

  const largeLossTableRows = largeLossItems.map((c) => ({
    claim_id:            c.claim_id,
    line_of_business:    c.line_of_business,
    subsidiary_code:     c.subsidiary_code,
    date_of_loss:        c.date_of_loss,
    gross_claim_amount:  c.gross_claim_amount,
    reinsurance_recovery:c.reinsurance_recovery,
    net_claim_amount:    c.net_claim_amount,
    claim_status:        c.claim_status,
    settlement_days:     c.settlement_days ?? 0,
  })) as Record<string, unknown>[];

  const reinsurerRows = reinsuerConcentration.map((r) => ({
    reinsurer:       r.reinsurer,
    rating:          r.rating,
    premium_ceded:   r.premiumCeded,
    pct_of_programme:r.pctOfProgramme,
    status:          r.rag,
  })) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      {/* ── Section 1: Reserve Adequacy ── */}
      <SectionCard title="Reserve Adequacy">
        <div className="overflow-x-auto rounded-xl border border-lw-darkBorder scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-lw-darkCard2 border-b border-lw-darkBorder">
                {['Subsidiary', 'LOB', 'OCR (₦m)', 'IBNR (₦m)', 'Total Reserve', 'Actuarial BE', 'Adequacy Ratio', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-darkBorder">
              {reserveAdequacy.map((row, i) => {
                const rowClass =
                  row.adequacyRatio < 0.90
                    ? 'bg-lw-danger/10 border-l-2 border-lw-danger'
                    : row.adequacyRatio < 1.0
                    ? 'bg-lw-amber/10 border-l-2 border-lw-amber'
                    : '';
                return (
                  <tr key={i} className={`hover:bg-lw-red/5 transition-colors ${rowClass}`}>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">{row.subsidiary}</td>
                    <td className="px-4 py-2.5 text-lw-darkText">{row.lob}</td>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">{m(row.ocr)}</td>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">{m(row.ibnr)}</td>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">{m(row.total)}</td>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">{m(row.actuarialBE)}</td>
                    <td className="px-4 py-2.5 text-lw-darkText font-mono">
                      {(row.adequacyRatio * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <RAGBadge status={row.rag} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Section 2: Large Loss Monitor ── */}
      <SectionCard title="Large Loss Monitor">
        <div className="flex gap-6 mb-4">
          <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-lg px-4 py-3">
            <p className="text-xs text-lw-darkMuted uppercase tracking-wide mb-1">Large Loss Count</p>
            <p className="text-xl font-bold font-mono text-lw-danger">{totalLargeLossCount}</p>
          </div>
          <div className="bg-lw-darkCard2 border border-lw-darkBorder rounded-lg px-4 py-3">
            <p className="text-xs text-lw-darkMuted uppercase tracking-wide mb-1">Aggregate Exposure</p>
            <p className="text-xl font-bold font-mono text-lw-danger">{bn(totalLargeLossExposure)}</p>
          </div>
        </div>
        <DataTable
          rows={largeLossTableRows}
          columns={[
            'claim_id', 'line_of_business', 'subsidiary_code', 'date_of_loss',
            'gross_claim_amount', 'reinsurance_recovery', 'net_claim_amount',
            'claim_status', 'settlement_days',
          ]}
          filename="large_loss_monitor"
        />
      </SectionCard>

      {/* ── Section 3: PML Chart ── */}
      <SectionCard title="Probable Maximum Loss by Peril">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={perilChartData}
            margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => bn(Number(v))}
              tick={{ fill: '#7A92B0', fontSize: 10 }}
              axisLine={{ stroke: '#1E2D3D' }}
            />
            <YAxis
              type="category"
              dataKey="peril"
              tick={{ fill: '#7A92B0', fontSize: 11 }}
              axisLine={{ stroke: '#1E2D3D' }}
              width={140}
            />
            <Tooltip content={<PMLTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#7A92B0' }} />
            <Bar dataKey="PML" fill="#DC2626" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="net"
                position="right"
                formatter={(v) => `Net: ${bn(Number(v))}`}
                style={{ fill: '#7A92B0', fontSize: 10 }}
              />
            </Bar>
            <Bar dataKey="RI Cover" fill="#00A86B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Section 4: RI Recovery Summary ── */}
      <SectionCard title="RI Recovery Summary">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <KPICard
            title="RI Recoveries Received"
            value={4.2e9}
            formatter={bn}
            ragStatus="Green"
          />
          <KPICard
            title="Recoveries Outstanding"
            value={2.8e9}
            formatter={bn}
            ragStatus="Amber"
          />
          <KPICard
            title="Total Programme Adequacy"
            value={94}
            formatter={(v) => v.toFixed(0) + '%'}
            ragStatus="Green"
          />
        </div>
        <DataTable
          rows={reinsurerRows}
          columns={['reinsurer', 'rating', 'premium_ceded', 'pct_of_programme', 'status']}
          filename="reinsurer_concentration"
        />
      </SectionCard>
    </div>
  );
};

export default InsuranceRisk;
