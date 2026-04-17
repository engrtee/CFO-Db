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
  AreaChart,
  Area,
} from "recharts";
import { useData, filterByPeriod, lastNMonths, quarterMonths, mapRevenueTrend, mapKPIs } from "../lib/dataContext";

// ─── Default data (used when no CSV uploaded) ──────────────────────────────────
const defaultRevenue = [
  { month:"Apr", month_num:"4", year:"2025", quarter:"2", revenue:"3.6", ebitda:"0.9" },
  { month:"May", month_num:"5", year:"2025", quarter:"2", revenue:"3.9", ebitda:"1.0" },
  { month:"Jun", month_num:"6", year:"2025", quarter:"2", revenue:"4.1", ebitda:"1.1" },
  { month:"Jul", month_num:"7", year:"2025", quarter:"3", revenue:"3.8", ebitda:"0.9" },
  { month:"Aug", month_num:"8", year:"2025", quarter:"3", revenue:"4.4", ebitda:"1.2" },
  { month:"Sep", month_num:"9", year:"2025", quarter:"3", revenue:"4.9", ebitda:"1.4" },
  { month:"Oct", month_num:"10", year:"2025", quarter:"4", revenue:"5.2", ebitda:"1.5" },
  { month:"Nov", month_num:"11", year:"2025", quarter:"4", revenue:"5.6", ebitda:"1.6" },
  { month:"Dec", month_num:"12", year:"2025", quarter:"4", revenue:"5.1", ebitda:"1.4" },
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", revenue:"4.6", ebitda:"1.3" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", revenue:"5.0", ebitda:"1.4" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", revenue:"5.5", ebitda:"1.6" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", revenue:"4.2", ebitda:"1.1" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", revenue:"4.8", ebitda:"1.3" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", revenue:"5.1", ebitda:"1.4" },
  { month:"Jul", month_num:"7", year:"2026", quarter:"3", revenue:"4.9", ebitda:"1.2" },
  { month:"Aug", month_num:"8", year:"2026", quarter:"3", revenue:"5.6", ebitda:"1.6" },
  { month:"Sep", month_num:"9", year:"2026", quarter:"3", revenue:"6.2", ebitda:"1.8" },
  { month:"Oct", month_num:"10", year:"2026", quarter:"4", revenue:"6.8", ebitda:"2.0" },
  { month:"Nov", month_num:"11", year:"2026", quarter:"4", revenue:"7.1", ebitda:"2.1" },
  { month:"Dec", month_num:"12", year:"2026", quarter:"4", revenue:"6.5", ebitda:"1.9" },
];

const staticKPIs = [
  { title:"Total Revenue", value:"$6.9M", change:"+12.4% vs last month", isPositive:true, subtitle:"MTD: $6.9M", tooltip:{ mtd:"$6.9M", ytd:"$69.2M", yoy:"+18.3%" }, drillData:[{label:"Cargill",value:"$2.4M"},{label:"Barry Callebaut",value:"$1.8M"},{label:"Olam",value:"$1.5M"},{label:"Others",value:"$1.2M"}] },
  { title:"Gross Profit", value:"$2.1M", change:"+9.2% vs last month", isPositive:true, subtitle:"Margin: 30.4%", tooltip:{ mtd:"$2.1M", ytd:"$20.1M", yoy:"+14.7%" }, drillData:[{label:"Gross Margin",value:"30.4%"},{label:"COGS",value:"$4.8M"},{label:"Freight",value:"$0.32M"},{label:"Duties",value:"$0.18M"}] },
  { title:"Operating Expenses", value:"$0.84M", change:"+3.1% vs last month", isPositive:false, subtitle:"Budget: $0.80M", tooltip:{ mtd:"$0.84M", ytd:"$8.2M", yoy:"+5.6%" }, drillData:[{label:"Logistics",value:"$0.31M"},{label:"Admin",value:"$0.22M"},{label:"Sales & Mktg",value:"$0.18M"},{label:"Finance",value:"$0.13M"}] },
  { title:"EBITDA", value:"$2.0M", change:"+11.1% vs last month", isPositive:true, subtitle:"Margin: 29.0%", tooltip:{ mtd:"$2.0M", ytd:"$19.4M", yoy:"+21.2%" }, drillData:[{label:"EBITDA Margin",value:"29.0%"},{label:"D&A",value:"$0.08M"},{label:"Interest",value:"$0.05M"},{label:"Tax",value:"$0.28M"}] },
  { title:"Net Profit", value:"$1.22M", change:"+8.5% vs last month", isPositive:true, subtitle:"NPM: 17.7%", tooltip:{ mtd:"$1.22M", ytd:"$11.8M", yoy:"+19.4%" }, drillData:[{label:"Net Profit Margin",value:"17.7%"},{label:"PBT",value:"$1.50M"},{label:"Tax Rate",value:"18.7%"},{label:"EPS",value:"$0.61"}] },
  { title:"Export Volume", value:"4,820 MT", change:"+6.8% vs last month", isPositive:true, subtitle:"YTD: 42,180 MT", tooltip:{ mtd:"4,820 MT", ytd:"42,180 MT", yoy:"+11.3%" }, drillData:[{label:"Cocoa Beans",value:"2,940 MT"},{label:"Cocoa Butter",value:"1,120 MT"},{label:"Cocoa Powder",value:"760 MT"}] },
  { title:"Avg Selling Price", value:"$1,431/MT", change:"+4.2% vs last month", isPositive:true, subtitle:"Global: $1,510/MT", tooltip:{ mtd:"$1,431/MT", ytd:"$1,382/MT", yoy:"+22.8%" }, drillData:[{label:"Company Price",value:"$1,431/MT"},{label:"Global Spot",value:"$1,510/MT"},{label:"Discount",value:"-5.2%"},{label:"Premium Origin",value:"+2.3%"}] },
  { title:"Exchange Rate", value:"$1 = ₦1,580", change:"-1.2% vs last month", isPositive:false, subtitle:"EUR: 1.08 | GBP: 1.26", tooltip:{ mtd:"₦1,580", ytd:"Avg ₦1,542", yoy:"+8.4% dep." }, drillData:[{label:"USD/NGN",value:"1,580"},{label:"EUR/NGN",value:"1,706"},{label:"GBP/NGN",value:"1,991"},{label:"FX Loss (Unrealized)",value:"-$48K"}] },
];

