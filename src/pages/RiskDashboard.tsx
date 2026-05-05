import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import InsuranceRisk from '../components/risk/InsuranceRisk';
import MarketRisk from '../components/risk/MarketRisk';
import CreditRisk from '../components/risk/CreditRisk';
import LiquidityRisk from '../components/risk/LiquidityRisk';
import OperationalRisk from '../components/risk/OperationalRisk';
import ComplianceStatus from '../components/risk/ComplianceStatus';

type RiskTab = 'insurance' | 'market' | 'credit' | 'liquidity' | 'operational' | 'compliance';

const TABS: { id: RiskTab; label: string }[] = [
  { id: 'insurance',   label: 'Insurance Risk' },
  { id: 'market',      label: 'Market Risk' },
  { id: 'credit',      label: 'Credit Risk' },
  { id: 'liquidity',   label: 'Liquidity Risk' },
  { id: 'operational', label: 'Operational Risk' },
  { id: 'compliance',  label: 'Compliance Status' },
];

const TAB_CONTENT: Record<RiskTab, React.ReactNode> = {
  insurance:   <InsuranceRisk />,
  market:      <MarketRisk />,
  credit:      <CreditRisk />,
  liquidity:   <LiquidityRisk />,
  operational: <OperationalRisk />,
  compliance:  <ComplianceStatus />,
};

export const RiskDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RiskTab>('insurance');

  return (
    <div className="flex h-screen overflow-hidden bg-lw-navy">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="px-5 pt-4 border-b border-lw-darkBorder flex-shrink-0 bg-lw-darkCard no-print">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
            <span className="text-xs font-bold text-lw-red uppercase tracking-widest mr-3 flex-shrink-0">
              Risk Dashboard
            </span>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === id
                    ? 'text-lw-red border-lw-red bg-lw-red/10'
                    : 'text-lw-darkMuted border-transparent hover:text-lw-darkText hover:border-lw-darkBorder'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {TAB_CONTENT[activeTab]}
        </main>
      </div>
    </div>
  );
};

export default RiskDashboard;
