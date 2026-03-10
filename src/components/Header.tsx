import React from 'react';
import { Search, Bell, Settings, Upload, Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const now = new Date('2026-03-09T17:43:33+01:00');
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left: Search */}
        <div className="flex items-center gap-4 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search metrics, reports..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Center: Date */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>{dateStr}</span>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-xl transition-colors">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Data</span>
          </button>

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-semibold text-gray-800">Amara Osei</div>
              <div className="text-xs text-gray-400">Group CFO</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
