import React, { useState } from 'react';
import PeriodFilter from '../components/PeriodFilter';
import KPICard from '../components/KPICard';
import { ShieldAlert, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

const RiskCompliance: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'yearly'>('quarterly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Risk & Compliance</h1>

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
          title="NPL Ratio"
          value="4.1%"
          change="-0.8% from last quarter"
          isPositive={true}
          icon={ShieldAlert}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
        <KPICard
          title="Loan Loss Coverage"
          value="127%"
          change="+3.2% from last quarter"
          isPositive={true}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="Default Rate"
          value="1.8%"
          change="-0.3% from last quarter"
          isPositive={true}
          icon={TrendingDown}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Compliance Score"
          value="94%"
          change="+2% from last quarter"
          isPositive={true}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Category</h2>
          <div className="space-y-4">
            {[
              { category: 'Credit Risk', level: 'Medium', value: 35, color: 'bg-yellow-500' },
              { category: 'Market Risk', level: 'Low', value: 20, color: 'bg-green-500' },
              { category: 'Operational Risk', level: 'Medium', value: 25, color: 'bg-yellow-500' },
              { category: 'Liquidity Risk', level: 'Low', value: 15, color: 'bg-green-500' },
              { category: 'Compliance Risk', level: 'Very Low', value: 5, color: 'bg-blue-500' },
            ].map((risk) => (
              <div key={risk.category}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{risk.category}</span>
                    <span className="ml-2 text-xs text-gray-500">({risk.level})</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{risk.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${risk.color} h-2 rounded-full`} style={{ width: `${risk.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h2>
          <div className="space-y-3">
            {[
              { requirement: 'Basel III Compliance', status: 'Compliant', icon: CheckCircle2, color: 'text-green-600' },
              { requirement: 'AML/KYC Standards', status: 'Compliant', icon: CheckCircle2, color: 'text-green-600' },
              { requirement: 'Data Privacy (GDPR)', status: 'Compliant', icon: CheckCircle2, color: 'text-green-600' },
              {
                requirement: 'Stress Testing',
                status: 'In Progress',
                icon: AlertTriangle,
                color: 'text-yellow-600',
              },
              { requirement: 'Risk Reporting', status: 'Compliant', icon: CheckCircle2, color: 'text-green-600' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.requirement} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{item.requirement}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Risk Events</h2>
        <div className="space-y-3">
          {[
            {
              date: '2025-10-05',
              event: 'Elevated market volatility detected',
              severity: 'Medium',
              status: 'Monitoring',
            },
            {
              date: '2025-09-28',
              event: 'Credit concentration threshold exceeded',
              severity: 'Low',
              status: 'Resolved',
            },
            {
              date: '2025-09-15',
              event: 'Compliance audit completed',
              severity: 'Low',
              status: 'Completed',
            },
            {
              date: '2025-09-08',
              event: 'Operational incident - system downtime',
              severity: 'Medium',
              status: 'Resolved',
            },
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{event.event}</div>
                <div className="text-sm text-gray-500 mt-1">{event.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.severity === 'High'
                      ? 'bg-red-100 text-red-700'
                      : event.severity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {event.severity}
                </span>
                <span className="text-sm text-gray-600 min-w-24">{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskCompliance;
