import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

function humanHeader(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    if (!isFinite(value)) return '—';
    if (Number.isInteger(value) && Math.abs(value) > 1000)
      return value.toLocaleString('en-NG');
    return value.toLocaleString('en-NG', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return String(value);
}

interface DataTableProps<T extends Record<string, unknown>> {
  rows: T[];
  columns?: string[];
}

export function DataTable<T extends Record<string, unknown>>({ rows, columns }: DataTableProps<T>) {
  const [page, setPage] = useState(0);

  const cols = columns ?? (rows.length > 0 ? Object.keys(rows[0]).filter((k) => k !== 'id') : []);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);

  if (rows.length === 0)
    return <p className="text-sm text-gt-muted py-4 text-center">No data available.</p>;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gt-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gt-card2 border-b border-gt-border">
              {cols.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap"
                >
                  {humanHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gt-border">
            {pageRows.map((row, i) => (
              <tr key={i} className="hover:bg-gt-orange/5 transition-colors">
                {cols.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-white whitespace-nowrap font-mono text-xs">
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
          <span className="text-xs text-gt-muted">
            Rows {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-gt-card2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gt-muted" />
            </button>
            <span className="text-xs text-gt-muted min-w-[50px] text-center">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-gt-card2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gt-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
