import React, { useState, useRef } from 'react';
import {
  Upload, RefreshCw, Database, CheckCircle, XCircle,
  Clock, FileText, Server, AlertTriangle,
} from 'lucide-react';
import { useDb } from '../lib/DbContext';

interface LogEntry {
  id: number;
  timestamp: string;
  filename: string;
  status: 'success' | 'error' | 'running';
  rows_ingested: number;
  duration_ms: number;
  message: string;
}

const MOCK_LOG: LogEntry[] = [
  { id: 5, timestamp: '2025-01-15 09:42:18', filename: 'test.xlsx',          status: 'success', rows_ingested: 312, duration_ms: 2840, message: 'All tables loaded. State: before.' },
  { id: 4, timestamp: '2025-01-14 17:05:33', filename: 'trial_balance.xlsx', status: 'error',   rows_ingested: 0,   duration_ms: 420,  message: 'Sheet "GL Data" not found in workbook.' },
  { id: 3, timestamp: '2025-01-13 11:20:11', filename: 'test.xlsx',          status: 'success', rows_ingested: 308, duration_ms: 2650, message: 'All tables loaded. State: before.' },
  { id: 2, timestamp: '2025-01-10 08:55:02', filename: 'q4_gtbank.xlsx',     status: 'success', rows_ingested: 318, duration_ms: 3120, message: 'All tables loaded. State: before.' },
  { id: 1, timestamp: '2025-01-08 14:30:45', filename: 'initial.xlsx',       status: 'success', rows_ingested: 295, duration_ms: 2580, message: 'Initial database population complete.' },
];

const StatusBadge: React.FC<{ status: LogEntry['status'] }> = ({ status }) => {
  if (status === 'success') return (
    <span className="flex items-center gap-1 text-gt-green text-xs font-semibold">
      <CheckCircle className="w-3.5 h-3.5" /> Success
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-gt-red text-xs font-semibold">
      <XCircle className="w-3.5 h-3.5" /> Error
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-gt-amber text-xs font-semibold">
      <Clock className="w-3.5 h-3.5 animate-spin" /> Running
    </span>
  );
};

