import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { ShieldAlert, DollarSign, Globe, AlertTriangle } from "lucide-react";
import {
  useData, filterByPeriod, lastNMonths, quarterMonths,
  mapFxGainLoss, mapFxExposure, mapAgeing,
} from "../lib/dataContext";

// ─── Default data ──────────────────────────────────────────────────────────────
const dfltFxGainLoss = [
  { month:"Jan", month_num:"1", year:"2025", quarter:"1", realized:"28", unrealized:"-12" },
  { month:"Feb", month_num:"2", year:"2025", quarter:"1", realized:"34", unrealized:"-18" },
  { month:"Mar", month_num:"3", year:"2025", quarter:"1", realized:"41", unrealized:"-15" },
  { month:"Apr", month_num:"4", year:"2025", quarter:"2", realized:"38", unrealized:"-20" },
  { month:"May", month_num:"5", year:"2025", quarter:"2", realized:"45", unrealized:"-25" },
  { month:"Jun", month_num:"6", year:"2025", quarter:"2", realized:"52", unrealized:"-22" },
  { month:"Jul", month_num:"7", year:"2025", quarter:"3", realized:"44", unrealized:"-19" },
  { month:"Aug", month_num:"8", year:"2025", quarter:"3", realized:"51", unrealized:"-24" },
  { month:"Sep", month_num:"9", year:"2025", quarter:"3", realized:"58", unrealized:"-30" },
  { month:"Oct", month_num:"10", year:"2025", quarter:"4", realized:"48", unrealized:"-22" },
  { month:"Nov", month_num:"11", year:"2025", quarter:"4", realized:"62", unrealized:"-35" },
  { month:"Dec", month_num:"12", year:"2025", quarter:"4", realized:"55", unrealized:"-18" },
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", realized:"70", unrealized:"-40" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", realized:"83", unrealized:"-28" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", realized:"91", unrealized:"-48" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", realized:"62", unrealized:"-32" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", realized:"74", unrealized:"-38" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", realized:"88", unrealized:"-44" },
];

const dfltFxExposure = [
  { name:"Open Invoices < 30d", year:"2026", quarter:"1", month_num:"3", value:"1.8", color:"#10b981" },
  { name:"Open Invoices 30-60d", year:"2026", quarter:"1", month_num:"3", value:"1.2", color:"#fbbf24" },
  { name:"Open Invoices 60-90d", year:"2026", quarter:"1", month_num:"3", value:"0.6", color:"#fb923c" },
  { name:"Open Invoices > 90d", year:"2026", quarter:"1", month_num:"3", value:"0.3", color:"#f87171" },
  { name:"Open Invoices < 30d", year:"2026", quarter:"1", month_num:"2", value:"1.7", color:"#10b981" },
  { name:"Open Invoices 30-60d", year:"2026", quarter:"1", month_num:"2", value:"1.1", color:"#fbbf24" },
  { name:"Open Invoices 60-90d", year:"2026", quarter:"1", month_num:"2", value:"0.55", color:"#fb923c" },
  { name:"Open Invoices > 90d", year:"2026", quarter:"1", month_num:"2", value:"0.25", color:"#f87171" },
  { name:"Open Invoices < 30d", year:"2025", quarter:"4", month_num:"12", value:"1.7", color:"#10b981" },
  { name:"Open Invoices 30-60d", year:"2025", quarter:"4", month_num:"12", value:"1.1", color:"#fbbf24" },
  { name:"Open Invoices 60-90d", year:"2025", quarter:"4", month_num:"12", value:"0.5", color:"#fb923c" },
  { name:"Open Invoices > 90d", year:"2025", quarter:"4", month_num:"12", value:"0.3", color:"#f87171" },
];

const dfltArAgeing = [
  { bucket:"0-30 days", year:"2026", quarter:"1", month_num:"3", amount:"2.8" },
  { bucket:"31-60 days", year:"2026", quarter:"1", month_num:"3", amount:"1.4" },
  { bucket:"61-90 days", year:"2026", quarter:"1", month_num:"3", amount:"0.6" },
  { bucket:"91-120 days", year:"2026", quarter:"1", month_num:"3", amount:"0.3" },
  { bucket:">120 days", year:"2026", quarter:"1", month_num:"3", amount:"0.2" },
  { bucket:"0-30 days", year:"2026", quarter:"1", month_num:"2", amount:"2.7" },
  { bucket:"31-60 days", year:"2026", quarter:"1", month_num:"2", amount:"1.35" },
  { bucket:"61-90 days", year:"2026", quarter:"1", month_num:"2", amount:"0.58" },
  { bucket:"91-120 days", year:"2026", quarter:"1", month_num:"2", amount:"0.29" },
  { bucket:">120 days", year:"2026", quarter:"1", month_num:"2", amount:"0.19" },
  { bucket:"0-30 days", year:"2025", quarter:"4", month_num:"12", amount:"2.6" },
  { bucket:"31-60 days", year:"2025", quarter:"4", month_num:"12", amount:"1.3" },
  { bucket:"61-90 days", year:"2025", quarter:"4", month_num:"12", amount:"0.58" },
  { bucket:"91-120 days", year:"2025", quarter:"4", month_num:"12", amount:"0.28" },
  { bucket:">120 days", year:"2025", quarter:"4", month_num:"12", amount:"0.19" },
];

