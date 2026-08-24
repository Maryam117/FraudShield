import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { adminService } from '../services/api';

const PAGE_SIZE = 15;

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await adminService.getAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) =>
    !search || [l.action, l.performedBy, l.targetEntity, l.details]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Audit &amp; Compliance Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Immutable security log trail for enterprise administrative actions</p>
        </div>
        {/* Search filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by action, user, entity…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Fixed-height scrollable grid */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col" style={{ height: '540px' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Security Event Log
          </h3>
          <span className="text-xs text-slate-400">{filtered.length} records</span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Loading audit records...</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Timestamp</th>
                  <th className="p-3.5 whitespace-nowrap">Action Event</th>
                  <th className="p-3.5 whitespace-nowrap">Performed By</th>
                  <th className="p-3.5 whitespace-nowrap">Target Entity</th>
                  <th className="p-3.5 whitespace-nowrap">Audit Details</th>
                  <th className="p-3.5 whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No audit records found.</td>
                  </tr>
                ) : paginated.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">{log.action}</td>
                    <td className="p-3.5 text-slate-200">{log.performedBy}</td>
                    <td className="p-3.5 text-indigo-300">{log.targetEntity}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate font-sans text-xs">{log.details}</td>
                    <td className="p-3.5 text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages} &nbsp;·&nbsp; Showing {paginated.length} of {filtered.length}
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
    </div>
  );
};
