// API client — all calls proxy through Vite to http://localhost:4000
// Swap the base URL here when deploying to a real backend.

const BASE = '/api';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export interface AppState {
  active_state: 'before' | 'after';
  last_synced: string;
}

export const getState    = ()       => req<AppState>('/state');
export const syncDB      = ()       => req<AppState & { success: boolean }>('/sync',  { method: 'POST' });
export const syncCaseware= ()       => req<AppState & { success: boolean; rowsIngested?: number }>('/sync-caseware', { method: 'POST' });
export const resetDB     = ()       => req<AppState & { success: boolean }>('/reset-state', { method: 'POST' });
export const getDashboard= ()       => req<any>('/dashboard');
export const getFS       = ()       => req<any>('/financial-statements');
export const getGLRows   = ()       => req<any>('/gl-balances');
export const getIngestionLog = ()   => req<any[]>('/admin/ingestion-log');

export async function uploadFile(file: File): Promise<{ success: boolean; message: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/admin/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