const kpiIcons = [DollarSign, TrendingUp, Minus, BarChart2, ArrowUpRight, Package, Activity, Globe];
const kpiIconBg = ["bg-emerald-100","bg-green-100","bg-orange-100","bg-blue-100","bg-teal-100","bg-amber-100","bg-purple-100","bg-indigo-100"];
const kpiIconColor = ["text-emerald-600","text-green-600","text-orange-600","text-blue-600","text-teal-600","text-amber-600","text-purple-600","text-indigo-600"];

const Overview: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean; title: string; breadcrumb: string[]; data: any[];
  }>({ isOpen: false, title: "", breadcrumb: [], data: [] });

  // ── Revenue trend chart data ─────────────────────────────────────────────
  const rawRevenue = getRows('revenue_trend') ?? defaultRevenue;
  let chartData;
  if (selectedPeriod === "monthly") {
    chartData = lastNMonths(rawRevenue, selectedYear, selectedMonth, 12).map(mapRevenueTrend).flat().map((r, _, arr) => arr[arr.indexOf(r)]);
    // Simpler: use lastNMonths already returns CSVRow[], so map directly
    chartData = mapRevenueTrend(lastNMonths(rawRevenue, selectedYear, selectedMonth, 12));
  } else if (selectedPeriod === "quarterly") {
    chartData = mapRevenueTrend(quarterMonths(rawRevenue, selectedYear, selectedQuarter));
  } else {
    chartData = mapRevenueTrend(filterByPeriod(rawRevenue, "yearly", selectedYear, 0, 0));
  }

  // ── KPI cards ───────────────────────────────────────────────────────────
  const rawKPIs = getRows('kpis');
  let kpis: typeof staticKPIs;
  if (rawKPIs) {
    // Filter to selected period
    const filteredKpiRows = filterByPeriod(rawKPIs, selectedPeriod, selectedYear, selectedMonth, selectedQuarter);
    // Group by metric — take last occurrence per metric
    const byMetric: Record<string, typeof filteredKpiRows[0]> = {};
    filteredKpiRows.forEach(r => { if (r.metric) byMetric[r.metric] = r; });
    const mappedKPIs = mapKPIs(Object.values(byMetric));
    if (mappedKPIs.length > 0) {
      kpis = staticKPIs.map((sk, i) => {
        const found = mappedKPIs.find(k => k.title === sk.title);
        if (!found) return sk;
        return {
          ...sk,
          value: found.value,
          change: found.change,
          isPositive: found.isPositive,
          subtitle: found.subtitle,
          tooltip: { mtd: found.mtd, ytd: found.ytd, yoy: found.yoy },
        };
      });
    } else {
      kpis = staticKPIs;
    }
  } else {
    kpis = staticKPIs;
  }

  const periodLabel = selectedPeriod === 'monthly'
    ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly'
    ? `Q${selectedQuarter} ${selectedYear}`
    : `FY ${selectedYear}`;

  const handleKPIClick = (title: string, drillData: any[]) => {
    setDrillDownModal({ isOpen: true, title, breadcrumb: ["Overview", title], data: drillData });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">CocoaX Exports — {periodLabel}</p>
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
        {kpis.slice(0, 4).map((kpi, i) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            icon={kpiIcons[i]}
            iconBgColor={kpiIconBg[i]}
            iconColor={kpiIconColor[i]}
            tooltip={kpi.tooltip}
            onClick={() => handleKPIClick(kpi.title, kpi.drillData)}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpis.slice(4).map((kpi, i) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            icon={kpiIcons[i + 4]}
            iconBgColor={kpiIconBg[i + 4]}
            iconColor={kpiIconColor[i + 4]}
            tooltip={kpi.tooltip}
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
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedPeriod === 'monthly' ? 'Last 12 months' : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`} · USD Millions
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded"></span>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded"></span>EBITDA</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
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
