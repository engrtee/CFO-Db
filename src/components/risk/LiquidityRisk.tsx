import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, Legend,
} from 'recharts';
import { SectionCard } from '../SectionCard';
import { RAGBadge } from '../common/RAGBadge';
import { GaugeChart } from '../common/GaugeChart';
import { getRagForClaimsPayingAbility } from '../../services/complianceService';

const bn = (v: number) => '₦' + (Math.abs(v) / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

// Mock mismatch data by time bucket
const MISMATCH_DATA = [
  { bucket: '0-7 Days',    inflows: 8_500_000_000,  outflows: 6_200_000_000,  net: 2_300_000_000 },
  { bucket: '7-30 Days',   inflows: 22_000_000_000, outflows: 18_500_000_000, net: 3_500_000_000 },
  { bucket: '30-90 Days',  inflows: 38_000_000_000, outflows: 35_000_000_000, net: 3_000_000_000 },
  { bucket: '90-180 Days', inflows: 45_000_000_000, outflows: 48_000_000_000, net: -3_000_000_000 },
  { bucket: '180-365 Days',inflows: 62_000_000_000, outflows: 58_000_000_000, net: 4_000_000_000 },
  { bucket: '1Y+',         inflows: 185_000_000_000,outflows: 142_000_000_000,net: 43_000_000_000 },
];

const CFP_TRIGGERS = [
  { level: 'Normal', status: 'Normal', facilities: 25_000_000_000, drawn: 0, headroom: 25_000_000_000 },
  { level: 'Watch',  status: 'Normal', facilities: 15_000_000_000, drawn: 0, headroom: 15_000_000_000 },
  { level: 'Alert',  status: 'Normal', facilities: 10_000_000_000, drawn: 0, headroom: 10_000_000_000 },
  { level: 'Crisis', status: 'Standby', facilities: 50_000_000_000, drawn: 0, headroom: 50_000_000_000 },
];

const LCR_VALUE = 142.5;

const LiquidityRisk: React.FC = () => {
  const lcrRag = getRagForClaimsPayingAbility(LCR_VALUE);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Liquidity Risk</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Liquidity coverage and cash flow mismatch analysis</p>
      </div>

      {/* LCR Gauge + summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Liquidity Coverage Ratio" subtitle="Liquid Assets / 30-Day Net Outflows · Min 100%">
          <div className="flex flex-col items-center gap-3 py-2">
            <GaugeChart
              value={LCR_VALUE}
              min={0}
              max={200}
              greenThreshold={130}
              amberThreshold={100}
              label="LCR"
              unit="%"
              rag={lcrRag}
              size={180}
            />
            <div className="flex items-center gap-4 text-xs text-lw-darkMuted">
              <span>Liquid Assets: <span className="font-mono text-lw-darkText font-semibold">₦85.6bn</span></span>
              <span>Net Outflows: <span className="font-mono text-lw-darkText font-semibold">₦60.1bn</span></span>
            </div>
            <RAGBadge status={lcrRag} label={`LCR: ${LCR_VALUE.toFixed(1)}%`} />
          </div>
        </SectionCard>

        {/* Contingency Funding Plan */}
        <SectionCard title="Contingency Funding Plan" subtitle="Status and available facilities by trigger level" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lw-darkBorder">
                  {['Trigger Level', 'Status', 'Facilities Available', 'Facilities Drawn', 'Headroom'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-lw-darkMuted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-lw-darkBorder">
                {CFP_TRIGGERS.map((t) => (
                  <tr key={t.level} className="hover:bg-lw-red/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-lw-darkText">{t.level}</td>
                    <td className="px-4 py-3">
                      <RAGBadge
                        status={t.status === 'Normal' ? 'Green' : t.status === 'Standby' ? 'Amber' : 'Red'}
                        label={t.status}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-lw-green">{bn(t.facilities)}</td>
                    <td className="px-4 py-3 font-mono text-lw-darkText">{bn(t.drawn)}</td>
                    <td className="px-4 py-3 font-mono text-lw-green font-semibold">{bn(t.headroom)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-lw-green/10 border border-lw-green/20 rounded-xl text-xs text-lw-green">
            ✓ All CFP trigger levels in Normal status. No contingency activation required as at {new Date().toLocaleDateString('en-NG')}.
          </div>
        </SectionCard>
      </div>

      {/* Cash flow mismatch */}
      <SectionCard title="Cash Flow Mismatch Report" subtitle="Projected inflows vs outflows by time bucket">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={MISMATCH_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} />
            <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#7A92B0' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="bars" tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={70} />
            <YAxis yAxisId="net" orientation="right" tick={{ fontSize: 10, fill: '#7A92B0' }} tickFormatter={(v) => bn(v)} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }}
              formatter={(v: number, name: string) => [bn(v), name]}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
            <Bar yAxisId="bars" dataKey="inflows" name="Projected Inflows" fill="#00A86B" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="bars" dataKey="outflows" name="Projected Outflows" fill="#DC2626" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            <Line yAxisId="net" type="monotone" dataKey="net" name="Net Position" stroke="#C9A84C" strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
            <ReferenceLine yAxisId="net" y={0} stroke="#7A92B0" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 p-3 bg-lw-amber/10 border border-lw-amber/20 rounded-xl text-xs text-lw-amber">
          ⚠ Projected outflows exceed inflows in the 90–180 day bucket (net: −₦3.0bn). Investment maturity proceeds expected Q3 2025 will cover this gap.
        </div>
      </SectionCard>
    </div>
  );
};

export default LiquidityRisk;
