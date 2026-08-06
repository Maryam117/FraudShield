import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Search, Filter, ShieldAlert } from 'lucide-react';
import { adminService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await adminService.getAlerts();
      if (res.success && res.data) {
        setAlerts(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (alertId, status) => {
    try {
      const res = await adminService.resolveAlert(alertId, { status, notes });
      if (res.success) {
        addToast(`Alert #${alertId} status changed to ${status}`, 'success');
        setSelectedAlert(null);
        fetchAlerts();
      }
    } catch (err) {
      addToast('Failed to update alert status', 'error');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Fraud Case Management Workbench</h2>
          <p className="text-sm text-slate-400 mt-1">Investigate, override, or confirm fraudulent transaction attempts</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Alert Statuses</option>
            <option value="NEW">New Alerts</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="RESOLVED_SAFE">Resolved Safe</option>
            <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading risk alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No alerts match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Alert ID</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">#{alert.id}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${alert.alertLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {alert.alertLevel}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200">{alert.user?.username || alert.user?.email}</td>
                    <td className="p-3.5 font-mono text-xs text-slate-400">{alert.transaction?.transactionReference}</td>
                    <td className="p-3.5 font-extrabold text-white">${alert.transaction?.amount?.toLocaleString()}</td>
                    <td className="p-3.5"><StatusBadge status={alert.status} /></td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setNotes(alert.investigationNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                      >
                        Inspect Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Investigation Modal */}
      <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title={`Case Workbench: Alert #${selectedAlert?.id}`}>
        {selectedAlert && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-slate-400 font-semibold">Flagged Transaction Reference</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedAlert.transaction?.transactionReference}</span>
              </div>
              <div className="text-xs text-slate-300">
                Amount: <strong className="text-white">${selectedAlert.transaction?.amount}</strong> | Merchant: {selectedAlert.transaction?.merchantCategory}
              </div>
              <div className="text-xs text-slate-400">
                Triggered Rules: <code className="text-amber-400">{selectedAlert.transaction?.triggeredRules}</code>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Risk Officer Investigation Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter investigation audit findings..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleUpdateStatus(selectedAlert.id, 'RESOLVED_SAFE')}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Override &amp; Mark Safe
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAlert.id, 'CONFIRMED_FRAUD')}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Confirm Fraud &amp; Block Account
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
