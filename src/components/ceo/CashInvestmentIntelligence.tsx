import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { KPICard } from '../KPICard';
import { SectionCard } from '../SectionCard';
import { RAGBadge } from '../common/RAGBadge';
import { GaugeChart } from '../common/GaugeChart';
import { useFilterStore } from '../../store/filterStore';
import { getInvestmentSummary } from '../../services/investmentService';
import { getLiquiditySummary } from '../../services/liquidityService';
import { getConsolidatedSummary } from '../../services/consolidationService';
import { getRagForPrescribedAssets } from '../../services/complianceService';
import { DollarSign, TrendingUp, PieChart as PieIcon, Shield } from 'lucide-react';

const bn = (v: number) => '₦' + (v / 1e9).toFixed(2) + 'bn';
const pct = (v: number) => v.toFixed(1) + '%';

const DONUT_COLORS = ['#C8102E', '#C9A84C', '#00A86B', '#7A92B0', '#F59E0B', '#3B82F6', '#8B5CF6'];

const CashInvestmentIntelligence: React.FC = () => {
  const { currency, getAccountingPeriod } = useFilterStore();
  const period = getAccountingPeriod();

  const investment = useMemo(
    () => getInvestmentSummary({ subsidiaryCode: 'ALL', period, currency }),
    [period, currency]
  );

  const liquidity = useMemo(
    () => getLiquiditySummary({ subsidiaryCode: 'ALL', period, currency }),
    [period, currency]
  );

  const consolidated = useMemo(
    () => getConsolidatedSummary(period, currency),
    [period, currency]
  );

  const fmtVal = (v: number) =>
    currency === 'USD' ? '$' + (v / 1e9 / 1555).toFixed(2) + 'bn' : bn(v);

  const prescribedRag = getRagForPrescribedAssets(investment.prescribedAssetRatio);

  const donutData = Object.entries(investment.byAssetClass).map(([name, value]) => ({
    name, value,
  }));

  const cashBarData = liquidity.cashBySubsidiary.map((s) => ({
    name: s.subsidiary, cash: s.cash,
  }));

  const top5 = investment.top10Holdings.slice(0, 5);

  const offshoreData = [
    { currency: 'USD', exposure: investment.offshoreExposureNGN * 0.72, limit: 15 },
    { currency: 'GBP', exposure: investment.offshoreExposureNGN * 0.18, limit: 15 },
    { currency: 'EUR', exposure: investment.offshoreExposureNGN * 0.10, limit: 15 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-lw-darkText font-serif">Cash & Investment Intelligence</h1>
        <p className="text-xs text-lw-darkMuted mt-0.5">Group consolidated investment and cash overview · {period}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Consolidated Cash" value={liquidity.totalCashNGN} formatter={fmtVal} icon={DollarSign} change={5.8} changeLabel="vs prior month" />
        <KPICard title="Total Investment Portfolio" value={investment.totalAUM} formatter={fmtVal} icon={PieIcon} change={8.4} changeLabel="YoY growth" />
        <KPICard title="YTD Investment Income" value={56_200_000_000} formatter={fmtVal} icon={TrendingUp} change={22.1} changeLabel="vs prior year" />
        <KPICard title="Prescribed Assets Compliance" value={investment.prescribedAssetRatio} formatter={pct} icon={Shield} ragStatus={prescribedRag} subtitle="NAICOM min: 50%" />
      </div>

      {/* Asset allocation donut + prescribed gauge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Investment Portfolio by Asset Class" subtitle="All subsidiaries consolidated" className="xl:col-span-2">
          <div className="flex flex-col xl:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [fmtVal(v), name]} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#7A92B0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Prescribed Asset Gauge" subtitle="NAICOM minimum 50% · Green ≥ 60%">
          <div className="flex flex-col items-center gap-3 py-4">
            <GaugeChart
              value={investment.prescribedAssetRatio}
              min={0} max={100}
              greenThreshold={60}
              amberThreshold={50}
              label="Prescribed Assets"
              unit="%"
              rag={prescribedRag}
              size={180}
            />
            <RAGBadge status={prescribedRag} label={`${investment.prescribedAssetRatio.toFixed(1)}%`} />
            <p className="text-xs text-lw-darkMuted text-center">Min: 50% (NAICOM Investment Guideline 2019)</p>
          </div>
        </SectionCard>
      </div>

      {/* Cash + Top 5 holdings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Cash Position by Subsidiary" subtitle="Current consolidated balances">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashBarData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243654" strokeOpacity={0.6} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#7A92B0' }} tickFormatter={fmtVal} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#7A92B0' }} width={45} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [fmtVal(v), 'Cash']} contentStyle={{ background: '#132035', border: '1px solid #243654', borderRadius: 8, fontSize: 10 }} />
              <Bar dataKey="cash" name="Cash Balance" fill="#C8102E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top 5 Holdings by Market Value" subtitle="Largest single positions in the group portfolio">
          <div className="space-y-3">
            {top5.map((h, i) => (
              <div key={h.holding_id} className="flex items-center gap-3">
                <span className="text-xs text-lw-gold font-mono font-bold w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-lw-darkText truncate max-w-[200px]">{h.issuer_name}</span>
                    <span className="text-xs font-mono text-lw-darkText flex-shrink-0">{fmtVal(h.current_market_value)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-lw-darkBorder rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-lw-red"
                        style={{ width: `${Math.min((h.current_market_value / investment.top10Holdings[0].current_market_value) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-lw-darkMuted w-10 text-right">{h.instrument_type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* FX offshore exposure */}
      <SectionCard title="Offshore FX Exposure" subtitle="Foreign currency investment positions vs CBN 15% limit">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {offshoreData.map((fx) => (
            <div key={fx.currency} className="bg-lw-darkCard2 border border-lw-darkBorder rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-lw-darkMuted uppercase tracking-wide">{fx.currency} Position</span>
                <RAGBadge status="Green" size="sm" />
              </div>
              <p className="text-xl font-bold font-mono text-lw-darkText mb-1">{fmtVal(fx.exposure)}</p>
              <div className="flex items-center gap-2 text-xs text-lw-darkMuted">
                <div className="flex-1 bg-lw-darkBorder rounded-full h-2">
                  <div className="h-2 rounded-full bg-lw-green" style={{ width: `${(fx.exposure / investment.totalAUM * 100 / fx.limit * 100).toFixed(0)}%` }} />
                </div>
                <span className="font-mono">{(fx.exposure / investment.totalAUM * 100).toFixed(1)}% / {fx.limit}%</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default CashInvestmentIntelligence;
