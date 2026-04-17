import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import PeriodFilter from "../components/PeriodFilter";
import KPICard from "../components/KPICard";
import { LineChart as LineIcon, TrendingUp, DollarSign } from "lucide-react";
import { useData, filterByPeriod, quarterMonths, mapForecast } from "../lib/dataContext";

const dfltCf = [
  { month:"Apr", month_num:"4", year:"2025", quarter:"2", base:"2.4", high:"2.7", low:"2.1" },
  { month:"May", month_num:"5", year:"2025", quarter:"2", base:"2.6", high:"2.9", low:"2.2" },
  { month:"Jun", month_num:"6", year:"2025", quarter:"2", base:"2.8", high:"3.1", low:"2.4" },
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", base:"2.8", high:"3.2", low:"2.3" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", base:"3.0", high:"3.4", low:"2.5" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", base:"3.2", high:"3.7", low:"2.6" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", base:"3.1", high:"3.4", low:"2.7" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", base:"3.3", high:"3.8", low:"2.9" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", base:"3.5", high:"4.1", low:"3.0" },
  { month:"Jul", month_num:"7", year:"2026", quarter:"3", base:"3.2", high:"3.9", low:"2.6" },
  { month:"Aug", month_num:"8", year:"2026", quarter:"3", base:"3.6", high:"4.3", low:"3.1" },
  { month:"Sep", month_num:"9", year:"2026", quarter:"3", base:"4.0", high:"4.8", low:"3.4" },
  { month:"Oct", month_num:"10", year:"2026", quarter:"4", base:"4.2", high:"5.0", low:"3.5" },
  { month:"Nov", month_num:"11", year:"2026", quarter:"4", base:"4.5", high:"5.4", low:"3.7" },
  { month:"Dec", month_num:"12", year:"2026", quarter:"4", base:"4.1", high:"4.9", low:"3.2" },
];

const dfltPrice = [
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", base:"1460", high:"1620", low:"1260" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", base:"1490", high:"1650", low:"1280" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", base:"1510", high:"1680", low:"1295" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", base:"1520", high:"1680", low:"1380" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", base:"1545", high:"1720", low:"1370" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", base:"1530", high:"1700", low:"1350" },
  { month:"Jul", month_num:"7", year:"2026", quarter:"3", base:"1560", high:"1750", low:"1360" },
  { month:"Aug", month_num:"8", year:"2026", quarter:"3", base:"1590", high:"1790", low:"1380" },
  { month:"Sep", month_num:"9", year:"2026", quarter:"3", base:"1610", high:"1820", low:"1390" },
  { month:"Oct", month_num:"10", year:"2026", quarter:"4", base:"1640", high:"1860", low:"1400" },
  { month:"Nov", month_num:"11", year:"2026", quarter:"4", base:"1680", high:"1900", low:"1430" },
  { month:"Dec", month_num:"12", year:"2026", quarter:"4", base:"1660", high:"1880", low:"1410" },
];

const dfltFx = [
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", base:"1465", high:"1545", low:"1375" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", base:"1480", high:"1560", low:"1390" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", base:"1500", high:"1575", low:"1410" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", base:"1590", high:"1650", low:"1530" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", base:"1605", high:"1680", low:"1540" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", base:"1620", high:"1710", low:"1545" },
  { month:"Jul", month_num:"7", year:"2026", quarter:"3", base:"1640", high:"1730", low:"1550" },
  { month:"Aug", month_num:"8", year:"2026", quarter:"3", base:"1660", high:"1760", low:"1560" },
  { month:"Sep", month_num:"9", year:"2026", quarter:"3", base:"1680", high:"1780", low:"1565" },
  { month:"Oct", month_num:"10", year:"2026", quarter:"4", base:"1700", high:"1810", low:"1570" },
  { month:"Nov", month_num:"11", year:"2026", quarter:"4", base:"1720", high:"1840", low:"1575" },
  { month:"Dec", month_num:"12", year:"2026", quarter:"4", base:"1740", high:"1860", low:"1580" },
];

type Scenario = "base" | "highCocoa" | "lowYield" | "fxStress";
const scenarioImpacts: Record<Scenario, { revenue:string; grossMargin:string; cashflow:string; description:string; color:string }> = {
  base:       { revenue:"$6.9M", grossMargin:"30.4%", cashflow:"$3.2M", description:"Current trading conditions", color:"text-blue-600" },
  highCocoa:  { revenue:"+18.2% → $8.2M", grossMargin:"+4.1pp → 34.5%", cashflow:"+$0.9M → $4.1M", description:"Cocoa price rises 15% above base — higher revenues, better margins", color:"text-emerald-600" },
  lowYield:   { revenue:"-22.4% → $5.4M", grossMargin:"-5.8pp → 24.6%", cashflow:"-$1.4M → $1.8M", description:"Harvest shortfall 25% — volume drop & procurement cost spike", color:"text-amber-600" },
  fxStress:   { revenue:"-8.1% → $6.3M", grossMargin:"-3.2pp → 27.2%", cashflow:"-$0.6M → $2.6M", description:"NGN depreciates 20% — USD earnings hold but local-cost pressure rises", color:"text-red-600" },
};

