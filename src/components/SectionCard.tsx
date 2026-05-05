import React, { useState } from 'react';
import { RefreshCw, TableProperties, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tableContent?: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  printable?: boolean;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title, subtitle, icon, children, tableContent,
  onRefresh, loading = false, printable = false, className = '',
}) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className={`bg-lw-darkCard border border-lw-darkBorder rounded-2xl overflow-hidden shadow-lg print-section ${className}`}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-lw-darkBorder flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-lw-red/15 flex items-center justify-center text-lw-red flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-lw-darkText uppercase tracking-wide truncate font-serif">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-lw-darkMuted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 no-print">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-lw-darkMuted hover:text-lw-gold hover:bg-lw-gold/10 rounded-lg transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-lw-gold' : ''}`} />
            </button>
          )}
          {printable && (
            <button
              onClick={() => window.print()}
              className="p-1.5 text-lw-darkMuted hover:text-lw-gold hover:bg-lw-gold/10 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
          {tableContent && (
            <button
              onClick={() => setShowTable((t) => !t)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                showTable
                  ? 'bg-lw-red text-white border-lw-red'
                  : 'text-lw-darkMuted border-lw-darkBorder hover:border-lw-gold hover:text-lw-gold'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Data</span>
              {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">{children}</div>

      {/* Expandable table */}
      {tableContent && showTable && (
        <div className="px-5 pb-5 border-t border-lw-darkBorder pt-4">
          <p className="text-xs font-semibold text-lw-darkMuted uppercase tracking-widest mb-3 font-sans">
            Source Data — {title}
          </p>
          {tableContent}
        </div>
      )}
    </div>
  );
};
