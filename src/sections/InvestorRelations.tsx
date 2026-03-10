import React, { useState } from "react";
import PeriodFilter from "../components/PeriodFilter";
import KPICard from "../components/KPICard";
import {
  Users,
  TrendingUp,
  Target,
  Shield,
  Download,
  FileText,
} from "lucide-react";

const InvestorRelations: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"quarterly" | "yearly">(
    "quarterly"
  );
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState(3);
  const [comparisonEnabled, setComparisonEnabled] = useState(true);
  const [investorMode, setInvestorMode] = useState(false);

  const reports = [
    {
      title: "Q3 2025 Earnings Report",
      date: "2025-10-01",
      type: "Quarterly",
      size: "2.4 MB",
    },
    {
      title: "Annual Report 2024",
      date: "2025-03-15",
      type: "Annual",
      size: "8.7 MB",
    },
    {
      title: "Q2 2025 Investor Presentation",
      date: "2025-07-05",
      type: "Presentation",
      size: "5.2 MB",
    },
    {
      title: "Sustainability Report 2024",
      date: "2025-06-10",
      type: "Special",
      size: "3.8 MB",
    },
  ];

  const banks = [
    {
      name: "Guaranty Trust Bank (GTBank) / GTCO",
      url: "https://www.gtbank.com/investor-relations",
    },
    {
      name: "Access Bank Plc",
      url: "https://www.accessbankplc.com/investor-relations",
    },
    {
      name: "United Bank for Africa (UBA) Plc",
      url: "https://www.ubagroup.com/investors/investor-relations/",
    },
    {
      name: "First Bank of Nigeria Ltd",
      url: "https://first-holdco.com/investor-relations/",
    },
    {
      name: "Fidelity Bank Plc",
      url: "https://www.fidelitybank.ng/investor-relations/",
    },
    {
      name: "Union Bank of Nigeria Plc",
      url: "https://www.unionbankng.com/investor-relations/",
    },
    {
      name: "Stanbic IBTC Bank Plc",
      url: "https://reporting.stanbicibtc.com/",
    },
    {
      name: "Ecobank Nigeria Plc",
      url: "https://ecobank.com/group/investor-relations",
    },
    { name: "Sterling Bank Plc", url: "https://sterling.ng/about/investors/" },
    {
      name: "First City Monument Bank (FCMB) Plc",
      url: "https://www.fcmb.com/media-relations",
    },
    { name: "Wema Bank Plc", url: "https://wemabank.com/investor-relations-2" },
    {
      name: "Keystone Bank Ltd",
      url: "https://www.keystonebankng.com/about-us/investor-relations/",
    },
    {
      name: "Polaris Bank Ltd",
      url: "https://ir.polaris.com/home/default.aspx",
    },
    {
      name: "Citibank Nigeria Ltd",
      url: "https://www.citigroup.com/global/investors",
    },
    {
      name: "Standard Chartered Bank Nigeria Ltd",
      url: "https://www.sc.com/en/investors/",
    },
    {
      name: "Unity Bank Plc",
      url: "https://www.unitybankng.com/investor-relations",
    },
    {
      name: "Titan Trust Bank Ltd",
      url: "https://titantrustbank.com/annual-reports/",
    },
    {
      name: "Providus Bank Ltd",
      url: "https://www.providusbank.com/investor-relations",
    },
    {
      name: "Globus Bank",
      url: "https://www.globusbank.com/investor-relations.html",
    },
    {
      name: "Premium Trust Bank",
      url: "https://premiumtrustbank.com/investor-relations/",
    },
  ];

  return (
    <div className="p-6 space-y-8 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investor Relations</h1>
        <button
          onClick={() => setInvestorMode(!investorMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ₦{
            investorMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {investorMode ? "Exit Investor Mode" : "Investor Mode"}
        </button>
      </div>

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

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Net Interest Margin"
          value="3.66%"
          change="+0.12% YoY"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Return on Equity"
          value="15.2%"
          change="+1.8% YoY"
          isPositive={true}
          icon={Target}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="Return on Assets"
          value="1.8%"
          change="+0.3% YoY"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <KPICard
          title="Earnings Per Share"
          value="₦4.52"
          change="+12.4% YoY"
          isPositive={true}
          icon={Users}
          iconBgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
     
      </div>

      {/* Second Row: Shareholder Information */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    Shareholder Information
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">Market Capitalization</div>
      <div className="text-2xl font-bold text-gray-900">₦18.2B</div>
      <div className="text-sm text-green-600 mt-1">+8.5% YTD</div>
    </div>
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">Dividend Yield</div>
      <div className="text-2xl font-bold text-gray-900">4.2%</div>
      <div className="text-sm text-gray-600 mt-1">
        Annual dividend: ₦0.52
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">P/E Ratio</div>
      <div className="text-2xl font-bold text-gray-900">12.8x</div>
      <div className="text-sm text-gray-600 mt-1">
        Industry avg: 14.2x
      </div>
    </div>
  </div>
</div>

      {/* Financial Performance and Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Key Financial Performance
          </h2>
          <div className="space-y-4">
            {[
              { metric: "Revenue", current: 5450, previous: 5200, unit: "M" },
              { metric: "Net Income", current: 367, previous: 326, unit: "M" },
              {
                metric: "Total Assets",
                current: 82.5,
                previous: 78.2,
                unit: "B",
              },
              {
                metric: "Total Equity",
                current: 11.3,
                previous: 10.8,
                unit: "B",
              },
              {
                metric: "Book Value per Share",
                current: 14.2,
                previous: 13.56,
                unit: "",
              },
            ].map((item) => {
              const growth =
                ((item.current - item.previous) / item.previous) * 100;
              return (
                <div
                  key={item.metric}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.metric}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      ₦{item.current}
                      {item.unit}
                    </div>
                    <div className="text-xs text-green-600">
                      +{growth.toFixed(1)}% YoY
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Ratios
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Net Interest Margin",
                value: "3.66%",
                benchmark: "3.2%",
                status: "Above",
              },
              {
                label: "Return on Equity",
                value: "15.2%",
                benchmark: "12.0%",
                status: "Above",
              },
              {
                label: "Return on Assets",
                value: "1.8%",
                benchmark: "1.5%",
                status: "Above",
              },
              {
                label: "Cost-to-Income Ratio",
                value: "48.5%",
                benchmark: "55.0%",
                status: "Better",
              },
              {
                label: "NPL Ratio",
                value: "4.1%",
                benchmark: "5.0%",
                status: "Better",
              },
            ].map((ratio) => (
              <div
                key={ratio.label}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {ratio.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    Industry: {ratio.benchmark}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {ratio.value}
                  </div>
                  <div className="text-xs text-green-600">{ratio.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue & Profit Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue & Profit Trends (YoY)
        </h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {["2020", "2021", "2022", "2023", "2024", "2025"].map(
            (year, index) => {
              const revenueHeights = [58, 64, 70, 76, 82, 88];
              const profitHeights = [45, 52, 58, 64, 70, 75];
              return (
                <div
                  key={year}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full h-48 flex items-end gap-1">
                    <div
                      className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 cursor-pointer transition-colors"
                      style={{ height: `₦{revenueHeights[index]}%` }}
                      title={`Revenue: ₦₦{3800 + index * 300}M`}
                    ></div>
                    <div
                      className="flex-1 bg-green-500 rounded-t hover:bg-green-600 cursor-pointer transition-colors"
                      style={{ height: `₦{profitHeights[index]}%` }}
                      title={`Profit: ₦₦{220 + index * 30}M`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{year}</span>
                </div>
              );
            }
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Net Profit</span>
          </div>
        </div>
      </div>

      {/* Investor Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Investor Reports & Documents
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Board Pack (PDF)
          </button>
        </div>
        <div className="space-y-3">
          {reports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-3">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {report.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.date} • {report.type} • {report.size}
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Nigerian Banks Investor Relations Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Investor Relations – Nigerian Banks
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Click on any bank below to visit their official investor relations
          page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank, index) => (
            <a
              key={index}
              href={bank.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
            >
              <span className="font-medium text-gray-800">{bank.name}</span>
              <Download className="w-4 h-4 text-red-500" />
            </a>
          ))}
        </div>
      </div>


    </div>
  );
};

export default InvestorRelations;
