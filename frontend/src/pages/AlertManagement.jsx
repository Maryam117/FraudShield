import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight, Search, Zap } from 'lucide-react';
import { adminService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 10;

export const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [recentTriggerIds, setRecentTriggerIds] = useState(new Set());
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAlerts();

    const handleNewAlert = (e) => {
      const newAlert = e.detail;
      if (newAlert && newAlert.id) {
        setAlerts((prev) => {
          // Check if already in list
          const exists = prev.some((a) => a.id === newAlert.id);
          if (exists) return prev;
          return [newAlert, ...prev];
        });

        // Mark as live trigger
        setRecentTriggerIds((prev) => new Set([...prev, newAlert.id]));
        setPage(1); // Jump to page 1 so it's immediately visible

        // Remove live badge after 20 seconds
        setTimeout(() => {
          setRecentTriggerIds((prev) => {
            const next = new Set(prev);
            next.delete(newAlert.id);
            return next;
          });
        }, 20000);
      }

      // Synchronize with database in background
      setTimeout(fetchAlerts, 400);
    };

    window.addEventListener('fraud-alert-received', handleNewAlert);
    return () => window.removeEventListener('fraud-alert-received', handleNewAlert);
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
    const matchesFilter = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSearch = !search || [
      `#${a.id}`,
      a.alertLevel,
      a.user?.username,
      a.user?.email,
      a.transaction?.transactionReference,
      a.transaction?.merchantCategory
    ].some((field) => field?.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const paginatedAlerts = filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Fraud Case Management Workbench
            {recentTriggerIds.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <Zap className="w-3.5 h-3.5" /> {recentTriggerIds.size} Live Inbound Triggered
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Investigate, override, or confirm fraudulent transaction attempts in real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts by ref, user..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 w-52"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
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
      </div>

      {/* Fixed-height scrollable grid container */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col" style={{ height: '520px' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Triage Queue
          </h3>
          <span className="text-xs text-slate-400">{filteredAlerts.length} Active Records</span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Loading risk alerts...</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Alert ID</th>
                  <th className="p-3.5 whitespace-nowrap">Severity</th>
                  <th className="p-3.5 whitespace-nowrap">Customer</th>
                  <th className="p-3.5 whitespace-nowrap">Reference</th>
                  <th className="p-3.5 whitespace-nowrap">Amount</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">No alerts match the selected filter.</td>
                  </tr>
                ) : paginatedAlerts.map((alert) => {
                  const isJustTriggered = recentTriggerIds.has(alert.id);
                  return (
                    <tr
                      key={alert.id}
                      className={`transition-all duration-300 ${
                        isJustTriggered
                          ? 'bg-rose-500/15 border-l-4 border-l-rose-500 shadow-inner'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>#{alert.id}</span>
                          {isJustTriggered && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse shadow-md shadow-rose-500/50">
                              ⚡ Just Triggered
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${alert.alertLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {alert.alertLevel}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-200 whitespace-nowrap">{alert.user?.username || alert.user?.email}</td>
                      <td className="p-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">{alert.transaction?.transactionReference}</td>
                      <td className="p-3.5 font-extrabold text-white whitespace-nowrap">${alert.transaction?.amount?.toLocaleString()}</td>
                      <td className="p-3.5 whitespace-nowrap"><StatusBadge status={alert.status} /></td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setNotes(alert.investigationNotes || '');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isJustTriggered
                              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                          }`}
                        >
                          Inspect Case
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages} &nbsp;·&nbsp; Showing {paginatedAlerts.length} of {filteredAlerts.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    page === p ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
