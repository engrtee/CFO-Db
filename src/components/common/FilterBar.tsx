import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import type { SubsidiaryCode, TimePeriod } from '../../types/subsidiary.types';

const SUBSIDIARIES: { code: SubsidiaryCode; label: string }[] = [
  { code: 'ALL', label: 'All Group' },
  { code: 'LWL', label: 'Leadway Life' },
  { code: 'LWG', label: 'Leadway General' },
  { code: 'LWC', label: 'Leadway Capital' },
  { code: 'LWH', label: 'Leadway Health' },
  { code: 'LWT', label: 'Leadway Hotels' },
  { code: 'LWP', label: 'Leadway Properties' },
  { code: 'LWN', label: 'Leadway Pensure' },
];

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'MTD', label: 'MTD' },
  { value: 'QTD', label: 'QTD' },
  { value: 'YTD', label: 'YTD' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const FilterBar: React.FC = () => {
  const {
    subsidiaryCode, timePeriod, currency, lastRefreshed,
    setSubsidiary, setTimePeriod, setCurrency, refresh,
  } = useFilterStore();

  const syncedStr = lastRefreshed.toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Period */}
      <div className="flex items-center gap-1 bg-lw-darkCard2 border border-lw-darkBorder rounded-lg p-1">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimePeriod(value)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              timePeriod === value
                ? 'bg-lw-red text-white'
                : 'text-lw-darkMuted hover:text-lw-darkText'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subsidiary */}
      <select
        value={subsidiaryCode}
        onChange={(e) => setSubsidiary(e.target.value as SubsidiaryCode)}
        className="bg-lw-darkCard2 border border-lw-darkBorder text-lw-darkText text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-lw-gold transition-colors"
      >
        {SUBSIDIARIES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>

      {/* Currency */}
      <div className="flex items-center gap-1 bg-lw-darkCard2 border border-lw-darkBorder rounded-lg p-1">
        {(['NGN', 'USD'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              currency === c
                ? 'bg-lw-gold/20 text-lw-gold'
                : 'text-lw-darkMuted hover:text-lw-darkText'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Last refreshed + refresh button */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-lw-darkMuted hidden xl:block">Updated: {syncedStr}</span>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lw-darkCard2 border border-lw-darkBorder text-lw-darkMuted hover:text-lw-gold hover:border-lw-gold text-xs rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
