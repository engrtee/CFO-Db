import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Cell,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { Droplets, TrendingUp, RefreshCw, Clock } from "lucide-react";
import { useData, filterByPeriod, mapCashflow, mapAgeing } from "../lib/dataContext";

const dfltCashflow = [
  { name:"Opening Cash", year:"2026", quarter:"1", month_num:"3", value:"8.4", base:"0", color:"#3b82f6", is_total:"false" },
  { name:"Operating CF", year:"2026", quarter:"1", month_num:"3", value:"3.2", base:"8.4", color:"#10b981", is_total:"false" },
  { name:"Investing CF", year:"2026", quarter:"1", month_num:"3", value:"-1.1", base:"11.6", color:"#f87171", is_total:"false" },
  { name:"Financing CF", year:"2026", quarter:"1", month_num:"3", value:"-0.6", base:"10.5", color:"#fbbf24", is_total:"false" },
  { name:"Closing Cash", year:"2026", quarter:"1", month_num:"3", value:"9.9", base:"0", color:"#8b5cf6", is_total:"true" },
  { name:"Opening Cash", year:"2026", quarter:"1", month_num:"2", value:"9.0", base:"0", color:"#3b82f6", is_total:"false" },
  { name:"Operating CF", year:"2026", quarter:"1", month_num:"2", value:"3.0", base:"9.0", color:"#10b981", is_total:"false" },
  { name:"Investing CF", year:"2026", quarter:"1", month_num:"2", value:"-1.0", base:"12.0", color:"#f87171", is_total:"false" },
  { name:"Financing CF", year:"2026", quarter:"1", month_num:"2", value:"-0.55", base:"11.45", color:"#fbbf24", is_total:"false" },
  { name:"Closing Cash", year:"2026", quarter:"1", month_num:"2", value:"9.4", base:"0", color:"#8b5cf6", is_total:"true" },
  { name:"Opening Cash", year:"2025", quarter:"4", month_num:"12", value:"9.5", base:"0", color:"#3b82f6", is_total:"false" },
  { name:"Operating CF", year:"2025", quarter:"4", month_num:"12", value:"3.0", base:"9.5", color:"#10b981", is_total:"false" },
  { name:"Investing CF", year:"2025", quarter:"4", month_num:"12", value:"-1.0", base:"12.5", color:"#f87171", is_total:"false" },
  { name:"Financing CF", year:"2025", quarter:"4", month_num:"12", value:"-0.6", base:"11.9", color:"#fbbf24", is_total:"false" },
  { name:"Closing Cash", year:"2025", quarter:"4", month_num:"12", value:"8.4", base:"0", color:"#8b5cf6", is_total:"true" },
];

const dfltArAgeing = [
  { bucket:"0-30 days", year:"2026", quarter:"1", month_num:"3", amount:"2.8" },
  { bucket:"31-60 days", year:"2026", quarter:"1", month_num:"3", amount:"1.4" },
  { bucket:"61-90 days", year:"2026", quarter:"1", month_num:"3", amount:"0.6" },
  { bucket:"91-120 days", year:"2026", quarter:"1", month_num:"3", amount:"0.3" },
  { bucket:">120 days", year:"2026", quarter:"1", month_num:"3", amount:"0.2" },
  { bucket:"0-30 days", year:"2025", quarter:"4", month_num:"12", amount:"2.6" },
  { bucket:"31-60 days", year:"2025", quarter:"4", month_num:"12", amount:"1.3" },
  { bucket:"61-90 days", year:"2025", quarter:"4", month_num:"12", amount:"0.58" },
  { bucket:"91-120 days", year:"2025", quarter:"4", month_num:"12", amount:"0.28" },
  { bucket:">120 days", year:"2025", quarter:"4", month_num:"12", amount:"0.19" },
];

const dfltApAgeing = [
  { bucket:"0-30 days", year:"2026", quarter:"1", month_num:"3", amount:"1.6" },
  { bucket:"31-60 days", year:"2026", quarter:"1", month_num:"3", amount:"0.9" },
  { bucket:"61-90 days", year:"2026", quarter:"1", month_num:"3", amount:"0.3" },
  { bucket:">90 days", year:"2026", quarter:"1", month_num:"3", amount:"0.1" },
  { bucket:"0-30 days", year:"2025", quarter:"4", month_num:"12", amount:"1.55" },
  { bucket:"31-60 days", year:"2025", quarter:"4", month_num:"12", amount:"0.85" },
  { bucket:"61-90 days", year:"2025", quarter:"4", month_num:"12", amount:"0.29" },
  { bucket:">90 days", year:"2025", quarter:"4", month_num:"12", amount:"0.1" },
];

const arColors = ["#10b981","#84cc16","#fbbf24","#fb923c","#f87171"];
const apColors = ["#3b82f6","#60a5fa","#93c5fd","#bfdbfe"];

