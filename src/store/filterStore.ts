import { create } from 'zustand';
import type { SubsidiaryCode, TimePeriod, Currency } from '../types/subsidiary.types';

interface FilterState {
  subsidiaryCode: SubsidiaryCode;
  timePeriod: TimePeriod;
  customDateFrom: string;
  customDateTo: string;
  currency: Currency;
  lastRefreshed: Date;

  setSubsidiary: (code: SubsidiaryCode) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setCustomDateRange: (from: string, to: string) => void;
  setCurrency: (currency: Currency) => void;
  refresh: () => void;

  // Derived helpers
  getActivePeriodLabel: () => string;
  getAccountingPeriod: () => string;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  subsidiaryCode: 'ALL',
  timePeriod: 'YTD',
  customDateFrom: '2025-01-01',
  customDateTo: '2025-04-30',
  currency: 'NGN',
  lastRefreshed: new Date(),

  setSubsidiary: (code) => set({ subsidiaryCode: code }),
  setTimePeriod: (period) => set({ timePeriod: period }),
  setCustomDateRange: (from, to) => set({ customDateFrom: from, customDateTo: to, timePeriod: 'CUSTOM' }),
  setCurrency: (currency) => set({ currency }),
  refresh: () => set({ lastRefreshed: new Date() }),

  getActivePeriodLabel: () => {
    const { timePeriod, customDateFrom, customDateTo } = get();
    if (timePeriod === 'CUSTOM') return `${customDateFrom} – ${customDateTo}`;
    return timePeriod;
  },

  getAccountingPeriod: () => {
    const { timePeriod } = get();
    if (timePeriod === 'MTD') return '2025-04';
    if (timePeriod === 'QTD') return '2025-Q1';
    if (timePeriod === 'YTD') return '2025-YTD';
    return '2025-04';
  },
}));
