import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';
import KPICard from '../components/KPICard';
import { Droplets, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

const LiquiditySolvency: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Liquidity & Solvency</h1>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Liquidity Coverage Ratio"
          value="145%"
          change="+3.1% from last quarter"
          isPositive={true}
          icon={Droplets}
          iconBgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
        <KPICard
          title="Current Ratio"
          value="1.45"
          change="+0.12 from last quarter"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Capital Adequacy Ratio"
          value="16.8%"
          change="+0.8% from last quarter"
          isPositive={true}
          icon={Shield}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="Debt-to-Equity Ratio"
          value="0.62"
          change="-0.05 from last quarter"
          isPositive={true}
          icon={AlertTriangle}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Liquid Assets Breakdown</h2>
          <div className="space-y-4">
            {[
              { name: 'Cash & Bank Balances', amount: 12.4, percent: 43 },
              { name: 'Marketable Securities', amount: 8.6, percent: 30 },
              { name: 'Treasury Bills', amount: 5.2, percent: 18 },
              { name: 'Other Liquid Assets', amount: 2.3, percent: 9 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">${item.amount}B</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Solvency Metrics</h2>
          <div className="space-y-4">
            {[
              { label: 'Tier 1 Capital Ratio', value: '14.2%', status: 'Excellent' },
              { label: 'Total Capital Ratio', value: '16.8%', status: 'Excellent' },
              { label: 'Leverage Ratio', value: '5.8%', status: 'Good' },
              { label: 'Risk-Weighted Assets', value: '$124.5B', status: 'Stable' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{metric.status}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Trend Analysis</h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025'].map(
            (quarter, index) => {
              const heights = [62, 68, 72, 75, 78, 82, 85];
              return (
                <div key={quarter} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-48 flex items-end">
                    <div
                      className="w-full bg-cyan-500 rounded-t hover:bg-cyan-600 cursor-pointer transition-colors"
                      style={{ height: `${heights[index]}%` }}
                      title={`LCR: ${135 + index * 2}%`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 text-center">{quarter}</span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquiditySolvency;
