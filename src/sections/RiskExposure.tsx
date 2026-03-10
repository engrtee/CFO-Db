import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { ShieldAlert, DollarSign, Globe, AlertTriangle } from "lucide-react";

const fxGainLoss = [
  { month: "Oct", realized: 48, unrealized: -22 },
  { month: "Nov", realized: 62, unrealized: -35 },
  { month: "Dec", realized: 55, unrealized: -18 },
  { month: "Jan", realized: 70, unrealized: -40 },
  { month: "Feb", realized: 83, unrealized: -28 },
  { month: "Mar", realized: 91, unrealized: -48 },
];

const fxExposure = [
  { name: "Open Invoices < 30d", value: 1.8, color: "#10b981" },
  { name: "Open Invoices 30-60d", value: 1.2, color: "#fbbf24" },
  { name: "Open Invoices 60-90d", value: 0.6, color: "#fb923c" },
  { name: "Open Invoices > 90d", value: 0.3, color: "#f87171" },
];

const priceComparison = [
  { month: "Oct", global: 1380, company: 1290, margin: 90 },
  { month: "Nov", global: 1420, company: 1310, margin: 110 },
  { month: "Dec", global: 1450, company: 1340, margin: 110 },
  { month: "Jan", global: 1480, company: 1370, margin: 110 },
  { month: "Feb", global: 1500, company: 1400, margin: 100 },
  { month: "Mar", global: 1510, company: 1431, margin: 79 },
];

const arAgeingRisk = [
  { bucket: "0-30d", amount: 2.8, percent: 52.8 },
  { bucket: "31-60d", amount: 1.4, percent: 26.4 },
  { bucket: "61-90d", amount: 0.6, percent: 11.3 },
  { bucket: "91-120d", amount: 0.3, percent: 5.7 },
  { bucket: ">120d", amount: 0.2, percent: 3.8 },
];

const RiskExposure: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Exposure</h1>
        <p className="text-sm text-gray-500 mt-0.5">FX · Commodity · Credit risk monitoring</p>
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

      {/* Risk Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open USD Receivables" value="$3.9M" change="+$0.4M MoM" isPositive={false} icon={Globe} iconBgColor="bg-blue-100" iconColor="text-blue-600" tooltip={{ mtd: "$3.9M", ytd: "$34.2M", yoy: "+12.4%" }} />
        <KPICard title="FX Realized Gain" value="+$91K" change="+9.6% MoM" isPositive={true} icon={DollarSign} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd: "+$91K", ytd: "+$809K", yoy: "+38.2%" }} />
        <KPICard title="FX Unrealized Loss" value="-$48K" change="Mark-to-market" isPositive={false} icon={AlertTriangle} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd: "-$48K", ytd: "-$380K", yoy: "+62.4% loss" }} />
        <KPICard title="LC-Backed Sales" value="68.4%" change="+3.2pp MoM" isPositive={true} icon={ShieldAlert} iconBgColor="bg-violet-100" iconColor="text-violet-600" tooltip={{ mtd: "68.4%", ytd: "65.1%", yoy: "+8.2pp" }} />
      </div>

      {/* FX Risk */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-blue-500" />
          <h2 className="text-base font-semibold text-gray-900">FX Risk</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Realized vs unrealized gain/loss (USD '000) and exposure breakdown</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">FX Gain/Loss Trend ($'000)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fxGainLoss}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
                <Tooltip formatter={(v: any) => `$${v}K`} />
                <Bar dataKey="realized" name="Realized Gain" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="unrealized" name="Unrealized Loss" fill="#fca5a5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Exposure by Open Invoices ($M)</p>
            <div className="space-y-3 pt-2">
              {fxExposure.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-bold text-gray-900">${item.value}M</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(item.value / 1.8) * 100}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total Exposure</span>
                <span className="font-bold text-gray-900">$3.9M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Risk */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-900">Commodity Risk</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Inventory value · Company vs Global cocoa price · Margin sensitivity</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Inventory Value", value: "$4.2M", badge: "1,240 MT", color: "bg-amber-50 border-amber-100" },
                { label: "Price at Risk", value: "-$0.31M", badge: "5% price drop", color: "bg-red-50 border-red-100" },
                { label: "Avg Purchase Price", value: "$1,280/MT", badge: "vs $1,431 sell", color: "bg-emerald-50 border-emerald-100" },
                { label: "Gross Margin at Risk", value: "2.8pp", badge: "sensitivity", color: "bg-violet-50 border-violet-100" },
              ].map((m) => (
                <div key={m.label} className={`p-3 rounded-xl border ${m.color}`}>
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className="text-base font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-400">{m.badge}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Price Comparison & Margin ($/MT)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={priceComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[1200, 1600]} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 150]} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: any) => `$${v}`} />
                <Line yAxisId="left" type="monotone" dataKey="global" name="Global Spot" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="left" type="monotone" dataKey="company" name="Company Price" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Bar yAxisId="right" dataKey="margin" name="Margin Spread" fill="#e0e7ff" radius={[3,3,0,0]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Credit Risk */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-semibold text-gray-900">Credit Risk</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Receivables ageing and LC coverage analysis</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">AR Ageing Risk Buckets ($M)</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={arAgeingRisk} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11 }} width={58} />
                <Tooltip formatter={(v: any, n: string) => n === "amount" ? `$${v}M` : `${v}%`} />
                <Bar dataKey="amount" name="Balance" radius={[0, 4, 4, 0]}>
                  {arAgeingRisk.map((_, i) => (
                    <Cell key={i} fill={["#10b981","#84cc16","#fbbf24","#fb923c","#f87171"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500">Credit Risk Summary</p>
            {[
              { label: "LC-Backed Sales", value: "68.4%", status: "Good", color: "text-emerald-700 bg-emerald-50" },
              { label: "Non-LC (Open Account)", value: "31.6%", status: "Monitor", color: "text-amber-700 bg-amber-50" },
              { label: "Total AR Outstanding", value: "$5.3M", status: "Active", color: "text-blue-700 bg-blue-50" },
              { label: "Overdue > 90 days", value: "$0.5M", status: "⚠ Escalate", color: "text-red-700 bg-red-50" },
              { label: "Credit Insurance Cover", value: "82%", status: "Adequate", color: "text-violet-700 bg-violet-50" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskExposure;
