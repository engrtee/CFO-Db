import { create } from 'zustand';
import type { RegulatoryAlertRow } from '../types/regulatory.types';
import { regulatoryAlertLog } from '../data/regulatory_alert_log';

interface AlertState {
  alerts: RegulatoryAlertRow[];
  unacknowledgedCount: number;
  redCount: number;
  amberCount: number;
  isOpen: boolean;

  togglePanel: () => void;
  acknowledgeAlert: (alertId: string, byRole: string) => void;
  getActiveAlerts: () => RegulatoryAlertRow[];
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: regulatoryAlertLog,
  unacknowledgedCount: regulatoryAlertLog.filter((a) => !a.acknowledged).length,
  redCount: regulatoryAlertLog.filter((a) => !a.acknowledged && a.rag_status === 'Red').length,
  amberCount: regulatoryAlertLog.filter((a) => !a.acknowledged && a.rag_status === 'Amber').length,
  isOpen: false,

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),

  acknowledgeAlert: (alertId, byRole) => {
    set((s) => {
      const updated = s.alerts.map((a) =>
        a.alert_id === alertId
          ? { ...a, acknowledged: true, acknowledged_by: byRole, acknowledged_at: new Date().toISOString() }
          : a
      );
      return {
        alerts: updated,
        unacknowledgedCount: updated.filter((a) => !a.acknowledged).length,
        redCount: updated.filter((a) => !a.acknowledged && a.rag_status === 'Red').length,
        amberCount: updated.filter((a) => !a.acknowledged && a.rag_status === 'Amber').length,
      };
    });
  },

  getActiveAlerts: () => get().alerts.filter((a) => !a.acknowledged),
}));