const AdminPage: React.FC = () => {
  const { loading, lastSynced, usingMock, refresh, sync, reset } = useDb();
  const [log,       setLog]       = useState<LogEntry[]>(MOCK_LOG);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const runningEntry: LogEntry = {
      id: log.length + 1,
      timestamp: new Date().toLocaleString('en-NG'),
      filename: file.name,
      status: 'running',
      rows_ingested: 0,
      duration_ms: 0,
      message: 'Ingestion in progress…',
    };
    setLog(prev => [runningEntry, ...prev]);

    try {
      const form = new FormData();
      form.append('file', file);
      const start = Date.now();
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const dur = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const entry: LogEntry = {
          id: runningEntry.id,
          timestamp: new Date().toLocaleString('en-NG'),
          filename: file.name,
          status: 'success',
          rows_ingested: data.rows_ingested ?? 0,
          duration_ms: dur,
          message: data.message ?? 'Upload complete.',
        };
        setLog(prev => [entry, ...prev.slice(1)]);
        await refresh();
        showToast(`✅ ${file.name} ingested — ${entry.rows_ingested} rows loaded.`);
      } else {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        const entry: LogEntry = {
          id: runningEntry.id,
          timestamp: new Date().toLocaleString('en-NG'),
          filename: file.name,
          status: 'error',
          rows_ingested: 0,
          duration_ms: dur,
          message: err.message ?? 'Upload failed.',
        };
        setLog(prev => [entry, ...prev.slice(1)]);
        showToast(`⚠️ Upload failed: ${err.message}`);
      }
    } catch {
      const entry: LogEntry = {
        id: runningEntry.id,
        timestamp: new Date().toLocaleString('en-NG'),
        filename: file.name,
        status: 'error',
        rows_ingested: 0,
        duration_ms: 0,
        message: 'API server unavailable — running in demo mode.',
      };
      setLog(prev => [entry, ...prev.slice(1)]);
      showToast('⚠️ API unavailable. Dashboard is in demo mode.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const syncedStr = lastSynced.toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border text-white bg-gt-card border-gt-green animate-fade-in">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white uppercase tracking-wide">Admin / Data Ingestion</h1>
          <p className="text-xs text-gt-muted mt-0.5">Manage GL data ingestion and database state</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gt-card border border-gt-border rounded-xl">
          <Database className="w-4 h-4 text-gt-muted" />
          {usingMock ? (
            <span className="text-xs text-gt-amber font-semibold">Demo mode — API server not running</span>
          ) : (
            <span className="text-xs text-gt-green font-semibold">Live — PostgreSQL connected</span>
          )}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gt-card border border-gt-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-gt-muted" />
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-wide">API Server</p>
          </div>
          <p className={`text-lg font-bold ${usingMock ? 'text-gt-amber' : 'text-gt-green'}`}>
            {usingMock ? 'Offline' : 'Online'}
          </p>
          <p className="text-xs text-gt-muted mt-1">localhost:4000</p>
        </div>

        <div className="bg-gt-card border border-gt-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-gt-muted" />
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-wide">Database</p>
          </div>
          <p className="text-lg font-bold text-white">FinancialDB</p>
          <p className="text-xs text-gt-muted mt-1">postgresql://localhost:5432</p>
        </div>

        <div className="bg-gt-card border border-gt-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gt-muted" />
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-wide">Last Sync</p>
          </div>
          <p className="text-lg font-bold text-white">{syncedStr}</p>
          <p className="text-xs text-gt-muted mt-1">Today</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-gt-card border border-gt-border rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Manual Data Upload</h2>
        <p className="text-xs text-gt-muted mb-4">
          Upload a CaseWare Excel export (.xlsx) to re-ingest the GL. Requires the API server and Python
          <code className="ml-1 px-1.5 py-0.5 bg-gt-card2 text-gt-orange rounded text-xs font-mono">ingest_data.py</code>
          to be running.
        </p>

        <div
          className="border-2 border-dashed border-gt-border hover:border-gt-orange rounded-2xl p-8 text-center cursor-pointer transition-colors group"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gt-muted group-hover:text-gt-orange mx-auto mb-3 transition-colors" />
          <p className="text-sm font-medium text-white mb-1">Click to select or drag & drop</p>
          <p className="text-xs text-gt-muted">Accepts .xlsx files exported from CaseWare</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />

        {uploading && (
          <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-gt-orange/10 border border-gt-orange/30 rounded-xl">
            <RefreshCw className="w-4 h-4 text-gt-orange animate-spin" />
            <span className="text-sm text-gt-orange font-medium">Uploading and ingesting data…</span>
          </div>
        )}

        <div className="flex items-start gap-2 mt-4">
          <AlertTriangle className="w-4 h-4 text-gt-amber flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gt-muted">
            Uploading will overwrite the existing "before" state GL data and reset the dashboard
            to pre-journal balances. Run <code className="px-1 bg-gt-card2 text-gt-orange rounded font-mono">python ingest_data.py</code> from
            the project root to ingest directly on the server.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gt-card border border-gt-border rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => { await sync(); showToast('✅ Sync triggered — dashboard refreshed.'); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gt-orange hover:bg-gt-orangeD text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Trigger Sync
          </button>
          <button
            onClick={async () => { await reset(); showToast('🔁 Dashboard reset to pre-journal state.'); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gt-border text-gt-muted hover:text-white hover:border-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            <Database className="w-3.5 h-3.5" />
            Reset to Before
          </button>
          <button
            onClick={() => refresh().then(() => showToast('✅ Dashboard data refreshed.'))}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gt-border text-gt-muted hover:text-white hover:border-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Ingestion log */}
      <div className="bg-gt-card border border-gt-border rounded-2xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gt-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-gt-muted" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Ingestion Log</h2>
          <span className="ml-auto text-xs text-gt-muted">{log.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gt-card2 border-b border-gt-border">
                {['#', 'Timestamp', 'File', 'Status', 'Rows', 'Duration', 'Message'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gt-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gt-border">
              {log.map(entry => (
                <tr key={entry.id} className="hover:bg-gt-card2 transition-colors">
                  <td className="px-4 py-3 text-gt-muted font-mono">{entry.id}</td>
                  <td className="px-4 py-3 text-white font-mono whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{entry.filename}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-white font-mono">
                    {entry.rows_ingested > 0 ? entry.rows_ingested.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono">
                    {entry.duration_ms > 0 ? `${(entry.duration_ms / 1000).toFixed(2)}s` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gt-muted max-w-xs truncate">{entry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
