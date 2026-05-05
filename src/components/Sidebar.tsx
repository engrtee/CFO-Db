import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp, PieChart, Droplets, Shield, BarChart2,
  AlertTriangle, ChevronLeft, ChevronRight, Users, LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const CFO_NAV = [
  { path: '/cfo',                    icon: LayoutDashboard, label: 'Financial Performance' },
  { path: '/cfo/investment',         icon: PieChart,        label: 'Investment Portfolio'  },
  { path: '/cfo/liquidity',          icon: Droplets,        label: 'Liquidity & Cash Flow' },
  { path: '/cfo/capital',            icon: Shield,          label: 'Capital & Solvency'    },
  { path: '/cfo/profitability',      icon: BarChart2,       label: 'Profitability Analytics'},
  { path: '/cfo/risk',               icon: AlertTriangle,   label: 'Risk Dashboard'        },
];

const CEO_NAV = [
  { path: '/ceo',                    icon: LayoutDashboard, label: 'Group Summary'         },
  { path: '/ceo/subsidiaries',       icon: Users,           label: 'Subsidiary Matrix'     },
  { path: '/ceo/investments',        icon: PieChart,        label: 'Cash & Investments'    },
  { path: '/ceo/premiums',           icon: TrendingUp,      label: 'Premium Intelligence'  },
  { path: '/ceo/claims',             icon: BarChart2,       label: 'Claims Intelligence'   },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, canViewCFO, canViewCEO } = useAuthStore();

  const isCFO = canViewCFO();
  const isCEO = canViewCEO();
  const items = isCFO ? CFO_NAV : isCEO ? CEO_NAV : [];

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-56'} bg-lw-navy flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 border-r border-lw-darkBorder`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-lw-darkBorder flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-lw-red rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs leading-none">LW</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-lw-gold text-xs font-bold uppercase tracking-widest leading-tight font-sans">
              LEADWAY
            </p>
            <p className="text-lw-darkMuted text-xs truncate">Executive Dashboard</p>
          </div>
        )}
      </div>

      {/* User role badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-lw-darkBorder">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lw-red/20 rounded-full flex items-center justify-center text-lw-red text-xs font-bold">
              {user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-lw-darkText truncate">{user.displayName}</p>
              <p className="text-xs text-lw-darkMuted">{user.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {isCFO && !isCEO && (
          <p className={`text-xs font-semibold text-lw-darkMuted uppercase tracking-widest px-4 py-2 ${collapsed ? 'hidden' : ''}`}>
            CFO Dashboard
          </p>
        )}
        {isCEO && !isCFO && (
          <p className={`text-xs font-semibold text-lw-darkMuted uppercase tracking-widest px-4 py-2 ${collapsed ? 'hidden' : ''}`}>
            CEO Dashboard
          </p>
        )}
        {user?.role === 'SuperAdmin' && (
          <>
            <p className={`text-xs font-semibold text-lw-darkMuted uppercase tracking-widest px-4 py-2 ${collapsed ? 'hidden' : ''}`}>
              CFO View
            </p>
            {CFO_NAV.map((item) => <NavItem key={item.path} item={item} location={location} collapsed={collapsed} />)}
            <p className={`text-xs font-semibold text-lw-darkMuted uppercase tracking-widest px-4 py-2 mt-3 ${collapsed ? 'hidden' : ''}`}>
              CEO View
            </p>
            {CEO_NAV.map((item) => <NavItem key={item.path} item={item} location={location} collapsed={collapsed} />)}
          </>
        )}
        {user?.role !== 'SuperAdmin' && (
          <ul className="space-y-0.5 px-2">
            {items.map((item) => (
              <NavItem key={item.path} item={item} location={location} collapsed={collapsed} />
            ))}
          </ul>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-lw-darkBorder">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-lw-darkMuted hover:bg-lw-darkCard2 hover:text-lw-darkText transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span className="text-xs font-medium">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
};

function NavItem({
  item,
  location,
  collapsed,
}: {
  item: { path: string; icon: React.ElementType; label: string };
  location: { pathname: string };
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const isActive = location.pathname === item.path;
  return (
    <li>
      <Link
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${
          isActive
            ? 'bg-lw-red/20 text-lw-red border border-lw-red/30'
            : 'text-lw-darkMuted hover:bg-lw-darkCard2 hover:text-lw-darkText border border-transparent'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-lw-red' : 'text-lw-darkMuted group-hover:text-lw-gold'}`} />
        {!collapsed && (
          <span className="text-xs font-medium truncate">{item.label}</span>
        )}
      </Link>
    </li>
  );
}

export default Sidebar;
