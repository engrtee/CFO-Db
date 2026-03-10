import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';

const BudgetingForecasting: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);

  const budgetData = [
    { category: 'Personnel', budget: 1250, actual: 1180, variance: -5.6 },
    { category: 'Technology', budget: 560, actual: 521, variance: -7.0 },
    { category: 'Operations', budget: 980, actual: 1020, variance: 4.1 },
    { category: 'Marketing', budget: 320, actual: 256, variance: -20.0 },
    { category: 'Facilities', budget: 140, actual: 98, variance: -30.0 },
    { category: 'Professional Services', budget: 180, actual: 165, variance: -8.3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budgeting & Forecasting</h1>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Budget</div>
          <div className="text-3xl font-bold text-gray-900">₦3.43B</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Actual</div>
          <div className="text-3xl font-bold text-blue-600">₦3.24B</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Variance</div>
          <div className="text-3xl font-bold text-green-600">-5.5%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Utilization</div>
          <div className="text-3xl font-bold text-gray-900">94.5%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual by Category</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget ($M)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual ($M)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    ${item.budget}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    ${item.actual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      className={`font-medium ${
                        item.variance < 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.variance > 0 ? '+' : ''}
                      {item.variance.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.actual > item.budget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(item.actual / item.budget) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h2>
          <div className="space-y-4">
            {budgetData.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {((item.budget / 3430) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(item.budget / 3430) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast vs Target</h2>
          <div className="space-y-4">
            {[
              { metric: 'Revenue', target: 5200, forecast: 5450, variance: 4.8 },
              { metric: 'Operating Expenses', target: 3430, forecast: 3240, variance: -5.5 },
              { metric: 'Net Income', target: 1770, forecast: 2210, variance: 24.9 },
              { metric: 'EBITDA', target: 2340, forecast: 2680, variance: 14.5 },
            ].map((item) => (
              <div key={item.metric} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span
                    className={`text-sm font-bold ${
                      item.variance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.variance > 0 ? '+' : ''}
                    {item.variance}%
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
