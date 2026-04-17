/**
 * DbContext — fetches all dashboard data from the Express/PostgreSQL API.
 * Falls back to static mock data when the API server is not running.
 * The hook interface is identical in both modes so all section components
 * work without modification.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getDashboard, syncCaseware, resetDB } from './api';
import {
  financial_performance as mockFP, balance_sheet as mockBS,
  risk_indicators as mockRI, liquidity_metrics as mockLM,
  treasury_market as mockTM, budget_vs_actual as mockBVA,
  cost_metrics as mockCM, segment_insights as mockSI,
  FinancialPerformanceRow, BalanceSheetRow, RiskIndicatorRow,
  LiquidityMetricRow, TreasuryMarketRow, BudgetVsActualRow,
  CostMetricRow, SegmentInsightRow,
} from './mockDb';

export interface DbTables {
  financial_performance: FinancialPerformanceRow[];
  balance_sheet:         BalanceSheetRow[];
  risk_indicators:       RiskIndicatorRow[];
  liquidity_metrics:     LiquidityMetricRow[];
  treasury_market:       TreasuryMarketRow[];
  budget_vs_actual:      BudgetVsActualRow[];
  cost_metrics:          CostMetricRow[];
  segment_insights:      SegmentInsightRow[];
}

export interface DbContextValue {
  data:         DbTables;
  loading:      boolean;
  lastSynced:   Date;
  currentState: 'before' | 'after';
  usingMock:    boolean;        // true when API unavailable
  kpis:         Record<string, number>;
  refresh:      () => Promise<void>;
  sync:         () => Promise<number | undefined>;
  reset:        () => Promise<void>;
}

const MOCK_DATA: DbTables = {
  financial_performance: mockFP,
  balance_sheet:         mockBS,
  risk_indicators:       mockRI,
  liquidity_metrics:     mockLM,
  treasury_market:       mockTM,
  budget_vs_actual:      mockBVA,
  cost_metrics:          mockCM,
  segment_insights:      mockSI,
};

const DbContext = createContext<DbContextValue | null>(null);

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data,         setData]         = useState<DbTables>(MOCK_DATA);
  const [loading,      setLoading]      = useState(false);
  const [lastSynced,   setLastSynced]   = useState<Date>(new Date());
  const [currentState, setCurrentState] = useState<'before' | 'after'>('before');
  const [usingMock,    setUsingMock]    = useState(false);
  const [kpis,         setKpis]         = useState<Record<string, number>>({});

  const applyApiData = useCallback((payload: any) => {
    setData({
      financial_performance: payload.financial_performance,
      balance_sheet:         payload.balance_sheet,
      risk_indicators:       payload.risk_indicators,
      liquidity_metrics:     payload.liquidity_metrics,
      treasury_market:       payload.treasury_market,
      budget_vs_actual:      payload.budget_vs_actual,
      cost_metrics:          payload.cost_metrics,
      segment_insights:      payload.segment_insights,
    });
    setKpis(payload.kpis ?? {});
    setCurrentState(payload.state ?? 'before');
    setLastSynced(new Date(payload.lastSynced ?? Date.now()));
    setUsingMock(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await getDashboard();
      applyApiData(payload);
    } catch {
      // API unavailable → silent fallback to mock
      setUsingMock(true);
      setLastSynced(new Date());
    } finally {
      setLoading(false);
    }
  }, [applyApiData]);

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const res = await syncCaseware();
      const payload = await getDashboard();
      applyApiData(payload);
      return res.rowsIngested;
    } finally {
      setLoading(false);
    }
  }, [applyApiData]);

  const reset = useCallback(async () => {
    setLoading(true);
    try {
      await resetDB();
      const payload = await getDashboard();
      applyApiData(payload);
    } finally {
      setLoading(false);
    }
  }, [applyApiData]);

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <DbContext.Provider value={{ data, loading, lastSynced, currentState, usingMock, kpis, refresh, sync, reset }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = (): DbContextValue => {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb must be inside <DbProvider>');
  return ctx;
};
