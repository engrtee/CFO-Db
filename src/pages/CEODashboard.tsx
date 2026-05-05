import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import GroupExecutiveSummary from '../components/ceo/GroupExecutiveSummary';
import SubsidiaryMatrix from '../components/ceo/SubsidiaryMatrix';
import CashInvestmentIntelligence from '../components/ceo/CashInvestmentIntelligence';
import PremiumIntelligence from '../components/ceo/PremiumIntelligence';
import ClaimsIntelligence from '../components/ceo/ClaimsIntelligence';

interface CEODashboardProps {
  section: 'summary' | 'subsidiaries' | 'investments' | 'premiums' | 'claims';
}

const SECTION_MAP: Record<CEODashboardProps['section'], React.ReactNode> = {
  summary:       <GroupExecutiveSummary />,
  subsidiaries:  <SubsidiaryMatrix />,
  investments:   <CashInvestmentIntelligence />,
  premiums:      <PremiumIntelligence />,
  claims:        <ClaimsIntelligence />,
};

export const CEODashboard: React.FC<CEODashboardProps> = ({ section }) => {
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

export default CEODashboard;