const CashflowLiquidity: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly"|"quarterly"|"yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const rawCf = getRows('cashflow') ?? dfltCashflow;
  const rawAr = getRows('ar_ageing') ?? dfltArAgeing;
  const rawAp = getRows('ap_ageing') ?? dfltApAgeing;

  const cfWaterfall = mapCashflow(filterByPeriod(rawCf, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));
  const arAgeing = mapAgeing(filterByPeriod(rawAr, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));
  const apAgeing = mapAgeing(filterByPeriod(rawAp, selectedPeriod, selectedYear, selectedMonth, selectedQuarter));

  const opCF = cfWaterfall.find(r => r.name === 'Operating CF');
  const invCF = cfWaterfall.find(r => r.name === 'Investing CF');
  const finCF = cfWaterfall.find(r => r.name === 'Financing CF');
  const closing = cfWaterfall.find(r => r.isTotal);
  const netMov = (opCF?.value ?? 0) + (invCF?.value ?? 0) + (finCF?.value ?? 0);
  const arTotal = arAgeing.reduce((s,r) => s+r.amount, 0).toFixed(1);
  const apTotal = apAgeing.reduce((s,r) => s+r.amount, 0).toFixed(1);
  const arOverdue = arAgeing.filter(r => r.bucket.includes('91')||r.bucket.includes('120')).reduce((s,r)=>s+r.amount,0);
  const arPct = parseFloat(arTotal) > 0 ? ((arOverdue/parseFloat(arTotal))*100).toFixed(1) : '9.4';
  const apPct = parseFloat(apTotal) > 0 ? ((apAgeing[0]?.amount ?? 0)/parseFloat(apTotal)*100).toFixed(0) : '79';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const periodLabel = selectedPeriod === 'monthly' ? `${months[selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cashflow & Liquidity</h1>
        <p className="text-sm text-gray-500 mt-0.5">Working capital management · {periodLabel}</p>
      </div>
      <PeriodFilter
        selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear} onYearChange={setSelectedYear}
        selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
        selectedQuarter={selectedQuarter} onQuarterChange={setSelectedQuarter}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Operating Cashflow" value={opCF ? `$${opCF.value.toFixed(1)}M` : "$3.2M"} change="+14.2% MoM" isPositive={true} icon={Droplets} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd:"$3.2M", ytd:"$28.4M", yoy:"+22.6%" }} />
        <KPICard title="Investing Cashflow" value={invCF ? `$${invCF.value.toFixed(1)}M` : "-$1.1M"} change="+8.3% outflow" isPositive={false} icon={TrendingUp} iconBgColor="bg-red-100" iconColor="text-red-600" tooltip={{ mtd:"-$1.1M", ytd:"-$9.8M", yoy:"+15.2%" }} />
        <KPICard title="Financing Cashflow" value={finCF ? `$${finCF.value.toFixed(1)}M` : "-$0.6M"} change="-5.0% MoM" isPositive={true} icon={RefreshCw} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd:"-$0.6M", ytd:"-$5.4M", yoy:"-8.1%" }} />
        <KPICard title="Net Cash Movement" value={`${netMov>=0?'+':''}$${netMov.toFixed(1)}M`} change={closing ? `Closing: $${closing.value.toFixed(1)}M` : "Closing: $9.9M"} isPositive={netMov>=0} icon={Clock} iconBgColor="bg-blue-100" iconColor="text-blue-600" tooltip={{ mtd:`+$${netMov.toFixed(1)}M`, ytd:"+$13.2M", yoy:"+31.2%" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Cashflow Waterfall</h2>
          <p className="text-xs text-gray-400 mb-4">{periodLabel} · USD Millions</p>
          {cfWaterfall.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={cfWaterfall} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v: any, n: string) => n === "base" ? null : [`$${Math.abs(v)}M`, "Amount"]} filterNull />
                <Bar dataKey="base" stackId="s" fill="transparent" />
                <Bar dataKey="value" stackId="s" radius={[4,4,0,0]}>
                  {cfWaterfall.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 pt-8 text-center">No data for selected period</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Working Capital Metrics</h2>
          <div className="space-y-3">
            {[
              { label:"Cash Conversion Cycle", value:"38 days", change:"-3 days", positive:true, bar:63 },
              { label:"Inventory Turnover", value:"8.4x", change:"+0.6x", positive:true, bar:84 },
              { label:"AR Days Outstanding", value:"42 days", change:"+4 days", positive:false, bar:70 },
              { label:"AP Days Outstanding", value:"31 days", change:"-2 days", positive:true, bar:52 },
              { label:"WC Tied in Inventory", value:"$4.2M", change:"-$0.3M", positive:true, bar:58 },
              { label:"Quick Ratio", value:"1.42", change:"+0.08", positive:true, bar:71 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 truncate">{item.label}</span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-900">{item.value}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${item.positive ? "text-emerald-700 bg-emerald-50":"text-red-600 bg-red-50"}`}>{item.change}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full transition-all" style={{ width:`${item.bar}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Accounts Receivable Ageing</h2>
          <p className="text-xs text-gray-400 mb-4">USD Millions · Total: ${arTotal}M · {periodLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={arAgeing} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11 }} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize:11 }} width={80} />
              <Tooltip formatter={(v: any) => `$${v}M`} />
              <Bar dataKey="amount" name="AR Balance" radius={[0,4,4,0]}>
                {arAgeing.map((_,i) => <Cell key={i} fill={arColors[i % arColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-700">⚠ ${arOverdue.toFixed(1)}M ({arPct}%) overdue &gt;90 days — escalation required</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Accounts Payable Ageing</h2>
          <p className="text-xs text-gray-400 mb-4">USD Millions · Total: ${apTotal}M · {periodLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={apAgeing} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11 }} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize:11 }} width={80} />
              <Tooltip formatter={(v: any) => `$${v}M`} />
              <Bar dataKey="amount" name="AP Balance" radius={[0,4,4,0]}>
                {apAgeing.map((_,i) => <Cell key={i} fill={apColors[i % apColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700">✓ {apPct}% of payables within 30-day terms — healthy AP position</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowLiquidity;
