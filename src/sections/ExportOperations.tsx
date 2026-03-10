import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { Ship, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const momVolume = [
  { month: "Apr", volume: 3_800 },
  { month: "May", volume: 4_100 },
  { month: "Jun", volume: 3_950 },
  { month: "Jul", volume: 4_300 },
  { month: "Aug", volume: 4_600 },
  { month: "Sep", volume: 4_820 },
  { month: "Oct", volume: 5_050 },
  { month: "Nov", volume: 5_200 },
  { month: "Dec", volume: 4_900 },
  { month: "Jan", volume: 4_400 },
  { month: "Feb", volume: 4_650 },
  { month: "Mar", volume: 4_820 },
];

const dispatchData = [
  { month: "Oct", dispatched: 48, delayed: 4 },
  { month: "Nov", dispatched: 52, delayed: 5 },
  { month: "Dec", dispatched: 49, delayed: 7 },
  { month: "Jan", dispatched: 41, delayed: 3 },
  { month: "Feb", dispatched: 44, delayed: 4 },
  { month: "Mar", dispatched: 46, delayed: 3 },
];

// Simple Sankey-style SVG
const SankeyChart: React.FC = () => {
  const origins = [
    { label: "Ghana", color: "#f59e0b", y: 60, value: 1820 },
    { label: "Côte d'Ivoire", color: "#10b981", y: 160, value: 2100 },
    { label: "Nigeria", color: "#3b82f6", y: 260, value: 900 },
  ];
  const destinations = [
    { label: "Netherlands", color: "#8b5cf6", y: 80, value: 1580 },
    { label: "Germany", color: "#ec4899", y: 160, value: 1240 },
    { label: "USA", color: "#f97316", y: 240, value: 1200 },
    { label: "Malaysia", color: "#06b6d4", y: 320, value: 800 },
  ];

  return (
    <svg viewBox="0 0 520 400" className="w-full" style={{ maxHeight: 220 }}>
      {/* Origin bars */}
      {origins.map((o) => (
        <g key={o.label}>
          <rect x={10} y={o.y} width={18} height={60} fill={o.color} rx={3} opacity={0.85} />
          <text x={34} y={o.y + 34} fontSize={11} fill="#374151" fontWeight="600">{o.label}</text>
          <text x={34} y={o.y + 48} fontSize={10} fill="#9ca3af">{o.value.toLocaleString()} MT</text>
        </g>
      ))}

      {/* Destination bars */}
      {destinations.map((d) => (
        <g key={d.label}>
          <rect x={380} y={d.y} width={18} height={50} fill={d.color} rx={3} opacity={0.85} />
          <text x={404} y={d.y + 28} fontSize={11} fill="#374151" fontWeight="600">{d.label}</text>
          <text x={404} y={d.y + 42} fontSize={10} fill="#9ca3af">{d.value.toLocaleString()} MT</text>
        </g>
      ))}

      {/* Flow paths */}
      {origins.flatMap((o, oi) =>
        destinations.map((d, di) => {
          const opacity = 0.08 + (oi + di) * 0.03;
          return (
            <path
              key={`${o.label}-${d.label}`}
              d={`M 28 ${o.y + 30} C 195 ${o.y + 30}, 195 ${d.y + 25}, 380 ${d.y + 25}`}
              fill="none"
              stroke={o.color}
              strokeWidth={Math.max(2, (o.value / destinations.length / 500))}
              opacity={opacity + 0.3}
            />
          );
        })
      )}

      {/* Middle label */}
      <text x={200} y={195} fontSize={10} fill="#9ca3af" textAnchor="middle">Export Flow</text>
      <text x={200} y={208} fontSize={10} fill="#d1d5db" textAnchor="middle">by Route</text>
    </svg>
  );
};

// Simple destination map using SVG circles
const MapViz: React.FC = () => {
  const destinations = [
    { country: "Netherlands", x: 248, y: 105, volume: 1580, color: "#8b5cf6" },
    { country: "Germany", x: 252, y: 112, volume: 1240, color: "#ec4899" },
    { country: "USA", x: 140, y: 135, volume: 1200, color: "#f97316" },
    { country: "Malaysia", x: 360, y: 180, volume: 800, color: "#06b6d4" },
    { country: "UAE", x: 305, y: 155, volume: 540, color: "#f59e0b" },
    { country: "Japan", x: 400, y: 130, volume: 460, color: "#10b981" },
  ];

  return (
    <div className="relative w-full" style={{ paddingBottom: "50%" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden">
        <svg viewBox="0 0 500 250" className="w-full h-full opacity-40">
          {/* Very rough world map blob */}
          <ellipse cx="120" cy="170" rx="90" ry="55" fill="#10b981" opacity={0.3} />
          <ellipse cx="255" cy="130" rx="100" ry="45" fill="#3b82f6" opacity={0.25} />
          <ellipse cx="380" cy="155" rx="85" ry="50" fill="#f59e0b" opacity={0.25} />
          <ellipse cx="140" cy="135" rx="70" ry="38" fill="#8b5cf6" opacity={0.2} />
        </svg>
        <svg viewBox="0 0 500 250" className="absolute inset-0 w-full h-full">
          {destinations.map((d) => {
            const r = Math.max(8, Math.sqrt(d.volume) / 7);
            return (
              <g key={d.country}>
                <circle cx={d.x} cy={d.y} r={r} fill={d.color} opacity={0.7} />
                <circle cx={d.x} cy={d.y} r={r + 4} fill={d.color} opacity={0.15} />
                <text x={d.x} y={d.y - r - 4} textAnchor="middle" fontSize={9} fill="#374151" fontWeight="600">{d.country}</text>
                <text x={d.x} y={d.y + r + 11} textAnchor="middle" fontSize={8} fill="#6b7280">{d.volume.toLocaleString()} MT</text>
              </g>
            );
          })}
        </svg>
        <div className="absolute top-2 right-2 text-xs text-gray-400 font-medium">Export Volume by Destination</div>
      </div>
    </div>
  );
};

const ExportOperations: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Operations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Operational efficiency linked to revenue performance</p>
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
        <KPICard title="Export Volume (MTD)" value="4,820 MT" change="+6.8% MoM" isPositive={true} icon={Ship} iconBgColor="bg-sky-100" iconColor="text-sky-600" tooltip={{ mtd: "4,820 MT", ytd: "42,180 MT", yoy: "+11.3%" }} />
        <KPICard title="On-Time Dispatch" value="93.9%" change="+1.2pp MoM" isPositive={true} icon={CheckCircle} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" tooltip={{ mtd: "93.9%", ytd: "92.4%", yoy: "+2.4pp" }} />
        <KPICard title="Rejected Shipments" value="2.8%" change="-0.4pp MoM" isPositive={true} icon={AlertTriangle} iconBgColor="bg-red-100" iconColor="text-red-600" tooltip={{ mtd: "2.8%", ytd: "3.1%", yoy: "-0.9pp" }} />
        <KPICard title="Export Cycle Time" value="18 days" change="-2 days MoM" isPositive={true} icon={Clock} iconBgColor="bg-amber-100" iconColor="text-amber-600" tooltip={{ mtd: "18 days", ytd: "19.5 days", yoy: "-3 days" }} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MoM Volume */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Month-on-Month Export Volume</h2>
          <p className="text-xs text-gray-400 mb-4">Metric Tonnes (MT)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={momVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: any) => `${v.toLocaleString()} MT`} />
              <Line type="monotone" dataKey="volume" name="Volume" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dispatched vs Delayed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Dispatched vs Delayed Shipments</h2>
          <p className="text-xs text-gray-400 mb-4">Number of shipments</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dispatchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="dispatched" name="On-Time" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sankey + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Shipment Route Flow</h2>
          <p className="text-xs text-gray-400 mb-4">Origin → Destination · Sankey diagram</p>
          <SankeyChart />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Export Volume by Destination</h2>
          <MapViz />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { country: "Netherlands", volume: "1,580", color: "bg-violet-400" },
              { country: "Germany", volume: "1,240", color: "bg-pink-400" },
              { country: "USA", volume: "1,200", color: "bg-orange-400" },
              { country: "Malaysia", volume: "800", color: "bg-cyan-400" },
              { country: "UAE", volume: "540", color: "bg-amber-400" },
              { country: "Japan", volume: "460", color: "bg-emerald-400" },
            ].map((d) => (
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
