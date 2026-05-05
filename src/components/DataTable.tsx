import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download } from 'lucide-react';

const PAGE_SIZE = 10;

function humanHeader(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'number') {
    if (!isFinite(value)) return '—';
    if (Math.abs(value) >= 1e9)
      return '₦' + (value / 1e9).toFixed(2) + 'bn';
    if (Math.abs(value) >= 1e6)
      return '₦' + (value / 1e6).toFixed(1) + 'm';
    if (Number.isInteger(value) && Math.abs(value) > 1000)
      return value.toLocaleString('en-NG');
    return value.toLocaleString('en-NG', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return String(value);
}

function exportCSV<T extends Record<string, unknown>>(rows: T[], cols: string[], filename: string) {
  const header = cols.map(humanHeader).join(',');
  const body = rows.map((r) => cols.map((c) => {
    const v = r[c];
    const s = formatCell(v);
    return s.includes(',') ? `"${s}"` : s;
  }).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface DataTableProps<T extends Record<string, unknown>> {
  rows: T[];
  columns?: string[];
  filename?: string;
  getRowClass?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  filename = 'export',
  getRowClass,
  onRowClick,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const cols = columns ?? (rows.length > 0 ? Object.keys(rows[0]).filter((k) => k !== 'id') : []);

  const sorted = useCallback(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sortCol, sortAsc]);

  const sortedRows = sorted();
  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc((a) => !a);
    else { setSortCol(col); setSortAsc(true); }
    setPage(0);
  };

  if (rows.length === 0)
    return <p className="text-sm text-lw-darkMuted py-4 text-center">No data available.</p>;

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => exportCSV(sortedRows, cols, filename)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lw-darkCard2 border border-lw-darkBorder text-lw-darkMuted hover:text-lw-gold hover:border-lw-gold text-xs font-medium rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-lw-darkBorder scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lw-darkCard2 border-b border-lw-darkBorder">
              {cols.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left text-xs font-semibold text-lw-darkMuted uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-lw-gold transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {humanHeader(col)}
                    {sortCol === col
                      ? sortAsc
                        ? <ChevronUp className="w-3 h-3 text-lw-gold" />
                        : <ChevronDown className="w-3 h-3 text-lw-gold" />
                      : <ChevronUp className="w-3 h-3 opacity-20" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-lw-darkBorder">
            {pageRows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-lw-red/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${getRowClass?.(row) ?? ''}`}
              >
                {cols.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-lw-darkText whitespace-nowrap font-mono text-xs">
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-xs text-lw-darkMuted">
            Rows {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of {sortedRows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-lw-darkCard2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-lw-darkMuted" />
            </button>
            <span className="text-xs text-lw-darkMuted min-w-[50px] text-center">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-lw-darkCard2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-lw-darkMuted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
