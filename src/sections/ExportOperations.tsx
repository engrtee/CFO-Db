import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { Ship, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useData, filterByPeriod, lastNMonths, quarterMonths, mapExportVolume, mapShipments } from "../lib/dataContext";

const dfltVolume = [
  { month:"Apr", month_num:"4", year:"2025", quarter:"2", volume:"3200" },
  { month:"May", month_num:"5", year:"2025", quarter:"2", volume:"3450" },
  { month:"Jun", month_num:"6", year:"2025", quarter:"2", volume:"3600" },
  { month:"Jul", month_num:"7", year:"2025", quarter:"3", volume:"3500" },
  { month:"Aug", month_num:"8", year:"2025", quarter:"3", volume:"3750" },
  { month:"Sep", month_num:"9", year:"2025", quarter:"3", volume:"3900" },
  { month:"Oct", month_num:"10", year:"2025", quarter:"4", volume:"4100" },
  { month:"Nov", month_num:"11", year:"2025", quarter:"4", volume:"4300" },
  { month:"Dec", month_num:"12", year:"2025", quarter:"4", volume:"4050" },
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", volume:"3800" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", volume:"4100" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", volume:"3950" },
  { month:"Apr", month_num:"4", year:"2026", quarter:"2", volume:"4300" },
  { month:"May", month_num:"5", year:"2026", quarter:"2", volume:"4600" },
  { month:"Jun", month_num:"6", year:"2026", quarter:"2", volume:"4820" },
];

const dfltShipments = [
  { month:"Jan", month_num:"1", year:"2026", quarter:"1", dispatched:"41", delayed:"3" },
  { month:"Feb", month_num:"2", year:"2026", quarter:"1", dispatched:"44", delayed:"4" },
  { month:"Mar", month_num:"3", year:"2026", quarter:"1", dispatched:"46", delayed:"3" },
  { month:"Oct", month_num:"10", year:"2025", quarter:"4", dispatched:"46", delayed:"4" },
  { month:"Nov", month_num:"11", year:"2025", quarter:"4", dispatched:"49", delayed:"5" },
  { month:"Dec", month_num:"12", year:"2025", quarter:"4", dispatched:"46", delayed:"6" },
];

// Simple Sankey SVG (static — not period filtered, shows route structure)
const SankeyChart: React.FC = () => {
  const origins = [
    { label:"Ghana", color:"#f59e0b", y:60, value:1820 },
    { label:"Côte d'Ivoire", color:"#10b981", y:160, value:2100 },
    { label:"Nigeria", color:"#3b82f6", y:260, value:900 },
  ];
  const destinations = [
    { label:"Netherlands", color:"#8b5cf6", y:80, value:1580 },
    { label:"Germany", color:"#ec4899", y:160, value:1240 },
    { label:"USA", color:"#f97316", y:240, value:1200 },
    { label:"Malaysia", color:"#06b6d4", y:320, value:800 },
  ];
  return (
    <svg viewBox="0 0 520 400" className="w-full" style={{ maxHeight:220 }}>
      {origins.map(o => (
        <g key={o.label}>
          <rect x={10} y={o.y} width={18} height={60} fill={o.color} rx={3} opacity={0.85} />
          <text x={34} y={o.y+34} fontSize={11} fill="#374151" fontWeight="600">{o.label}</text>
          <text x={34} y={o.y+48} fontSize={10} fill="#9ca3af">{o.value.toLocaleString()} MT</text>
        </g>
      ))}
      {destinations.map(d => (
        <g key={d.label}>
          <rect x={380} y={d.y} width={18} height={50} fill={d.color} rx={3} opacity={0.85} />
          <text x={404} y={d.y+28} fontSize={11} fill="#374151" fontWeight="600">{d.label}</text>
          <text x={404} y={d.y+42} fontSize={10} fill="#9ca3af">{d.value.toLocaleString()} MT</text>
        </g>
      ))}
      {origins.flatMap((o,oi) => destinations.map((d,di) => (
        <path key={`${o.label}-${d.label}`}
          d={`M 28 ${o.y+30} C 195 ${o.y+30}, 195 ${d.y+25}, 380 ${d.y+25}`}
          fill="none" stroke={o.color} strokeWidth={Math.max(2,(o.value/destinations.length/500))}
          opacity={0.08+(oi+di)*0.03+0.3}
        />
      )))}
      <text x={200} y={195} fontSize={10} fill="#9ca3af" textAnchor="middle">Export Flow</text>
      <text x={200} y={208} fontSize={10} fill="#d1d5db" textAnchor="middle">by Route</text>
    </svg>
  );
};

