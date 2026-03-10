import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Ship,
  Droplets,
  LineChart,
  ShieldAlert,
  PackageSearch,
  Download,
  ChevronLeft,
  ChevronRight,
  Leaf,
  UploadCloud,
} from "lucide-react";
import { useData } from "../lib/dataContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { uploads } = useData();
  const uploadCount = Object.keys(uploads).length;

  const menuItems = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Overview",
      color: "text-blue-500",
    },
    {
      path: "/performance",
      icon: TrendingUp,
      label: "Performance",
      color: "text-emerald-500",
    },
    {
      path: "/exports",
      icon: Ship,
      label: "Export Operations",
      color: "text-sky-500",
    },
    {
      path: "/cashflow",
      icon: Droplets,
      label: "Cashflow & Liquidity",
      color: "text-cyan-500",
    },
    {
      path: "/forecasting",
      icon: LineChart,
      label: "Forecasting",
      color: "text-violet-500",
    },
    {
      path: "/risk",
      icon: ShieldAlert,
      label: "Risk Exposure",
      color: "text-rose-500",
    },
    {
      path: "/inventory",
      icon: PackageSearch,
      label: "Inventory",
      color: "text-amber-500",
    },
    {
      path: "/upload",
      icon: UploadCloud,
      label: "Data Upload",
      color: "text-teal-500",
      badge: uploadCount > 0 ? uploadCount : undefined,
    },
    {
      path: "/downloads",
      icon: Download,
      label: "Downloads",
      color: "text-gray-400",
    },
  ] as const;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gray-950 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-gray-800 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-amber-200" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">CocoaX Exports</h1>
            <p className="text-xs text-gray-500">CFO Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
            Modules
          </p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-amber-900/40 text-amber-300 border border-amber-800/50"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-amber-400" : (item as any).color
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  )}
                  {!collapsed && (item as any).badge !== undefined && (
                    <span className="ml-auto text-xs font-bold bg-teal-600 text-white px-1.5 py-0.5 rounded-full">
                      {(item as any).badge}
                    </span>
                  )}
                  {!collapsed && isActive && !(item as any).badge && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
