import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./sections/Overview";
import PerformanceManagement from "./sections/PerformanceManagement";
import ExportOperations from "./sections/ExportOperations";
import CashflowLiquidity from "./sections/CashflowLiquidity";
import ForecastingScenario from "./sections/ForecastingScenario";
import RiskExposure from "./sections/RiskExposure";
import InventoryManagement from "./sections/InventoryManagement";
import DataUpload from "./sections/DataUpload";
import DownloadCenter from "./sections/DownloadCenter";

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/performance" element={<PerformanceManagement />} />
            <Route path="/exports" element={<ExportOperations />} />
            <Route path="/cashflow" element={<CashflowLiquidity />} />
            <Route path="/forecasting" element={<ForecastingScenario />} />
            <Route path="/risk" element={<RiskExposure />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/downloads" element={<DownloadCenter />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
