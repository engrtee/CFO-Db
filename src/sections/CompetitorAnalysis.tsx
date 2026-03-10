import React, { useRef, useState } from "react";
import {
  Download
  
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart as ReRadarChart,
  Radar as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// ---------------- Mock Data ----------------
const fugazBanks = [
  {
    name: "First Bank",
    netIncome: 420,
    roe: 15.2,
    roa: 1.6,
    costToIncome: 52,
    npl: 4.2,
    liquidity: 120,
    casa: 65,
    capitalAdequacy: 17,
    assets: 32.5,
  },
  {
    name: "UBA",
    netIncome: 470,
    roe: 17.8,
    roa: 1.9,
    costToIncome: 49,
    npl: 3.8,
    liquidity: 128,
    casa: 68,
    capitalAdequacy: 18,
    assets: 35.4,
  },
  {
    name: "GTCO",
    netIncome: 490,
    roe: 20.1,
    roa: 2.1,
    costToIncome: 45,
    npl: 3.5,
    liquidity: 132,
    casa: 70,
    capitalAdequacy: 19,
    assets: 37.2,
  },
  {
    name: "Access Bank",
    netIncome: 455,
    roe: 16.5,
    roa: 1.8,
    costToIncome: 50,
    npl: 4.0,
    liquidity: 118,
    casa: 63,
    capitalAdequacy: 16,
    assets: 30.6,
  },
  {
    name: "GTBank",
    netIncome: 510,
    roe: 21.4,
    roa: 2.3,
    costToIncome: 44,
    npl: 3.1,
    liquidity: 135,
    casa: 72,
    capitalAdequacy: 20,
    assets: 38.8,
  },
];

const quarterlyTrends = [
  { quarter: "Q1 2023", Zenith: 450, GTCO: 420, Access: 380, UBA: 400, First: 360 },
  { quarter: "Q2 2023", Zenith: 460, GTCO: 430, Access: 390, UBA: 410, First: 370 },
  { quarter: "Q3 2023", Zenith: 480, GTCO: 440, Access: 400, UBA: 420, First: 380 },
  { quarter: "Q4 2023", Zenith: 500, GTCO: 460, Access: 415, UBA: 435, First: 395 },
  { quarter: "Q1 2024", Zenith: 510, GTCO: 470, Access: 420, UBA: 440, First: 400 },
  { quarter: "Q2 2024", Zenith: 525, GTCO: 480, Access: 430, UBA: 450, First: 410 },
  { quarter: "Q3 2024", Zenith: 540, GTCO: 490, Access: 440, UBA: 460, First: 420 },
  { quarter: "Q4 2024", Zenith: 560, GTCO: 500, Access: 450, UBA: 470, First: 430 },
];

// ---------------- Component ----------------
const CompetitorAnalysis: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState("GTBank");
  const [selectedQuarter, setSelectedQuarter] = useState("Q3 2024");
  const [role, setRole] = useState<"CFO" | "Analyst" | "Watcher">("CFO");
  const pdfRef = useRef<HTMLDivElement>(null);

  const peerMedian = (metric: keyof typeof fugazBanks[0]) => {
    const values = fugazBanks.map((b) => b[metric]);
    const sorted = [...values].sort((a, b) => Number(a) - Number(b));
    const mid = Math.floor(sorted.length / 2);
    return sorted[mid];
  };

  const selected = fugazBanks.find((b) => b.name === selectedBank)!;

  const kpis = [
    { label: "Net Income (₦M)", value: selected.netIncome, peer: peerMedian("netIncome") },
    { label: "ROE (%)", value: selected.roe, peer: peerMedian("roe") },
    { label: "ROA (%)", value: selected.roa, peer: peerMedian("roa") },
    { label: "Cost-to-Income (%)", value: selected.costToIncome, peer: peerMedian("costToIncome") },
    { label: "NPL Ratio (%)", value: selected.npl, peer: peerMedian("npl") },
    { label: "Liquidity Ratio (%)", value: selected.liquidity, peer: peerMedian("liquidity") },
  ];

  const getDeltaColor = (val: number, peer: number, invert = false) => {
    const better = invert ? val < peer : val > peer;
    return better ? "text-green-600" : "text-red-600";
  };

  const radarData = fugazBanks.map((b) => ({
    bank: b.name,
    ROE: b.roe,
    ROA: b.roa,
    NPL: 10 - b.npl,
    "Cost-to-Income": 100 - b.costToIncome,
    CASA: b.casa,
  }));

  const scatterData = fugazBanks.map((b) => ({
    bank: b.name,
    npl: b.npl,
    capitalAdequacy: b.capitalAdequacy,
    assets: b.assets * 10,
  }));

  // ---------------- Export Functions ----------------
  const exportToPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Competitor_Analysis_₦{selectedBank}.pdf`);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Bank", "Net Income", "ROE", "ROA", "Cost-to-Income", "NPL", "Liquidity"],
      ...fugazBanks.map(b =>
        [b.name, b.netIncome, b.roe, b.roa, b.costToIncome, b.npl, b.liquidity].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Competitor_Analysis_₦{selectedBank}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------- JSX ----------------
  return (
    <div ref={pdfRef} className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
        <div className="flex gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="CFO">CFO</option>
            <option value="Analyst">Analyst</option>
            <option value="Watcher">Watcher</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {fugazBanks.map((b) => (
            <option key={b.name}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {quarterlyTrends.map((q) => (
            <option key={q.quarter}>{q.quarter}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const invert = ["Cost-to-Income (%)", "NPL Ratio (%)"].includes(kpi.label);
          const deltaColor = getDeltaColor(kpi.value, kpi.peer, invert);
          const delta = (kpi.value - kpi.peer).toFixed(1);
          return (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="text-xs text-gray-500">{kpi.label}</div>
              <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
              <div className={`text-sm ₦{deltaColor}`}>
                {delta > 0 ? "+" : ""}
                {delta}% vs Peer
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h2>
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Rank</th>
              <th className="text-left">Bank</th>
              <th>Net Income (₦M)</th>
              <th>ROE (%)</th>
              <th>ROA (%)</th>
              <th>Cost-to-Income (%)</th>
              <th>NPL (%)</th>
              <th>Liquidity (%)</th>
            </tr>
          </thead>
          <tbody>
            {fugazBanks
              .sort((a, b) => b.netIncome - a.netIncome)
              .map((b, i) => (
                <tr key={b.name} className="border-b hover:bg-gray-50">
                  <td className="py-2">{i + 1}</td>
                  <td>{b.name}</td>
                  <td className="text-right">{b.netIncome}</td>
                  <td className="text-right">{b.roe}</td>
                  <td className="text-right">{b.roa}</td>
                  <td className="text-right">{b.costToIncome}</td>
                  <td className="text-right">{b.npl}</td>
                  <td className="text-right">{b.liquidity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h2>
        <ResponsiveContainer width="100%" height={350}>
          <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="bank" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <ReRadar name="Performance" dataKey="CASA" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.4} />
            <Legend />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Net Income Trends (8 Quarters)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={quarterlyTrends}>
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Zenith" stroke="#2563EB" />
            <Line type="monotone" dataKey="GTCO" stroke="#16A34A" />
            <Line type="monotone" dataKey="Access" stroke="#DF5622" />
            <Line type="monotone" dataKey="UBA" stroke="#EAB308" />
            <Line type="monotone" dataKey="First" stroke="#9333EA" />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter Plot */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          NPL vs Capital Adequacy (Bubble = Assets)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="npl" name="NPL Ratio" unit="%" />
            <YAxis dataKey="capitalAdequacy" name="Capital Adequacy" unit="%" />
            <ZAxis dataKey="assets" range={[100, 600]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatterData} fill="#2563EB" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