const ForecastingScenario: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly"|"quarterly"|"yearly">("yearly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(2);
  const [scenario, setScenario] = useState<Scenario>("base");

  const rawCf    = getRows('forecasts_cf')    ?? dfltCf;
  const rawPrice = getRows('forecasts_price') ?? dfltPrice;
  const rawFx    = getRows('forecasts_fx')    ?? dfltFx;

  // For forecasts, show a forward-looking window from the year
  const getForecastSlice = (rows: typeof dfltCf) => {
    if (selectedPeriod === 'quarterly') return quarterMonths(rows, selectedYear, selectedQuarter);
    if (selectedPeriod === 'yearly') return filterByPeriod(rows, 'yearly', selectedYear, 0, 0);
    // monthly: show 9 months starting from selected month
    return filterByPeriod(rows, 'yearly', selectedYear, 0, 0).slice(0, 9);
  };

  const cfData    = mapForecast(getForecastSlice(rawCf));
  const priceData = mapForecast(getForecastSlice(rawPrice));
  const fxData    = mapForecast(getForecastSlice(rawFx));

  // Latest base values for KPI cards
  const latestCf    = cfData.length > 0 ? cfData[cfData.length-1].base : 4.5;
  const latestPrice = priceData.length > 0 ? priceData[priceData.length-1].base : 1640;
  const latestFx    = fxData.length > 0 ? fxData[fxData.length-1].base : 1740;

  const impact = scenarioImpacts[scenario];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const periodLabel = selectedPeriod === 'monthly' ? `${months[selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecasting & Scenario Planning</h1>
        <p className="text-sm text-gray-500 mt-0.5">Forward-looking projections with scenario modeling · {periodLabel}</p>
      </div>

      <PeriodFilter
        selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear} onYearChange={setSelectedYear}
        selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
        selectedQuarter={selectedQuarter} onQuarterChange={setSelectedQuarter}
      />

      {/* Scenario Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Scenario Modeling</h2>
        <p className="text-xs text-gray-400 mb-4">Toggle below to see the financial impact of key risk scenarios</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {([
            { key:"base" as Scenario, label:"📊 Base Case", desc:"Current conditions" },
            { key:"highCocoa" as Scenario, label:"🟢 High Cocoa Price", desc:"+15% price upside" },
            { key:"lowYield" as Scenario, label:"🟡 Low Yield Harvest", desc:"25% production drop" },
            { key:"fxStress" as Scenario, label:"🔴 FX Rate Stress", desc:"20% NGN depreciation" },
          ]).map(({ key, label, desc }) => (
            <button key={key} onClick={() => setScenario(key)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${scenario === key ? "border-amber-500 bg-amber-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
              <div className="text-sm font-semibold text-gray-800">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scenario Impact</p>
          <p className="text-xs text-gray-500 mb-3 italic">{impact.description}</p>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-400 mb-1">Revenue Impact</p><p className={`text-base font-bold ${impact.color}`}>{impact.revenue}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Gross Margin</p><p className={`text-base font-bold ${impact.color}`}>{impact.grossMargin}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Operating Cashflow</p><p className={`text-base font-bold ${impact.color}`}>{impact.cashflow}</p></div>
          </div>
        </div>
      </div>

      {/* KPI Forecast Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KPICard title="Cashflow Forecast (Base)" value={`$${latestCf.toFixed(1)}M`} change={`Range: $${cfData.length>0?cfData[cfData.length-1].low.toFixed(1):'3.2'}M–$${cfData.length>0?cfData[cfData.length-1].high.toFixed(1):'5.4'}M`} isPositive={true} icon={DollarSign} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd:"$6.9M", ytd:"$69.2M", yoy:"+18.3%" }} />
        <KPICard title="Cocoa Price Forecast" value={`$${latestPrice.toLocaleString()}/MT`} change={`High: $${priceData.length>0?priceData[priceData.length-1].high.toLocaleString():1900}/MT`} isPositive={true} icon={TrendingUp} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd:"$1,510", ytd:"Avg $1,450", yoy:"+16.8%" }} />
        <KPICard title="FX Forecast (USD/NGN)" value={`₦${latestFx.toLocaleString()}`} change={`Stress: ₦${fxData.length>0?fxData[fxData.length-1].high.toLocaleString():1860}`} isPositive={false} icon={LineIcon} iconBgColor="bg-indigo-100" iconColor="text-indigo-600" tooltip={{ mtd:"₦1,580", ytd:"Avg ₦1,542", yoy:"+12.8% dep." }} />
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Cashflow Forecast</h2>
          <p className="text-xs text-gray-400 mb-3">{periodLabel} · USD Millions</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={cfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:9 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>`$${v}M`} />
              <Tooltip formatter={(v: any) => `$${v}M`} />
              <Line type="monotone" dataKey="high" name="High" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="base" name="Base" stroke="#3b82f6" strokeWidth={2.5} dot={{ r:3 }} />
              <Line type="monotone" dataKey="low" name="Low" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Cocoa Price Forecast</h2>
          <p className="text-xs text-gray-400 mb-3">{periodLabel} · $/MT</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:9 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <Tooltip formatter={(v: any) => `$${v}/MT`} />
              <Line type="monotone" dataKey="high" name="High" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="base" name="Base" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r:3 }} />
              <Line type="monotone" dataKey="low" name="Low" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">FX Rate Forecast</h2>
          <p className="text-xs text-gray-400 mb-3">{periodLabel} · USD/NGN</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={fxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:9 }} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip formatter={(v: any) => `₦${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="high" name="Stress" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="base" name="Base" stroke="#6366f1" strokeWidth={2.5} dot={{ r:3 }} />
              <Line type="monotone" dataKey="low" name="Best" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastingScenario;
