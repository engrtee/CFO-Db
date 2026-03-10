import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';
import KPICard from '../components/KPICard';
import DrillDownModal from '../components/DrillDownModal';
import { Receipt, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';

const ExpenseManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);
  const [comparisonEnabled, setComparisonEnabled] = useState(true);
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    title: string;
    breadcrumb: string[];
    data: any[];
  }>({
    isOpen: false,
    title: '',
    breadcrumb: [],
    data: [],
  });

  const handleDepartmentClick = (department: string, amount: string) => {
    const vendors = {
      Technology: [
        { label: 'Oracle', value: '₦120M' },
        { label: 'AWS', value: '₦95M' },
        { label: 'Oracle', value: '₦78M' },
        { label: 'IBM', value: '₦62M' },
      ],
      Operations: [
        { label: 'Facilities Management', value: '₦180M' },
        { label: 'Security Services', value: '₦140M' },
        { label: 'Transport & Logistics', value: '₦95M' },
        { label: 'Utilities', value: '₦85M' },
      ],
    };

    setDrillDownModal({
      isOpen: true,
      title: `${department} Expenses`,
      breadcrumb: ['Expense Management', department],
      data: vendors[department as keyof typeof vendors] || [],
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>

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
          title="Total Operating Expenses"
          value="₦843.5bn"
          change="88% YoY"
          isPositive={true}
          icon={DollarSign}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <KPICard
          title="Cost-to-Income Ratio"
          value="48.5%"
          change="-2.3% YoY"
          isPositive={true}
          icon={TrendingDown}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="Budget Variance"
          value="-5.5%"
          change="Under budget"
          isPositive={true}
          icon={Receipt}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Budget Alerts"
          value="3"
          change="2 resolved this month"
          isPositive={false}
          icon={AlertCircle}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown by Department</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YoY Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { dept: 'Technology', budget: 420, actual: 355, variance: -15.5, yoy: -2.3, status: 'Under Budget' },
                { dept: 'Operations', budget: 350, actual: 500, variance: 42.9, yoy: 8.5, status: 'Over Budget' },
                { dept: 'Marketing', budget: 180, actual: 144, variance: -20.0, yoy: -5.2, status: 'Under Budget' },
                { dept: 'Human Resources', budget: 280, actual: 265, variance: -5.4, yoy: 3.1, status: 'On Track' },
                { dept: 'Facilities', budget: 120, actual: 84, variance: -30.0, yoy: -12.4, status: 'Under Budget' },
                { dept: 'Compliance', budget: 90, actual: 88, variance: -2.2, yoy: 1.8, status: 'On Track' },
              ].map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDepartmentClick(item.dept, `$${item.actual}M`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.dept}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${item.budget}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${item.actual}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${item.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.variance > 0 ? '+' : ''}
                      {item.variance.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`${item.yoy < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.yoy > 0 ? '+' : ''}
                      {item.yoy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Under Budget'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Over Budget'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Trends (QoQ)</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25'].map((quarter, index) => {
              const heights = [75, 78, 82, 85, 80, 77, 72];
              return (
                <div key={quarter} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-48 flex items-end">
                    <div
                      className="w-full bg-yellow-500 rounded-t hover:bg-yellow-600 cursor-pointer transition-colors"
                      style={{ height: `${heights[index]}%` }}
                      title={`Expenses: $${720 + index * 10}M`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{quarter}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors by Spend</h2>
          <div className="space-y-3">
            {[
              { vendor: 'Microsoft Corporation', amount: 120, category: 'Technology' },
              { vendor: 'Facilities Management Ltd', amount: 180, category: 'Operations' },
              { vendor: 'Security Services Inc', amount: 140, category: 'Operations' },
              { vendor: 'AWS', amount: 95, category: 'Technology' },
              { vendor: 'Marketing Agency Group', amount: 85, category: 'Marketing' },
            ].map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{vendor.vendor}</div>
                  <div className="text-xs text-gray-500">{vendor.category}</div>
                </div>
                <div className="text-sm font-bold text-gray-900">${vendor.amount}M</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Threshold Alerts</h2>
        <div className="space-y-3">
          {[
            {
              department: 'Operations',
              message: 'Budget exceeded by 42.9% ($150M over)',
              severity: 'High',
              date: '2025-10-05',
            },
            {
              department: 'Technology',
              message: 'On track to exceed budget in Q4',
              severity: 'Medium',
              date: '2025-10-03',
            },
            {
              department: 'Marketing',
              message: 'Significant underspend - review campaign effectiveness',
              severity: 'Low',
              date: '2025-09-28',
            },
          ].map((alert, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{alert.department}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      alert.severity === 'High'
                        ? 'bg-red-100 text-red-700'
                        : alert.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-700">{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">{alert.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ ...drillDownModal, isOpen: false })}
        title={drillDownModal.title}
        breadcrumb={drillDownModal.breadcrumb}
        data={drillDownModal.data}
      />
    </div>
  );
};

export default ExpenseManagement;
