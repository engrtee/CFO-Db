import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';
import type { RAGStatus } from '../../types/subsidiary.types';

const RAG_ICON: Record<RAGStatus, React.ElementType> = {
  Green: CheckCircle,
  Amber: AlertTriangle,
  Red: XCircle,
};

const RAG_COLOR: Record<RAGStatus, string> = {
  Green: 'text-lw-green border-lw-green/30 bg-lw-green/10',
  Amber: 'text-lw-amber border-lw-amber/30 bg-lw-amber/10',
  Red:   'text-lw-danger border-lw-danger/30 bg-lw-danger/10',
};

export const AlertPanel: React.FC = () => {
  const { alerts, isOpen, togglePanel, acknowledgeAlert } = useAlertStore();
  const { user } = useAuthStore();
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={togglePanel}>
      <div
        className="w-96 bg-lw-darkCard border-l border-lw-darkBorder h-full overflow-y-auto shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-lw-darkBorder">
          <div>
            <h2 className="text-sm font-bold text-lw-darkText font-serif">Regulatory Alerts</h2>
            <p className="text-xs text-lw-darkMuted mt-0.5">{activeAlerts.length} active alerts</p>
          </div>
          <button onClick={togglePanel} className="text-lw-darkMuted hover:text-lw-red transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {activeAlerts.length === 0 && (
            <div className="text-center py-12 text-lw-darkMuted text-sm">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-lw-green opacity-50" />
              All regulatory requirements are compliant.
            </div>
          )}

          {activeAlerts.map((alert) => {
            const Icon = RAG_ICON[alert.rag_status];
            return (
              <div key={alert.alert_id} className={`rounded-xl border p-4 ${RAG_COLOR[alert.rag_status]}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {alert.subsidiary_code}
                      </span>
                      <span className="text-xs font-medium">{alert.kpi_name}</span>
                    </div>
                    <p className="text-xs mb-2 opacity-90">{alert.alert_message}</p>
                    <div className="flex items-center gap-2 text-xs opacity-75 mb-2">
                      <span>{alert.regulator}</span>
                      <span>·</span>
                      <span>{new Date(alert.alert_timestamp).toLocaleDateString('en-NG')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">
                        {alert.kpi_value.toFixed(1)} (threshold: {alert.threshold})
                      </span>
                      {user && (
                        <button
                          onClick={() => acknowledgeAlert(alert.alert_id, user.role)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-current hover:opacity-70 transition-opacity font-medium"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Acknowledged */}
          {alerts.filter((a) => a.acknowledged).length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-lw-darkMuted cursor-pointer hover:text-lw-darkText transition-colors py-2">
                Show {alerts.filter((a) => a.acknowledged).length} acknowledged alerts
              </summary>
              <div className="space-y-2 mt-2">
                {alerts.filter((a) => a.acknowledged).map((alert) => (
                  <div key={alert.alert_id} className="rounded-xl border border-lw-darkBorder bg-lw-darkCard2/50 p-3 opacity-60">
                    <p className="text-xs text-lw-darkMuted">{alert.kpi_name} — {alert.alert_message}</p>
                    <p className="text-xs text-lw-darkMuted mt-1">Acknowledged by {alert.acknowledged_by}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
