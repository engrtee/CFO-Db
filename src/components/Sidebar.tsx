import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Landmark, ShieldAlert, Droplets,
  Building2, Target, Activity, Users, ChevronLeft, ChevronRight,
  FileText, Settings2, PieChart, BarChart2, Layers, MapPin,
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
    label: 'Analytical Dimensions',
    items: [
      { path: '/sectoral-analysis',  icon: BarChart2, label: 'Sectoral Analysis'   },
      { path: '/portfolio-segments', icon: Layers,    label: 'Portfolio Segments'  },
      { path: '/regional-analysis',  icon: MapPin,    label: 'Regional Analysis'   },
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
      className={`${collapsed ? 'w-14' : 'w-60'} bg-[#D96000] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 border-r border-[#BA5000]`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-[#BA5000] flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gt-orange font-black text-sm leading-none">GT</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-xs font-bold uppercase tracking-widest leading-tight">PMIS</p>
            <p className="text-orange-200 text-xs truncate">Intelligence Solution</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="text-xs font-semibold text-orange-200 uppercase tracking-widest px-4 py-2">
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
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
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
      <div className="p-3 border-t border-[#BA5000]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
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
