import React from 'react';
import { Filter } from 'lucide-react';

interface PeriodFilterProps {
  selectedPeriod: 'monthly' | 'quarterly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'quarterly' | 'yearly') => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedMonth?: number;
  onMonthChange?: (month: number) => void;
  selectedQuarter?: number;
  onQuarterChange?: (quarter: number) => void;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  selectedOfftaker?: string;
  onOfftakerChange?: (offtaker: string) => void;
  showComparison?: boolean;
  comparisonEnabled?: boolean;
  onComparisonToggle?: (enabled: boolean) => void;
  showRegion?: boolean;
  showOfftaker?: boolean;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const regions = ['All Regions', 'West Africa', 'East Africa', 'Europe', 'Asia', 'Americas'];
const offtakers = ['All Offtakers', 'Cargill', 'Barry Callebaut', 'Olam', 'Touton', 'Ecom Trading'];

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedYear,
  onYearChange,
  selectedMonth = 1,
  onMonthChange,
  selectedQuarter = 1,
  onQuarterChange,
  selectedRegion = 'All Regions',
  onRegionChange,
  selectedOfftaker = 'All Offtakers',
  onOfftakerChange,
  showComparison = false,
  comparisonEnabled = false,
  onComparisonToggle,
  showRegion = false,
  showOfftaker = false,
}) => {
  const years = [2023, 2024, 2025, 2026];
  const quarters = [1, 2, 3, 4];

  const periods: { key: 'monthly' | 'quarterly' | 'yearly'; label: string }[] = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const selectClass = "px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />

      {/* Period toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onPeriodChange(key)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              selectedPeriod === key
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Year */}
      <select value={selectedYear} onChange={(e) => onYearChange(Number(e.target.value))} className={selectClass}>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>

      {/* Month (if monthly) */}
      {selectedPeriod === 'monthly' && onMonthChange && (
        <select value={selectedMonth} onChange={(e) => onMonthChange(Number(e.target.value))} className={selectClass}>
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      )}

      {/* Quarter (if quarterly) */}
      {selectedPeriod === 'quarterly' && onQuarterChange && (
        <select value={selectedQuarter} onChange={(e) => onQuarterChange(Number(e.target.value))} className={selectClass}>
          {quarters.map((q) => <option key={q} value={q}>Q{q}</option>)}
        </select>
      )}

      {/* Region */}
      {showRegion && onRegionChange && (
        <select value={selectedRegion} onChange={(e) => onRegionChange(e.target.value)} className={selectClass}>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      )}

      {/* Offtaker */}
      {showOfftaker && onOfftakerChange && (
        <select value={selectedOfftaker} onChange={(e) => onOfftakerChange(e.target.value)} className={selectClass}>
          {offtakers.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {/* Comparison toggle */}
      {showComparison && onComparisonToggle && (
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={comparisonEnabled}
            onChange={(e) => onComparisonToggle(e.target.checked)}
            className="w-4 h-4 accent-amber-700 rounded"
          />
          <span className="text-sm text-gray-600 font-medium">vs Prior Period</span>
        </label>
      )}
    </div>
  );
};

export default PeriodFilter;