const ExportOperations: React.FC = () => {
  const { getRows } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly"|"quarterly"|"yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const rawVol = getRows('export_volume') ?? dfltVolume;
  const rawShip = getRows('shipments') ?? dfltShipments;

  let volumeData;
  if (selectedPeriod === 'monthly') {
    volumeData = mapExportVolume(lastNMonths(rawVol, selectedYear, selectedMonth, 12));
  } else if (selectedPeriod === 'quarterly') {
    volumeData = mapExportVolume(quarterMonths(rawVol, selectedYear, selectedQuarter));
  } else {
    volumeData = mapExportVolume(filterByPeriod(rawVol, 'yearly', selectedYear, 0, 0));
  }

  let shipData;
  if (selectedPeriod === 'monthly') {
    shipData = mapShipments(lastNMonths(rawShip, selectedYear, selectedMonth, 6));
  } else if (selectedPeriod === 'quarterly') {
    shipData = mapShipments(quarterMonths(rawShip, selectedYear, selectedQuarter));
  } else {
    shipData = mapShipments(filterByPeriod(rawShip, 'yearly', selectedYear, 0, 0));
  }

  const latestVol = volumeData.length > 0 ? volumeData[volumeData.length-1].volume : 4820;
  const totalDispatched = shipData.reduce((s,r)=>s+r.dispatched,0);
  const totalDelayed = shipData.reduce((s,r)=>s+r.delayed,0);
  const onTimeRate = totalDispatched > 0 ? ((totalDispatched/(totalDispatched+totalDelayed))*100).toFixed(1) : '93.9';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const periodLabel = selectedPeriod === 'monthly' ? `${months[selectedMonth-1]} ${selectedYear}`
    : selectedPeriod === 'quarterly' ? `Q${selectedQuarter} ${selectedYear}` : `FY ${selectedYear}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Operations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Operational efficiency linked to revenue performance · {periodLabel}</p>
      </div>
      <PeriodFilter
        selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}
        selectedYear={selectedYear} onYearChange={setSelectedYear}
        selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
        selectedQuarter={selectedQuarter} onQuarterChange={setSelectedQuarter}
        showRegion showOfftaker
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Export Volume (MTD)" value={`${latestVol.toLocaleString()} MT`} change="+6.8% MoM" isPositive={true} icon={Ship} iconBgColor="bg-sky-100" iconColor="text-sky-600" tooltip={{ mtd:`${latestVol.toLocaleString()} MT`, ytd:"42,180 MT", yoy:"+11.3%" }} />
        <KPICard title="On-Time Dispatch" value={`${onTimeRate}%`} change="+1.2pp MoM" isPositive={true} icon={CheckCircle} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd:`${onTimeRate}%`, ytd:"92.4%", yoy:"+2.4pp" }} />
        <KPICard title="Delayed Shipments" value={totalDelayed.toString()} change="-0.4pp MoM" isPositive={true} icon={AlertTriangle} iconBgColor="bg-red-100" iconColor="text-red-600" tooltip={{ mtd:`${totalDelayed}`, ytd:"3.1%", yoy:"-0.9pp" }} />
        <KPICard title="Export Cycle Time" value="18 days" change="-2 days MoM" isPositive={true} icon={Clock} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd:"18 days", ytd:"19.5 days", yoy:"-3 days" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Export Volume Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Metric Tonnes (MT) · {periodLabel}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: any) => `${v.toLocaleString()} MT`} />
              <Line type="monotone" dataKey="volume" name="Volume" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r:3, fill:"#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Dispatched vs Delayed Shipments</h2>
          <p className="text-xs text-gray-400 mb-4">Number of shipments · {periodLabel}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shipData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="dispatched" name="On-Time" stackId="a" fill="#10b981" />
              <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f87171" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Shipment Route Flow</h2>
          <p className="text-xs text-gray-400 mb-4">Origin → Destination · Sankey diagram</p>
          <SankeyChart />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Export Volume by Destination</h2>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { country:"Netherlands", volume:"1,580", color:"bg-violet-400" },
              { country:"Germany", volume:"1,240", color:"bg-pink-400" },
              { country:"USA", volume:"1,200", color:"bg-orange-400" },
              { country:"Malaysia", volume:"800", color:"bg-cyan-400" },
              { country:"UAE", volume:"540", color:"bg-amber-400" },
              { country:"Japan", volume:"460", color:"bg-emerald-400" },
            ].map(d => (
              <div key={d.country} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${d.color} flex-shrink-0`} />
                <div>
                  <div className="text-xs font-medium text-gray-700">{d.country}</div>
                  <div className="text-xs text-gray-400">{d.volume} MT</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOperations;
