import React, { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import KPICard from "../components/KPICard";
import PeriodFilter from "../components/PeriodFilter";
import { PackageSearch, TrendingUp, AlertTriangle, BarChart2 } from "lucide-react";

const inventoryData = [
  { month: "Oct", inventory: 1640, demand: 1500, reorder: 800 },
  { month: "Nov", inventory: 1480, demand: 1520, reorder: 800 },
  { month: "Dec", inventory: 1320, demand: 1600, reorder: 800 },
  { month: "Jan", inventory: 1560, demand: 1420, reorder: 800 },
  { month: "Feb", inventory: 1380, demand: 1480, reorder: 800 },
  { month: "Mar", inventory: 1240, demand: 1380, reorder: 800 },
];

const SAFETY_STOCK = 600;
const REORDER_LEVEL = 800;

// SVG Gauge Component
const GaugeChart: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
  const pct = Math.min(value / max, 1);
  const angle = -135 + pct * 270;
  const radius = 70;
  const cx = 100;
  const cy = 90;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleDeg: number) => {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return { x: centerX + r * Math.cos(a), y: centerY + r * Math.sin(a) };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToCartesian(cx, cy, radius - 15, angle);

  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-full" style={{ maxHeight: 130 }}>
      {/* Background arc */}
      <path d={describeArc(-135, 135)} fill="none" stroke="#f3f4f6" strokeWidth={14} strokeLinecap="round" />
      {/* Value arc */}
      <path d={describeArc(-135, -135 + pct * 270)} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#374151" />
      {/* Center text */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={18} fontWeight="700" fill="#111827">{(pct * 100).toFixed(0)}%</text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontSize={10} fill="#6b7280">{label}</text>
    </svg>
  );
};

const InventoryManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const currentInventory = 1240;
  const currentDemand = 1380;
  const coverageRatio = currentInventory / currentDemand;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stock levels, demand coverage, and reorder planning</p>
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
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Inventory Quantity" value="1,240 MT" change="-140 MT MoM"
          isPositive={false} icon={PackageSearch} iconBgColor="bg-amber-100" iconColor="text-amber-600"
          subtitle="Below reorder level" tooltip={{ mtd: "1,240 MT", ytd: "Avg 1,450 MT", yoy: "-8.7%" }}
        />
        <KPICard
          title="Current Demand (MO)" value="1,380 MT" change="+40 MT MoM"
          isPositive={false} icon={TrendingUp} iconBgColor="bg-blue-100" iconColor="text-blue-600"
          subtitle="Open orders + forecast" tooltip={{ mtd: "1,380 MT", ytd: "Avg 1,300 MT", yoy: "+6.2%" }}
        />
        <KPICard
          title="Coverage Ratio" value="89.9%" change="Below 100% ⚠"
          isPositive={false} icon={BarChart2} iconBgColor="bg-red-100" iconColor="text-red-600"
          subtitle="Stock-to-Demand" tooltip={{ mtd: "89.9%", ytd: "Avg 111.5%", yoy: "-14.6pp" }}
        />
        <KPICard
          title="Safety Stock" value="600 MT" change="Sufficient buffer"
          isPositive={true} icon={AlertTriangle} iconBgColor="bg-emerald-100" iconColor="text-emerald-600"
          subtitle="Reorder Level: 800 MT" tooltip={{ mtd: "600 MT", ytd: "600 MT", yoy: "No change" }}
        />
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Inventory below reorder level — immediate procurement action required</p>
          <p className="text-xs text-amber-600">Current stock: 1,240 MT · Reorder trigger: 800 MT · Safety stock: 600 MT</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Gauge */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Coverage Ratio Gauge</h2>
          <p className="text-xs text-gray-400 mb-4">Stock-to-Demand ratio · Target ≥ 100%</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full">
              <GaugeChart value={coverageRatio * 100} max={150} label="Coverage" color={coverageRatio >= 1 ? "#10b981" : coverageRatio >= 0.85 ? "#f59e0b" : "#ef4444"} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Critical</p>
              <p className="text-xs text-red-500">&lt; 85%</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">Warning</p>
              <p className="text-xs text-amber-500">85–100%</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-600 font-medium">Good</p>
              <p className="text-xs text-emerald-500">&gt; 100%</p>
            </div>
          </div>
        </div>

        {/* Inventory vs Demand Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Inventory vs Demand vs Reorder Level</h2>
          <p className="text-xs text-gray-400 mb-4">Metric Tonnes (MT) · 6 months</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 2000]} tickFormatter={(v) => `${v}`} />
              <Tooltip formatter={(v: any, n: string) => [`${v.toLocaleString()} MT`, n]} />
              <ReferenceLine y={REORDER_LEVEL} stroke="#f59e0b" strokeDasharray="5 3" label={{ value: "Reorder", position: "right", fontSize: 11, fill: "#f59e0b" }} />
              <ReferenceLine y={SAFETY_STOCK} stroke="#f87171" strokeDasharray="5 3" label={{ value: "Safety", position: "right", fontSize: 11, fill: "#f87171" }} />
              <Bar dataKey="inventory" name="Inventory" fill="#f59e0b" opacity={0.8} radius={[4, 4, 0, 0]}>
                {inventoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.inventory < REORDER_LEVEL ? "#fca5a5" : entry.inventory < 1400 ? "#fbbf24" : "#10b981"}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="demand" name="Demand" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Detail Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Inventory by Product Category</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Stock (MT)</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Demand (MT)</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Coverage</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Reorder?</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Value ($M)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { cat: "Cocoa Beans (Grade A)", stock: 620, demand: 700, value: 0.79 },
                { cat: "Cocoa Beans (Grade B)", stock: 380, demand: 420, value: 0.44 },
                { cat: "Cocoa Butter", stock: 140, demand: 180, value: 1.82 },
                { cat: "Cocoa Powder", stock: 100, demand: 80, value: 0.22 },
              ].map((row) => {
                const cov = (row.stock / row.demand) * 100;
                const needReorder = row.stock < row.demand * 0.7;
                return (
                  <tr key={row.cat} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-700">{row.cat}</td>
                    <td className="py-3 text-right text-gray-900 font-medium">{row.stock.toLocaleString()}</td>
                    <td className="py-3 text-right text-gray-600">{row.demand.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`text-sm font-bold ${cov >= 100 ? "text-emerald-600" : cov >= 85 ? "text-amber-600" : "text-red-600"}`}>
                        {cov.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {needReorder ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">⚠ Reorder</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">OK</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-900 font-medium">${row.value}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-gray-200">
              <tr>
                <td className="pt-3 font-bold text-gray-900">Total</td>
                <td className="pt-3 text-right font-bold text-gray-900">1,240</td>
                <td className="pt-3 text-right font-bold text-gray-600">1,380</td>
                <td className="pt-3 text-right font-bold text-amber-600">89.9%</td>
                <td></td>
                <td className="pt-3 text-right font-bold text-gray-900">$3.27M</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
