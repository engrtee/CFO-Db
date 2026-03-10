import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Minus,
  Package,
  BarChart2,
  ArrowUpRight,
  Globe,
  RefreshCw,
  Activity,
} from "lucide-react";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import DrillDownModal from "../components/DrillDownModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const revenueData = [
  { month: "Apr", revenue: 4.2, ebitda: 1.1 },
  { month: "May", revenue: 4.8, ebitda: 1.3 },
  { month: "Jun", revenue: 5.1, ebitda: 1.4 },
  { month: "Jul", revenue: 4.9, ebitda: 1.2 },
  { month: "Aug", revenue: 5.6, ebitda: 1.6 },
  { month: "Sep", revenue: 6.2, ebitda: 1.8 },
  { month: "Oct", revenue: 6.8, ebitda: 2.0 },
  { month: "Nov", revenue: 7.1, ebitda: 2.1 },
  { month: "Dec", revenue: 6.5, ebitda: 1.9 },
  { month: "Jan", revenue: 5.8, ebitda: 1.7 },
  { month: "Feb", revenue: 6.3, ebitda: 1.8 },
  { month: "Mar", revenue: 6.9, ebitda: 2.0 },
];

const Overview: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    title: string;
    breadcrumb: string[];
    data: any[];
  }>({ isOpen: false, title: "", breadcrumb: [], data: [] });

  const kpis = [
    {
      title: "Total Revenue",
      value: "$6.9M",
      change: "+12.4% vs last month",
      isPositive: true,
      icon: DollarSign,
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      subtitle: "MTD: $6.9M",
      tooltip: { mtd: "$6.9M", ytd: "$69.2M", yoy: "+18.3%" },
      drillData: [
        { label: "Cargill", value: "$2.4M" },
        { label: "Barry Callebaut", value: "$1.8M" },
        { label: "Olam", value: "$1.5M" },
        { label: "Others", value: "$1.2M" },
      ],
    },
    {
      title: "Gross Profit",
      value: "$2.1M",
      change: "+9.2% vs last month",
      isPositive: true,
      icon: TrendingUp,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      subtitle: "Margin: 30.4%",
      tooltip: { mtd: "$2.1M", ytd: "$20.1M", yoy: "+14.7%" },
      drillData: [
        { label: "Gross Margin", value: "30.4%" },
        { label: "COGS", value: "$4.8M" },
        { label: "Freight", value: "$0.32M" },
        { label: "Duties", value: "$0.18M" },
      ],
    },
    {
      title: "Operating Expenses",
      value: "$0.84M",
      change: "+3.1% vs last month",
      isPositive: false,
      icon: Minus,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      subtitle: "Budget: $0.80M",
      tooltip: { mtd: "$0.84M", ytd: "$8.2M", yoy: "+5.6%" },
      drillData: [
        { label: "Logistics", value: "$0.31M" },
        { label: "Admin", value: "$0.22M" },
        { label: "Sales & Mktg", value: "$0.18M" },
        { label: "Finance", value: "$0.13M" },
      ],
    },
    {
      title: "EBITDA",
      value: "$2.0M",
      change: "+11.1% vs last month",
      isPositive: true,
      icon: BarChart2,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitle: "Margin: 29.0%",
      tooltip: { mtd: "$2.0M", ytd: "$19.4M", yoy: "+21.2%" },
      drillData: [
        { label: "EBITDA Margin", value: "29.0%" },
        { label: "D&A", value: "$0.08M" },
        { label: "Interest", value: "$0.05M" },
        { label: "Tax", value: "$0.28M" },
      ],
    },
    {
      title: "Net Profit",
      value: "$1.22M",
      change: "+8.5% vs last month",
      isPositive: true,
      icon: ArrowUpRight,
      iconBgColor: "bg-teal-100",
      iconColor: "text-teal-600",
      subtitle: "NPM: 17.7%",
      tooltip: { mtd: "$1.22M", ytd: "$11.8M", yoy: "+19.4%" },
      drillData: [
        { label: "Net Profit Margin", value: "17.7%" },
        { label: "PBT", value: "$1.50M" },
        { label: "Tax Rate", value: "18.7%" },
        { label: "EPS", value: "$0.61" },
      ],
    },
    {
      title: "Export Volume",
      value: "4,820 MT",
      change: "+6.8% vs last month",
      isPositive: true,
      icon: Package,
      iconBgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      subtitle: "YTD: 42,180 MT",
      tooltip: { mtd: "4,820 MT", ytd: "42,180 MT", yoy: "+11.3%" },
      drillData: [
        { label: "Cocoa Beans", value: "2,940 MT" },
        { label: "Cocoa Butter", value: "1,120 MT" },
        { label: "Cocoa Powder", value: "760 MT" },
      ],
    },
    {
      title: "Avg Selling Price",
      value: "$1,431/MT",
      change: "+4.2% vs last month",
      isPositive: true,
      icon: Activity,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      subtitle: "Global: $1,510/MT",
      tooltip: { mtd: "$1,431/MT", ytd: "$1,382/MT", yoy: "+22.8%" },
      drillData: [
        { label: "Company Price", value: "$1,431/MT" },
        { label: "Global Spot", value: "$1,510/MT" },
        { label: "Discount", value: "-5.2%" },
        { label: "Premium Origin", value: "+2.3%" },
      ],
    },
    {
      title: "Exchange Rate",
      value: "$1 = ₦1,580",
      change: "-1.2% vs last month",
      isPositive: false,
      icon: Globe,
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      subtitle: "EUR: 1.08 | GBP: 1.26",
      tooltip: { mtd: "₦1,580", ytd: "Avg ₦1,542", yoy: "+8.4% dep." },
      drillData: [
        { label: "USD/NGN", value: "1,580" },
        { label: "EUR/NGN", value: "1,706" },
        { label: "GBP/NGN", value: "1,991" },
        { label: "FX Loss (Unrealized)", value: "-$48K" },
      ],
    },
  ];

  const handleKPIClick = (title: string, drillData: any[]) => {
    setDrillDownModal({
      isOpen: true,
      title,
      breadcrumb: ["Overview", title],
      data: drillData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">CocoaX Exports — Live Financial Snapshot</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Live · Updated just now
        </div>
      </div>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        showComparison={true}
        comparisonEnabled={comparisonEnabled}
        onComparisonToggle={setComparisonEnabled}
        showRegion={true}
        showOfftaker={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map((kpi) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            onClick={() => handleKPIClick(kpi.title, kpi.drillData)}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpis.slice(4).map((kpi) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            onClick={() => handleKPIClick(kpi.title, kpi.drillData)}
          />
        ))}
      </div>

      {/* Revenue & EBITDA Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue & EBITDA Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 12 months · USD Millions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded"></span>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded"></span>EBITDA</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ebitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip formatter={(v: any, n: string) => [`$${v}M`, n === 'revenue' ? 'Revenue' : 'EBITDA']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="ebitda" stroke="#3b82f6" strokeWidth={2} fill="url(#ebitGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Flash KPIs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Performance Flash</h2>
          <div className="space-y-3">
            {[
              { label: "Gross Profit Margin", value: "30.4%", change: "+1.2pp", positive: true },
              { label: "EBITDA Margin", value: "29.0%", change: "+2.1pp", positive: true },
              { label: "Net Profit Margin", value: "17.7%", change: "+0.9pp", positive: true },
              { label: "Revenue vs Budget", value: "+4.8%", change: "Above target", positive: true },
              { label: "OPEX vs Budget", value: "+5.0%", change: "Over budget", positive: false },
              { label: "Cash Conversion Cycle", value: "38 days", change: "-3 days", positive: true },
              { label: "AR Days Outstanding", value: "42 days", change: "+4 days", positive: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${item.positive ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
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

export default Overview;
