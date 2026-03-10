import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';
import KPICard from '../components/KPICard';
import { Landmark, Percent, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

const TaxManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);
  const [comparisonEnabled, setComparisonEnabled] = useState(true);

  const upcomingDueDates = [
    { date: '2025-10-15', taxType: 'Corporate Income Tax', entity: 'GTBank PLC', amount: 52, status: 'pending' },
    { date: '2025-10-20', taxType: 'VAT', entity: 'GTBank PLC', amount: 18, status: 'pending' },
    { date: '2025-10-31', taxType: 'Withholding Tax', entity: 'Subsidiary A', amount: 12, status: 'pending' },
    { date: '2025-11-10', taxType: 'Property Tax', entity: 'GTBank PLC', amount: 8, status: 'pending' },
  ];

  const taxHistory = [
    { quarter: 'Q2 2025', type: 'Corporate Tax', liability: 50, paid: 50, status: 'paid' },
    { quarter: 'Q2 2025', type: 'VAT', liability: 16, paid: 16, status: 'paid' },
    { quarter: 'Q1 2025', type: 'Corporate Tax', liability: 48, paid: 48, status: 'paid' },
    { quarter: 'Q1 2025', type: 'Withholding Tax', liability: 10, paid: 10, status: 'paid' },
  ];

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date('2025-10-07');
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tax Management</h1>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        showComparison={true}
        comparisonEnabled={comparisonEnabled}
        onComparisonToggle={setComparisonEnabled}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Tax Paid (YTD)"
          value="₦157M"
          change="+8.2% YoY"
          isPositive={false}
          icon={Landmark}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <KPICard
          title="Effective Tax Rate"
          value="30.0%"
          change="+0.5% YoY"
          isPositive={false}
          icon={Percent}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <KPICard
          title="Tax-to-Profit Ratio"
          value="42.8%"
          change="+1.2% YoY"
          isPositive={false}
          icon={Percent}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Outstanding Liabilities"
          value="₦90M"
          change="4 payments pending"
          isPositive={false}
          icon={AlertCircle}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown by Type</h2>
          <div className="space-y-4">
            {[
              { type: 'Corporate Income Tax', amount: 105, percent: 67 },
              { type: 'Value Added Tax (VAT)', amount: 32, percent: 20 },
              { type: 'Withholding Tax', amount: 15, percent: 10 },
              { type: 'Property Tax', amount: 5, percent: 3 },
            ].map((tax) => (
              <div key={tax.type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{tax.type}</span>
                  <span className="text-sm font-bold text-gray-900">${tax.amount}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${tax.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Trends (YoY)</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {['2020', '2021', '2022', '2023', '2024', '2025'].map((year, index) => {
              const heights = [55, 62, 68, 72, 78, 85];
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-48 flex items-end">
                    <div
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 cursor-pointer transition-colors"
                      style={{ height: `${heights[index]}%` }}
                      title={`Tax Paid: $${100 + index * 12}M`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{year}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Compliance Calendar - Upcoming Due Dates</h2>
        </div>
        <div className="space-y-3">
          {upcomingDueDates.map((item, index) => {
            const daysUntil = getDaysUntilDue(item.date);
            const isUrgent = daysUntil <= 7;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                  isUrgent ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">{item.taxType}</span>
                    <span className="text-sm text-gray-600">{item.entity}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>Due: {item.date}</span>
                    <span
                      className={`font-medium ${
                        isUrgent ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {daysUntil} days remaining
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${item.amount}M</div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Pending
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liability ($M)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid ($M)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxHistory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quarter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    ${item.liability}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${item.paid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Reconciliation Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Profit Before Tax</div>
            <div className="text-2xl font-bold text-gray-900">$524M</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Tax Expense</div>
            <div className="text-2xl font-bold text-gray-900">$157M</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Effective Rate</div>
            <div className="text-2xl font-bold text-gray-900">30.0%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxManagement;
