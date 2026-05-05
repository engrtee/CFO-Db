import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import FinancialPerformance from '../components/cfo/FinancialPerformance';
import InvestmentPortfolio from '../components/cfo/InvestmentPortfolio';
import LiquidityCashFlow from '../components/cfo/LiquidityCashFlow';
import CapitalSolvency from '../components/cfo/CapitalSolvency';
import ProfitabilityAnalytics from '../components/cfo/ProfitabilityAnalytics';

interface CFODashboardProps {
  section: 'financial' | 'investment' | 'liquidity' | 'capital' | 'profitability';
}

const SECTION_MAP: Record<CFODashboardProps['section'], React.ReactNode> = {
  financial:    <FinancialPerformance />,
  investment:   <InvestmentPortfolio />,
  liquidity:    <LiquidityCashFlow />,
  capital:      <CapitalSolvency />,
  profitability: <ProfitabilityAnalytics />,
};

export const CFODashboard: React.FC<CFODashboardProps> = ({ section }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-lw-navy">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {SECTION_MAP[section]}
        </main>
      </div>
    </div>
  );
};

export default CFODashboard;
