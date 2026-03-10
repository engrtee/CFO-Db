import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';

const FinancialReporting: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Reporting & Analysis</h1>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Statement Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Interest Income', value: 2340, bold: false },
              { label: 'Interest Expense', value: -1484, bold: false },
              { label: 'Net Interest Income', value: 856, bold: true },
              { label: 'Non-Interest Income', value: 420, bold: false },
              { label: 'Operating Expenses', value: -752, bold: false },
              { label: 'Operating Profit', value: 524, bold: true },
              { label: 'Tax', value: -157, bold: false },
              { label: 'Net Income', value: 367, bold: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-2 ${
                  item.bold ? 'border-t-2 border-gray-300 font-semibold' : ''
                }`}
              >
                <span className={`text-sm ${item.bold ? 'text-gray-900' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                <span
                  className={`text-sm ${
                    item.bold ? 'text-gray-900 font-bold' : item.value < 0 ? 'text-red-600' : 'text-gray-700'
                  }`}
                >
                  ${Math.abs(item.value)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Summary</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Assets</h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Cash & Equivalents</span>
                  <span className="text-gray-900">$12.4B</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Loans & Advances</span>
                  <span className="text-gray-900">$46.0B</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Investments</span>
                  <span className="text-gray-900">$18.6B</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2 font-semibold">
                  <span className="text-gray-900">Total Assets</span>
                  <span className="text-gray-900">$82.5B</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Liabilities & Equity</h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Deposits</span>
                  <span className="text-gray-900">$62.8B</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Borrowings</span>
                  <span className="text-gray-900">$8.4B</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Equity</span>
                  <span className="text-gray-900">$11.3B</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2 font-semibold">
                  <span className="text-gray-900">Total Liabilities & Equity</span>
                  <span className="text-gray-900">$82.5B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: 'Profitability', ratios: [{ name: 'ROE', value: '15.2%' }, { name: 'ROA', value: '1.8%' }, { name: 'NIM', value: '3.66%' }] },
            { category: 'Efficiency', ratios: [{ name: 'Cost-Income', value: '48.5%' }, { name: 'Operating Margin', value: '22.4%' }] },
            { category: 'Asset Quality', ratios: [{ name: 'NPL Ratio', value: '4.1%' }, { name: 'Coverage', value: '127%' }] },
            { category: 'Capital', ratios: [{ name: 'CAR', value: '16.8%' }, { name: 'Tier 1', value: '14.2%' }] },
          ].map((group) => (
            <div key={group.category} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{group.category}</h3>
              <div className="space-y-2">
                {group.ratios.map((ratio) => (
                  <div key={ratio.name} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{ratio.name}</span>
                    <span className="text-sm font-bold text-gray-900">{ratio.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Statement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Operating Activities</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Net Income</span>
                <span className="text-gray-900">$367M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Adjustments</span>
                <span className="text-gray-900">$124M</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2 font-semibold">
                <span className="text-gray-900">Cash from Operations</span>
                <span className="text-green-600">$491M</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Investing Activities</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Capital Expenditure</span>
                <span className="text-red-600">-$156M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Investments</span>
                <span className="text-red-600">-$320M</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2 font-semibold">
                <span className="text-gray-900">Cash from Investing</span>
                <span className="text-red-600">-$476M</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Financing Activities</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Dividends Paid</span>
                <span className="text-red-600">-$110M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Debt Repayment</span>
                <span className="text-red-600">-$85M</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2 font-semibold">
                <span className="text-gray-900">Cash from Financing</span>
                <span className="text-red-600">-$195M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReporting;
