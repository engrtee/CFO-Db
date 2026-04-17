import React, { useState } from 'react';
import { RefreshCw, TableProperties, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  lastSynced: Date;
  loading: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  tableContent?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title, subtitle, icon, lastSynced, loading, onRefresh, children, tableContent,
}) => {
  const [showTable, setShowTable] = useState(false);

  const syncedStr = lastSynced.toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="bg-gt-card border border-gt-border rounded-2xl overflow-hidden shadow-lg">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 border-b border-gt-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gt-orange/15 flex items-center justify-center text-gt-orange flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs text-gt-muted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-gt-muted hidden xl:block whitespace-nowrap">
            Synced: {syncedStr}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh data"
            className="p-1.5 text-gt-muted hover:text-gt-orange hover:bg-gt-orange/10 rounded-lg transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gt-orange' : ''}`} />
          </button>

          {tableContent && (
            <button
              onClick={() => setShowTable((t) => !t)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                showTable
                  ? 'bg-gt-orange text-white border-gt-orange'
                  : 'text-gt-muted border-gt-border hover:border-gt-orange hover:text-gt-orange'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Table</span>
              {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Chart area ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4">{children}</div>

      {/* ── Expandable table ─────────────────────────────────────────────── */}
      {tableContent && showTable && (
        <div className="px-5 pb-5 border-t border-gt-border pt-4">
          <p className="text-xs font-semibold text-gt-muted uppercase tracking-widest mb-3">
            Source GL Data — {title}
          </p>
          {tableContent}
        </div>
      )}
    </div>
  );
};
