import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BankOverview         from './sections/BankOverview';
import FinancialPerformance from './sections/FinancialPerformance';
import BalanceSheet         from './sections/BalanceSheet';
import RiskAssetQuality     from './sections/RiskAssetQuality';
import LiquidityFunding     from './sections/LiquidityFunding';
import TreasuryMarketRisk   from './sections/TreasuryMarketRisk';
import BudgetVariance       from './sections/BudgetVariance';
import CostOperational      from './sections/CostOperational';
import SegmentInsights      from './sections/SegmentInsights';
import InvestorRelations    from './sections/InvestorRelations';
import CompetitorAnalysis   from './sections/CompetitorAnalysis';
import FinancialStatements  from './sections/FinancialStatements';
import AdminPage            from './sections/AdminPage';

const Dashboard: React.FC = () => (
  <div className="flex h-screen bg-gt-bg overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 bg-gt-bg">
        <Routes>
          <Route path="/"                      element={<BankOverview />} />
          <Route path="/financial-performance" element={<FinancialPerformance />} />
          <Route path="/balance-sheet"         element={<BalanceSheet />} />
          <Route path="/risk-quality"          element={<RiskAssetQuality />} />
          <Route path="/liquidity-funding"     element={<LiquidityFunding />} />
          <Route path="/treasury-market"       element={<TreasuryMarketRisk />} />
          <Route path="/budget-variance"       element={<BudgetVariance />} />
          <Route path="/cost-operational"      element={<CostOperational />} />
          <Route path="/segment-insights"      element={<SegmentInsights />} />
          <Route path="/investor"              element={<InvestorRelations />} />
          <Route path="/competitor"            element={<CompetitorAnalysis />} />
          <Route path="/financial-statements"  element={<FinancialStatements />} />
          <Route path="/admin"                 element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default Dashboard;
