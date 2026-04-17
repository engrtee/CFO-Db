import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldAlert } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { SectionCard } from '../components/SectionCard';
import { DataTable } from '../components/DataTable';

const pct = (n: number) => n.toFixed(1) + '%';
const bn  = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'bn';

function ragNpl(v: number)      { return v <= 5 ? 'green' : v <= 7 ? 'amber' : 'red'; }
function ragCoverage(v: number) { return v >= 80 ? 'green' : v >= 65 ? 'amber' : 'red'; }
function ragCor(v: number)      { return v <= 2 ? 'green' : v <= 3 ? 'amber' : 'red'; }

const ragClasses = {
  green: { dot: 'bg-gt-green', text: 'text-gt-green', badge: 'bg-gt-green/15 text-gt-green', label: '● Good'  },
  amber: { dot: 'bg-gt-amber', text: 'text-gt-amber', badge: 'bg-gt-amber/15 text-gt-amber', label: '● Watch' },
  red:   { dot: 'bg-gt-red',   text: 'text-gt-red',   badge: 'bg-gt-red/15   text-gt-red',   label: '● Alert' },
};

interface RagTileProps { label: string; value: string; rag: 'green' | 'amber' | 'red'; note?: string }
function RagTile({ label, value, rag, note }: RagTileProps) {
  const cls = ragClasses[rag];
  return (
    <div className="rounded-xl border border-gt-border bg-gt-card2 p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gt-muted uppercase tracking-wide">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls.badge}`}>{cls.label}</span>
      </div>
      <p className={`text-2xl font-bold ${cls.text}`}>{value}</p>
      {note && <p className="text-xs text-gt-muted mt-1">{note}</p>}
    </div>
  );
}

const STAGE_COLORS = ['#27AE60', '#FFA500', '#E02020'];

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-gt-card2 border border-gt-border rounded-xl shadow-lg p-3 text-xs">
      <p style={{ color: d.payload.fill }} className="font-semibold">{d.name}</p>
      <p className="text-gt-text mt-0.5">₦{d.value?.toFixed(0)}bn</p>
      <p className="text-gt-muted">{((d.value / d.payload.total) * 100).toFixed(1)}% of loan book</p>
    </div>
  );
};

const RiskAssetQuality: React.FC = () => {
  const { data, loading, lastSynced, refresh } = useDb();
  const rows = data.risk_indicators;
  const latest = rows[rows.length - 1];
  const prev   = rows[rows.length - 2];

  const stageTotal = latest.stage1_exposure + latest.stage2_exposure + latest.stage3_exposure;
  const pieData = [
    { name: 'Stage 1 — Performing',       value: latest.stage1_exposure, total: stageTotal },
    { name: 'Stage 2 — Under-performing', value: latest.stage2_exposure, total: stageTotal },
    { name: 'Stage 3 — Non-performing',   value: latest.stage3_exposure, total: stageTotal },
  ];

  return (
    <SectionCard
      title="Risk & Asset Quality Indicators"
      subtitle={`${latest.date} — IFRS 9 staging + NPL analysis`}
      icon={<ShieldAlert className="w-5 h-5" />}
      lastSynced={lastSynced}
      loading={loading}
      onRefresh={refresh}
      tableContent={<DataTable rows={rows as unknown as Record<string, unknown>[]} />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <RagTile label="NPL Ratio"   value={pct(latest.npl_ratio)}    rag={ragNpl(latest.npl_ratio)}          note={`Prior: ${pct(prev.npl_ratio)}`} />
        <RagTile label="NPL Coverage" value={pct(latest.npl_coverage)} rag={ragCoverage(latest.npl_coverage)} note={`Prior: ${pct(prev.npl_coverage)}`} />
        <RagTile label="Cost of Risk" value={pct(latest.cost_of_risk)} rag={ragCor(latest.cost_of_risk)}      note="% of avg loan book" />
        <RagTile label="Provisions"   value={bn(latest.provisions)}    rag={latest.provisions < prev.provisions ? 'green' : 'amber'} note={`Prior: ${bn(prev.provisions)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            IFRS 9 Loan Staging — {latest.date} (₦bn)
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#AAA' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2">
            <span className="text-xs text-gt-muted">Total staged: {bn(stageTotal)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            NPL Ratio Trend (%) — Quarterly
          </p>
          <div className="space-y-2">
            {rows.map((r) => {
              const barW = (r.npl_ratio / 10) * 100;
              const rag = ragNpl(r.npl_ratio);
              const barColor = rag === 'green' ? '#27AE60' : rag === 'amber' ? '#FFA500' : '#E02020';
              return (
                <div key={r.date} className="flex items-center gap-3">
                  <span className="text-xs text-gt-muted w-16 shrink-0">{r.date}</span>
                  <div className="flex-1 bg-gt-border rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                      style={{ width: `${barW}%`, backgroundColor: barColor }}
                    >
                      <span className="text-gt-text text-xs font-medium whitespace-nowrap">{pct(r.npl_ratio)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gt-muted w-20 shrink-0 text-right">Cov: {pct(r.npl_coverage)}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-gt-amber/10 border border-gt-amber/30 rounded-xl">
            <p className="text-xs font-semibold text-gt-amber mb-1">Watchlist Exposure</p>
            <p className="text-lg font-bold text-gt-text">{bn(latest.watchlist_exposure)}</p>
            <p className="text-xs text-gt-muted">
              Prior: {bn(prev.watchlist_exposure)} —{' '}
              {latest.watchlist_exposure < prev.watchlist_exposure ? '↓ improving' : '↑ elevated'}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default RiskAssetQuality;
