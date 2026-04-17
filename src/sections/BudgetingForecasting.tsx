import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';
import { useData, filterByPeriod, mapActualsBudget } from '../lib/dataContext';

const dfltBudget = [
  { metric:"Revenue", year:"2026", quarter:"1", month_num:"3", actual:"6.9", budget:"6.6", sply:"5.8" },
  { metric:"Opex", year:"2026", quarter:"1", month_num:"3", actual:"0.84", budget:"0.80", sply:"0.79" },
  { metric:"EBITDA", year:"2026", quarter:"1", month_num:"3", actual:"2.0", budget:"1.85", sply:"1.65" },
  { metric:"Net Profit", year:"2026", quarter:"1", month_num:"3", actual:"1.22", budget:"1.15", sply:"1.03" },
  { metric:"Revenue", year:"2026", quarter:"1", month_num:"2", actual:"6.3", budget:"6.0", sply:"5.4" },
  { metric:"Opex", year:"2026", quarter:"1", month_num:"2", actual:"0.81", budget:"0.78", sply:"0.76" },
  { metric:"EBITDA", year:"2026", quarter:"1", month_num:"2", actual:"1.8", budget:"1.70", sply:"1.55" },
  { metric:"Net Profit", year:"2026", quarter:"1", month_num:"2", actual:"1.12", budget:"1.05", sply:"0.96" },
  { metric:"Revenue", year:"2025", quarter:"4", month_num:"12", actual:"6.5", budget:"6.2", sply:"5.6" },
  { metric:"Opex", year:"2025", quarter:"4", month_num:"12", actual:"0.82", budget:"0.79", sply:"0.78" },
  { metric:"EBITDA", year:"2025", quarter:"4", month_num:"12", actual:"1.90", budget:"1.80", sply:"1.65" },
  { metric:"Net Profit", year:"2025", quarter:"4", month_num:"12", actual:"1.15", budget:"1.08", sply:"1.01" },
];

const BudgetingForecasting: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly'|'quarterly'|'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const raw = getRows('actuals_budget') ?? dfltBudget;
  const budgetRows = mapActualsBudget(filterByPeriod(raw, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));

  // Deduplicate metrics (take last per metric)
  const byMetric: Record<string, typeof budgetRows[0]> = {};
  budgetRows.forEach(r => { byMetric[r.metric] = r; });
  const budgetData = Object.values(byMetric);

  const totalBudget = budgetData.reduce((s,r) => s+r.budget, 0);
  const totalActual = budgetData.reduce((s,r) => s+r.actual, 0);
  const totalVariancePct = totalBudget > 0 ? ((totalActual-totalBudget)/totalBudget*100).toFixed(1) : '0.0';
  const utilization = totalBudget > 0 ? ((totalActual/totalBudget)*100).toFixed(1) : '0.0';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const periodLabel = selectedPeriod === 'monthly' ? `${months[selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budgeting & Forecasting</h1>

      <PeriodFilter
        selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear} onYearChange={setSelectedYear}
        selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
        selectedQuarter={selectedQuarter} onQuarterChange={setSelectedQuarter}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Budget · {periodLabel}</div>
          <div className="text-3xl font-bold text-gray-900">${totalBudget.toFixed(2)}M</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Actual</div>
          <div className="text-3xl font-bold text-blue-600">${totalActual.toFixed(2)}M</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Variance</div>
          <div className={`text-3xl font-bold ${parseFloat(totalVariancePct) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(totalVariancePct) > 0 ? '+' : ''}{totalVariancePct}%
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Utilization</div>
          <div className="text-3xl font-bold text-gray-900">{utilization}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual · {periodLabel}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget ($M)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual ($M)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SPLY ($M)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visual</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.length > 0 ? budgetData.map((item, index) => {
                const vPct = item.budget > 0 ? ((item.actual - item.budget) / item.budget * 100) : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.metric}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.budget.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.actual.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.sply.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${vPct <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {vPct > 0 ? '+' : ''}{vPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.actual > item.budget ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width:`${Math.min((item.actual / item.budget) * 100, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No data for selected period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h2>
          <div className="space-y-4">
            {budgetData.map(item => (
              <div key={item.metric}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className="text-sm font-bold text-gray-900">{totalBudget > 0 ? ((item.budget/totalBudget)*100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width:`${totalBudget > 0 ? (item.budget/totalBudget)*100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast vs Target</h2>
          <div className="space-y-4">
            {[
              { metric:'Revenue', target:5200, forecast:5450, variance:4.8 },
              { metric:'Operating Expenses', target:3430, forecast:3240, variance:-5.5 },
              { metric:'Net Income', target:1770, forecast:2210, variance:24.9 },
              { metric:'EBITDA', target:2340, forecast:2680, variance:14.5 },
            ].map(item => (
              <div key={item.metric} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className={`text-sm font-bold ${item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.variance > 0 ? '+' : ''}{item.variance}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Target: ${item.target}M</span>
                  <span>Forecast: ${item.forecast}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetingForecasting;
