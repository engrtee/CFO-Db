import React, { useState, useCallback } from 'react';
import { RefreshCw, RotateCcw, Bell, Settings, Database } from 'lucide-react';
import { useDb } from '../lib/DbContext';
import SyncModal from './SyncModal';

const Header: React.FC = () => {
  const { loading, lastSynced, currentState, usingMock, sync, reset, refresh } = useDb();
  const [syncOpen,  setSyncOpen]  = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSync = () => setSyncOpen(true);

  const handleSyncComplete = useCallback(async () => {
    setSyncOpen(false);
    try {
      const rows = await sync();
      showToast(`✅ Sync complete. ${rows ?? 0} GL lines ingested. Dashboard updated.`);
    } catch {
      showToast('⚠️ Sync ran but API unavailable — using mock data.', 'info');
    }
  }, [sync]);

  const handleReset = async () => {
    try {
      await reset();
      showToast('↺ Dashboard reset to pre-journal state.');
    } catch {
      await refresh();
      showToast('↺ Reset complete (mock mode).', 'info');
    }
  };

  const syncedStr = lastSynced.toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <>
      <SyncModal open={syncOpen} onComplete={handleSyncComplete} />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-40 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border transition-all animate-fade-in
          ${toast.type === 'success' ? 'bg-white border-gt-green text-gt-text' : 'bg-white border-gt-amber text-gt-amber'}`}
        >
          {toast.msg}
        </div>
      )}

      <header className="bg-gt-card border-b border-gt-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Left: GTBank wordmark + entity info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gt-orange rounded-lg flex items-center justify-center text-gt-text font-black text-base flex-shrink-0 leading-none">
                GT
              </div>
              <div className="min-w-0">
                <p className="text-gt-orange text-xs font-bold uppercase tracking-widest leading-tight hidden sm:block">
                  Performance Management Intelligence Solution
                </p>
                <p className="text-gt-muted text-xs hidden md:block truncate">
                  The Bank · NGN ₦ · December 2024
                </p>
              </div>
            </div>

            {/* DB status pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-gt-card2 border border-gt-border rounded-lg">
              <Database className="w-3 h-3 text-gt-muted" />
              {usingMock ? (
                <span className="text-xs text-gt-amber font-medium">Demo mode</span>
              ) : (
                <>
                  <span className="text-xs text-gt-muted">
                    {currentState === 'after' ? 'POST-JOURNAL' : 'PRE-JOURNAL'}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ml-1 ${
                    currentState === 'after' ? 'bg-gt-orange' : 'bg-gt-green'
                  }`} />
                </>
              )}
            </div>
          </div>

          {/* Right: timestamp + actions + user */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Last synced */}
            <span className="text-xs text-gt-muted hidden xl:block whitespace-nowrap">
              Last synced: <span className="text-gt-text font-medium">{syncedStr}</span>
            </span>

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gt-orange hover:bg-gt-orangeD text-gt-text text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync from CaseWare
            </button>

            {/* Reset button */}
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gt-border text-gt-muted hover:text-gt-text hover:border-gt-text text-xs font-medium rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>

            <button className="relative p-1.5 text-gt-muted hover:text-gt-text hover:bg-gt-card2 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gt-red rounded-full" />
            </button>
            <button className="p-1.5 text-gt-muted hover:text-gt-text hover:bg-gt-card2 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-gt-border ml-1">
              <div className="w-8 h-8 bg-gt-orange rounded-full flex items-center justify-center text-gt-text text-xs font-bold">
                AO
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gt-text leading-tight">Adaeze Okonkwo</p>
                <p className="text-xs text-gt-muted leading-tight">Group CFO</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
