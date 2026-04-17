import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, RefreshCw, Database, CheckCircle, XCircle,
  Clock, FileText, Server, AlertTriangle,
} from 'lucide-react';
import { useDb } from '../lib/DbContext';
import { getIngestionLog } from '../lib/api';

interface LogEntry {
  id: number;
  timestamp: string;
  filename: string;
  status: 'success' | 'error' | 'running';
  rows_ingested: number;
  duration_ms: number;
  message: string;
}

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
  const [log,       setLog]       = useState<LogEntry[]>([]);
  const [logLoading,setLogLoading]= useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const raw = await getIngestionLog();
      // Normalise API rows to match LogEntry shape
      const entries: LogEntry[] = raw.map((r: any, i: number) => ({
        id:            r.id ?? i + 1,
        timestamp:     r.uploaded_at
          ? new Date(r.uploaded_at).toLocaleString('en-NG')
          : new Date().toLocaleString('en-NG'),
        filename:      r.filename ?? '—',
        status:        (r.status === 'success' ? 'success' : r.status === 'error' ? 'error' : 'running') as LogEntry['status'],
        rows_ingested: r.rows_ingested ?? 0,
        duration_ms:   0,
        message:       r.message ?? r.state_loaded ?? '',
      }));
      setLog(entries);
    } catch {
      // API offline — leave log empty rather than showing stale mock
      setLog([]);
    } finally {
      setLogLoading(false);
    }
  }, []);

  // Load log on mount
  useEffect(() => { fetchLog(); }, [fetchLog]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const runningEntry: LogEntry = {
      id: Date.now(),
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
      const res = await fetch('/api/upload', { method: 'POST', body: form });

      if (res.ok) {
        const data = await res.json();
        await refresh();
        showToast(`✅ ${file.name} ingested — ${data.rows_ingested ?? 0} rows loaded.`);
      } else {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        showToast(`⚠️ Upload failed: ${err.message}`);
      }
    } catch {
      showToast('⚠️ API unavailable. Dashboard is in demo mode.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
      // Refresh log from API after upload attempt
      await fetchLog();
    }
  };

  const syncedStr = lastSynced.toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border text-gt-text bg-gt-card border-gt-green animate-fade-in">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gt-text uppercase tracking-wide">Admin / Data Ingestion</h1>
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
          <p className="text-lg font-bold text-gt-text">FinancialDB</p>
          <p className="text-xs text-gt-muted mt-1">postgresql://localhost:5432</p>
        </div>

        <div className="bg-gt-card border border-gt-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gt-muted" />
            <p className="text-xs font-semibold text-gt-muted uppercase tracking-wide">Last Sync</p>
          </div>
          <p className="text-lg font-bold text-gt-text">{syncedStr}</p>
          <p className="text-xs text-gt-muted mt-1">Today</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-gt-card border border-gt-border rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gt-text uppercase tracking-wide mb-1">Manual Data Upload</h2>
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
          <p className="text-sm font-medium text-gt-text mb-1">Click to select or drag & drop</p>
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
        <h2 className="text-sm font-bold text-gt-text uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => { await sync(); showToast('✅ Sync triggered — dashboard refreshed.'); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gt-orange hover:bg-gt-orangeD text-gt-text text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Trigger Sync
          </button>
          <button
            onClick={async () => { await reset(); showToast('🔁 Dashboard reset to pre-journal state.'); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gt-border text-gt-muted hover:text-gt-text hover:border-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            <Database className="w-3.5 h-3.5" />
            Reset to Before
          </button>
          <button
            onClick={() => refresh().then(() => showToast('✅ Dashboard data refreshed.'))}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gt-border text-gt-muted hover:text-gt-text hover:border-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
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
          <h2 className="text-sm font-bold text-gt-text uppercase tracking-wide">Ingestion Log</h2>
          {logLoading && <RefreshCw className="w-3.5 h-3.5 text-gt-orange animate-spin ml-1" />}
          <span className="ml-auto text-xs text-gt-muted">{log.length} entries</span>
          <button
            onClick={fetchLog}
            disabled={logLoading}
            className="flex items-center gap-1 text-xs text-gt-muted hover:text-gt-text transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
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
                  <td className="px-4 py-3 text-gt-text font-mono whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-4 py-3 text-gt-text whitespace-nowrap">{entry.filename}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-gt-text font-mono">
                    {entry.rows_ingested > 0 ? entry.rows_ingested.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gt-text font-mono">
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
