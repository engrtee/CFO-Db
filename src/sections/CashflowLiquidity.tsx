import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Cell,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { Droplets, TrendingUp, RefreshCw, Clock } from "lucide-react";

const cashflowWaterfall = [
  { name: "Opening Cash", value: 8.4, base: 0, isTotal: false, color: "#3b82f6" },
  { name: "Operating CF", value: 3.2, base: 8.4, isTotal: false, color: "#10b981" },
  { name: "Investing CF", value: -1.1, base: 11.6, isTotal: false, color: "#f87171" },
  { name: "Financing CF", value: -0.6, base: 10.5, isTotal: false, color: "#fbbf24" },
  { name: "Closing Cash", value: 9.9, base: 0, isTotal: true, color: "#8b5cf6" },
];

const arAgeing = [
  { bucket: "0-30 days", amount: 2.8 },
  { bucket: "31-60 days", amount: 1.4 },
  { bucket: "61-90 days", amount: 0.6 },
  { bucket: "91-120 days", amount: 0.3 },
  { bucket: ">120 days", amount: 0.2 },
];

const apAgeing = [
  { bucket: "0-30 days", amount: 1.6 },
  { bucket: "31-60 days", amount: 0.9 },
  { bucket: "61-90 days", amount: 0.3 },
  { bucket: ">90 days", amount: 0.1 },
];

const arColors = ["#10b981", "#84cc16", "#fbbf24", "#fb923c", "#f87171"];
const apColors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const CashflowLiquidity: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cashflow & Liquidity</h1>
        <p className="text-sm text-gray-500 mt-0.5">Working capital management and cash movement</p>
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
      />

      {/* Cashflow KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Operating Cashflow" value="$3.2M" change="+14.2% MoM" isPositive={true} icon={Droplets} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd: "$3.2M", ytd: "$28.4M", yoy: "+22.6%" }} />
        <KPICard title="Investing Cashflow" value="-$1.1M" change="+8.3% outflow" isPositive={false} icon={TrendingUp} iconBgColor="bg-red-100" iconColor="text-red-600" tooltip={{ mtd: "-$1.1M", ytd: "-$9.8M", yoy: "+15.2%" }} />
        <KPICard title="Financing Cashflow" value="-$0.6M" change="-5.0% MoM" isPositive={true} icon={RefreshCw} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd: "-$0.6M", ytd: "-$5.4M", yoy: "-8.1%" }} />
        <KPICard title="Net Cash Movement" value="+$1.5M" change="Closing: $9.9M" isPositive={true} icon={Clock} iconBgColor="bg-blue-100" iconColor="text-blue-600" tooltip={{ mtd: "+$1.5M", ytd: "+$13.2M", yoy: "+31.2%" }} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Waterfall */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Cashflow Waterfall</h2>
          <p className="text-xs text-gray-400 mb-4">MTD · USD Millions</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={cashflowWaterfall} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip
                formatter={(v: any, name: string) => name === "base" ? null : [`$${Math.abs(v)}M`, name === "value" ? "Amount" : null]}
                filterNull
              />
              {/* Invisible base bar for waterfall effect */}
              <Bar dataKey="base" stackId="stack" fill="transparent" />
              <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
                {cashflowWaterfall.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Working Capital KPIs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Working Capital Metrics</h2>
          <div className="space-y-3">
            {[
              { label: "Cash Conversion Cycle", value: "38 days", change: "-3 days", positive: true, bar: 63 },
              { label: "Inventory Turnover", value: "8.4x", change: "+0.6x", positive: true, bar: 84 },
              { label: "AR Days Outstanding", value: "42 days", change: "+4 days", positive: false, bar: 70 },
              { label: "AP Days Outstanding", value: "31 days", change: "-2 days", positive: true, bar: 52 },
              { label: "WC Tied in Inventory", value: "$4.2M", change: "-$0.3M", positive: true, bar: 58 },
              { label: "Quick Ratio", value: "1.42", change: "+0.08", positive: true, bar: 71 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 truncate">{item.label}</span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-900">{item.value}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${item.positive ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full transition-all" style={{ width: `${item.bar}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AR & AP Ageing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AR Ageing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Accounts Receivable Ageing</h2>
          <p className="text-xs text-gray-400 mb-4">USD Millions · Total: $5.3M</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={arAgeing} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: any) => `$${v}M`} />
              <Bar dataKey="amount" name="AR Balance" radius={[0, 4, 4, 0]}>
                {arAgeing.map((_, i) => <Cell key={i} fill={arColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-700">⚠ $0.5M (9.4%) overdue &gt;90 days — escalation required</p>
          </div>
        </div>

        {/* AP Ageing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Accounts Payable Ageing</h2>
          <p className="text-xs text-gray-400 mb-4">USD Millions · Total: $2.9M</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={apAgeing} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: any) => `$${v}M`} />
              <Bar dataKey="amount" name="AP Balance" radius={[0, 4, 4, 0]}>
                {apAgeing.map((_, i) => <Cell key={i} fill={apColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700">✓ 79% of payables within 30-day terms — healthy AP position</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowLiquidity;
