import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { TrendingUp, Percent, Target, DollarSign } from "lucide-react";

const actualVsBudget = [
  { metric: "Revenue", actual: 6.9, budget: 6.6, sply: 5.8 },
  { metric: "Opex", actual: 0.84, budget: 0.80, sply: 0.79 },
  { metric: "EBITDA", actual: 2.0, budget: 1.85, sply: 1.65 },
  { metric: "Net Profit", actual: 1.22, budget: 1.15, sply: 1.03 },
];

const revenueTrend = [
  { month: "Apr'25", revenue: 4.2, budget: 4.0, forecast: null },
  { month: "May'25", revenue: 4.8, budget: 4.6, forecast: null },
  { month: "Jun'25", revenue: 5.1, budget: 5.0, forecast: null },
  { month: "Jul'25", revenue: 4.9, budget: 5.2, forecast: null },
  { month: "Aug'25", revenue: 5.6, budget: 5.4, forecast: null },
  { month: "Sep'25", revenue: 6.2, budget: 6.0, forecast: null },
  { month: "Oct'25", revenue: 6.8, budget: 6.5, forecast: null },
  { month: "Nov'25", revenue: 7.1, budget: 7.0, forecast: null },
  { month: "Dec'25", revenue: 6.5, budget: 6.7, forecast: null },
  { month: "Jan'26", revenue: 5.8, budget: 5.5, forecast: null },
  { month: "Feb'26", revenue: 6.3, budget: 6.0, forecast: null },
  { month: "Mar'26", revenue: 6.9, budget: 6.6, forecast: 6.9 },
  { month: "Apr'26", revenue: null, budget: null, forecast: 7.2 },
  { month: "May'26", revenue: null, budget: null, forecast: 7.5 },
];

const opexVariance = [
  { category: "Logistics & Freight", variance: 0.08, overspend: true },
  { category: "Admin & Overhead", variance: 0.02, overspend: true },
  { category: "Sales & Marketing", variance: -0.01, overspend: false },
  { category: "Finance Costs", variance: 0.01, overspend: true },
  { category: "Compliance & Legal", variance: -0.02, overspend: false },
];

const cocoaPrice = [
  { month: "Oct", global: 1380, company: 1290 },
  { month: "Nov", global: 1420, company: 1310 },
  { month: "Dec", global: 1450, company: 1340 },
  { month: "Jan", global: 1480, company: 1370 },
  { month: "Feb", global: 1500, company: 1400 },
  { month: "Mar", global: 1510, company: 1431 },
];

const offtakers = [
  { name: "Cargill", volume: 1420, revenue: 2.03 },
  { name: "Barry Callebaut", volume: 1180, revenue: 1.69 },
  { name: "Olam International", volume: 980, revenue: 1.40 },
  { name: "Touton SA", volume: 760, revenue: 1.09 },
  { name: "Ecom Trading", volume: 480, revenue: 0.69 },
];

const PerformanceManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [viewMode, setViewMode] = useState<"MTD" | "YTD" | "SPLY">("MTD");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Actual vs Budget · Rolling Forecast (10+2)</p>
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
        showRegion={true}
        showOfftaker={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Gross Profit Margin" value="30.4%" change="+1.2pp MoM" isPositive={true} icon={Percent} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd: "30.4%", ytd: "28.9%", yoy: "+3.1pp" }} />
        <KPICard title="Net Profit Margin" value="17.7%" change="+0.9pp MoM" isPositive={true} icon={TrendingUp} iconBgColor="bg-blue-100" iconColor="text-blue-600" tooltip={{ mtd: "17.7%", ytd: "17.1%", yoy: "+2.4pp" }} />
        <KPICard title="EBITDA Margin" value="29.0%" change="+2.1pp MoM" isPositive={true} icon={Target} iconBgColor="bg-violet-100" iconColor="text-violet-600" tooltip={{ mtd: "29.0%", ytd: "28.0%", yoy: "+2.8pp" }} />
        <KPICard title="Revenue vs Budget" value="+4.8%" change="$0.33M above" isPositive={true} icon={DollarSign} iconBgColor="bg-green-100" iconColor="text-green-600" tooltip={{ mtd: "+4.8%", ytd: "+3.2%", yoy: "+18.3%" }} />
      </div>

      {/* Actual vs Budget */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Actual vs Budget vs SPLY</h2>
            <p className="text-xs text-gray-400 mt-0.5">USD Millions</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["MTD", "YTD", "SPLY"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === m ? 'bg-amber-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={actualVsBudget} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
            <Tooltip formatter={(v: any) => `$${v}M`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="budget" name="Budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sply" name="SPLY" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Trend + Forecast */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Revenue Trend & Rolling Forecast (10+2)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Actuals + forward forecast · USD Millions</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
            <Tooltip formatter={(v: any) => v ? `$${v}M` : "—"} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x="Mar'26" stroke="#c084fc" strokeDasharray="4 4" label={{ value: "Today", fontSize: 11, fill: "#c084fc" }} />
            <Line type="monotone" dataKey="revenue" name="Actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
            <Line type="monotone" dataKey="budget" name="Budget" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#8b5cf6" }} connectNulls={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: OPEX Variance + Price Comparison + Offtakers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OPEX Variance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Top Opex Variance</h2>
          <p className="text-xs text-gray-400 mb-4">Actual vs Budget · USD Millions</p>
          <div className="space-y-3">
            {opexVariance.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 truncate pr-2">{item.category}</span>
                  <span className={`text-xs font-bold ${item.overspend ? "text-red-600" : "text-emerald-600"}`}>
                    {item.overspend ? "+" : ""}{(item.variance * 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.overspend ? "bg-red-400" : "bg-emerald-400"}`}
                    style={{ width: `${Math.abs(item.variance) / 0.1 * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cocoa Price Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Cocoa Price Comparison</h2>
          <p className="text-xs text-gray-400 mb-4">Global Spot vs Company Price · $/MT</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cocoaPrice}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[1200, 1600]} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: any) => `$${v}/MT`} />
              <Line type="monotone" dataKey="global" name="Global Spot" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="company" name="Company" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Offtakers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Top Offtakers</h2>
          <p className="text-xs text-gray-400 mb-4">By volume (MT) & revenue ($M)</p>
          <div className="space-y-3">
            {offtakers.map((o, i) => (
              <div key={o.name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 truncate">{o.name}</span>
                    <span className="text-xs font-bold text-gray-900 ml-2">${o.revenue}M</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(o.volume / 1420) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{o.volume.toLocaleString()} MT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceManagement;