const RiskExposure: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  // ── FX Gain/Loss trend ──────────────────────────────────────────────────
  const rawFxGl = getRows('fx_gainloss') ?? dfltFxGainLoss;
  let fxGainLoss;
  if (selectedPeriod === 'monthly') {
    fxGainLoss = mapFxGainLoss(lastNMonths(rawFxGl, selectedYear, selectedMonth, 6));
  } else if (selectedPeriod === 'quarterly') {
    fxGainLoss = mapFxGainLoss(quarterMonths(rawFxGl, selectedYear, selectedQuarter));
  } else {
    fxGainLoss = mapFxGainLoss(filterByPeriod(rawFxGl, 'yearly', selectedYear, 0, 0));
  }

  // ── FX Exposure bars ────────────────────────────────────────────────────
  const rawExposure = getRows('fx_exposure') ?? dfltFxExposure;
  const fxExposure = mapFxExposure(filterByPeriod(rawExposure, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));
  const totalExposure = fxExposure.reduce((s, r) => s + r.value, 0).toFixed(1);
  const maxExposure = fxExposure.length > 0 ? Math.max(...fxExposure.map(e => e.value)) : 1;

  // ── AR Ageing ───────────────────────────────────────────────────────────
  const rawAr = getRows('ar_ageing') ?? dfltArAgeing;
  const arAgeingRisk = mapAgeing(filterByPeriod(rawAr, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));

  const periodLabel = selectedPeriod === 'monthly'
    ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Exposure</h1>
        <p className="text-sm text-gray-500 mt-0.5">FX · Commodity · Credit risk monitoring · {periodLabel}</p>
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
        <KPICard title="Open USD Receivables" value={`$${totalExposure}M`} change="+$0.4M MoM" isPositive={false} icon={Globe} iconBgColor="bg-blue-100" iconColor="text-blue-600" tooltip={{ mtd: `$${totalExposure}M`, ytd: "$34.2M", yoy: "+12.4%" }} />
        <KPICard title="FX Realized Gain" value={fxGainLoss.length > 0 ? `+$${fxGainLoss[fxGainLoss.length-1].realized}K` : "+$91K"} change="+9.6% MoM" isPositive={true} icon={DollarSign} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd: "+$91K", ytd: "+$809K", yoy: "+38.2%" }} />
        <KPICard title="FX Unrealized Loss" value={fxGainLoss.length > 0 ? `${fxGainLoss[fxGainLoss.length-1].unrealized}K` : "-$48K"} change="Mark-to-market" isPositive={false} icon={AlertTriangle} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd: "-$48K", ytd: "-$380K", yoy: "+62.4% loss" }} />
        <KPICard title="LC-Backed Sales" value="68.4%" change="+3.2pp MoM" isPositive={true} icon={ShieldAlert} iconBgColor="bg-violet-100" iconColor="text-violet-600" tooltip={{ mtd: "68.4%", ytd: "65.1%", yoy: "+8.2pp" }} />
      </div>

      {/* FX Risk */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-blue-500" />
          <h2 className="text-base font-semibold text-gray-900">FX Risk</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Realized vs unrealized gain/loss (USD '000) and exposure breakdown · {periodLabel}</p>
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
              {fxExposure.length > 0 ? fxExposure.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-bold text-gray-900">${item.value}M</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(item.value / maxExposure) * 100}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              )) : <p className="text-xs text-gray-400">No exposure data for selected period</p>}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total Exposure</span>
                <span className="font-bold text-gray-900">${totalExposure}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Risk */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-semibold text-gray-900">Credit Risk</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Receivables ageing and LC coverage · {periodLabel}</p>
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
              { label: "Total AR Outstanding", value: `$${arAgeingRisk.reduce((s,r)=>s+r.amount,0).toFixed(1)}M`, status: "Active", color: "text-blue-700 bg-blue-50" },
              { label: "Overdue > 90 days", value: `$${arAgeingRisk.filter(r=>r.bucket.includes('91')||r.bucket.includes('120')||r.bucket.includes('>120')).reduce((s,r)=>s+r.amount,0).toFixed(1)}M`, status: "⚠ Escalate", color: "text-red-700 bg-red-50" },
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
