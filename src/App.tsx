import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import CFODashboard from './pages/CFODashboard';
import CEODashboard from './pages/CEODashboard';
import RiskDashboard from './pages/RiskDashboard';

function ProtectedCFO({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, canViewCFO } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canViewCFO()) return <Navigate to="/ceo" replace />;
  return <>{children}</>;
}

function ProtectedCEO({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, canViewCEO } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canViewCEO()) return <Navigate to="/cfo" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'CEO' ? '/ceo' : '/cfo'} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* CFO routes */}
        <Route path="/cfo" element={<ProtectedCFO><CFODashboard section="financial" /></ProtectedCFO>} />
        <Route path="/cfo/investment" element={<ProtectedCFO><CFODashboard section="investment" /></ProtectedCFO>} />
        <Route path="/cfo/liquidity" element={<ProtectedCFO><CFODashboard section="liquidity" /></ProtectedCFO>} />
        <Route path="/cfo/capital" element={<ProtectedCFO><CFODashboard section="capital" /></ProtectedCFO>} />
        <Route path="/cfo/profitability" element={<ProtectedCFO><CFODashboard section="profitability" /></ProtectedCFO>} />
        <Route path="/cfo/risk" element={<ProtectedCFO><RiskDashboard /></ProtectedCFO>} />

        {/* CEO routes */}
        <Route path="/ceo" element={<ProtectedCEO><CEODashboard section="summary" /></ProtectedCEO>} />
        <Route path="/ceo/subsidiaries" element={<ProtectedCEO><CEODashboard section="subsidiaries" /></ProtectedCEO>} />
        <Route path="/ceo/investments" element={<ProtectedCEO><CEODashboard section="investments" /></ProtectedCEO>} />
        <Route path="/ceo/premiums" element={<ProtectedCEO><CEODashboard section="premiums" /></ProtectedCEO>} />
        <Route path="/ceo/claims" element={<ProtectedCEO><CEODashboard section="claims" /></ProtectedCEO>} />

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
