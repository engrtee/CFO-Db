import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAlertStore } from '../store/alertStore';
import { FilterBar } from './common/FilterBar';
import { AlertPanel } from './common/AlertPanel';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { redCount, unacknowledgedCount, togglePanel, isOpen } = useAlertStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AlertPanel />
      <header className="bg-lw-darkCard border-b border-lw-darkBorder px-4 py-3 flex-shrink-0 no-print">
        <div className="flex items-center gap-3 flex-wrap justify-between">

          {/* Left: Logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-lw-red rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-xs">LW</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-lw-gold text-xs font-bold uppercase tracking-widest leading-tight font-sans">
                  Leadway Assurance Group
                </p>
                <p className="text-lw-darkMuted text-xs">Executive Dashboard System · Nigeria</p>
              </div>
            </div>
          </div>

          {/* Centre: Filter bar */}
          <div className="flex-1 min-w-0 mx-4 hidden lg:flex">
            <div className="w-full max-w-2xl">
              <FilterBar />
            </div>
          </div>

          {/* Right: alerts + user + logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Alert bell */}
            <button
              onClick={togglePanel}
              className={`relative p-2 rounded-lg transition-colors ${
                isOpen ? 'bg-lw-red/20 text-lw-red' : 'text-lw-darkMuted hover:text-lw-darkText hover:bg-lw-darkCard2'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unacknowledgedCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-xs font-bold text-white px-0.5
                  ${redCount > 0 ? 'bg-lw-danger' : 'bg-lw-amber'}`}
                >
                  {unacknowledgedCount}
                </span>
              )}
            </button>

            {/* User */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-lw-darkBorder">
                <div className="w-8 h-8 bg-lw-red/20 rounded-full flex items-center justify-center text-lw-red text-xs font-bold">
                  {user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-lw-darkText leading-tight">{user.displayName}</p>
                  <p className="text-xs text-lw-darkMuted leading-tight">{user.title}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-lw-darkMuted hover:text-lw-danger hover:bg-lw-danger/10 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter bar */}
        <div className="mt-3 lg:hidden">
          <FilterBar />
        </div>
      </header>
    </>
  );
};

export default Header;
