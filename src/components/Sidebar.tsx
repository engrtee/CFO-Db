import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Landmark, ShieldAlert, Droplets,
  Building2, Target, Activity, Users, ChevronLeft, ChevronRight,
  FileText, Settings2, PieChart,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/',                icon: LayoutDashboard, label: 'Dashboard Overview' },
      { path: '/investor',        icon: PieChart,        label: 'Investor Relations' },
      { path: '/competitor',      icon: TrendingUp,      label: 'Competitor Analysis' },
    ],
  },
  {
    label: 'Financials',
    items: [
      { path: '/financial-performance', icon: TrendingUp,   label: 'Financial Performance' },
      { path: '/balance-sheet',         icon: Landmark,     label: 'Balance Sheet' },
      { path: '/budget-variance',       icon: Target,       label: 'Budget vs Actual' },
    ],
  },
  {
    label: 'Risk & Treasury',
    items: [
      { path: '/risk-quality',      icon: ShieldAlert, label: 'Risk & Asset Quality' },
      { path: '/liquidity-funding', icon: Droplets,    label: 'Liquidity & Funding' },
      { path: '/treasury-market',   icon: Building2,   label: 'Treasury & Market Risk' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/cost-operational',  icon: Activity, label: 'Cost & Operations' },
      { path: '/segment-insights',  icon: Users,    label: 'Segment Insights' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/financial-statements', icon: FileText,   label: 'Financial Statements' },
      { path: '/admin',                icon: Settings2,  label: 'Admin / Data Ingestion' },
    ],
  },
] as const;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} bg-black flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gt-border`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-gt-border flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gt-orange rounded-lg flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          GT
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-gt-orange text-xs font-bold uppercase tracking-widest leading-tight">GTBank</p>
            <p className="text-gt-muted text-xs truncate">CFO Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="text-xs font-semibold text-gt-border uppercase tracking-widest px-4 py-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${
                        isActive
                          ? 'bg-gt-orange/15 text-gt-orange border-l-2 border-gt-orange'
                          : 'text-gt-muted hover:bg-gt-card hover:text-white border-l-2 border-transparent'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gt-orange' : 'text-gt-muted group-hover:text-white'}`} />
                      {!collapsed && (
                        <span className="text-xs font-medium truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gt-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gt-muted hover:bg-gt-card hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span className="text-xs font-medium">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
