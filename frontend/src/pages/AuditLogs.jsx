import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Clock, Terminal } from 'lucide-react';
import { adminService } from '../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">System Audit &amp; Compliance Logs</h2>
        <p className="text-sm text-slate-400 mt-1">Immutable security log trail for enterprise administrative actions</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading audit records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Performed By</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">Audit Details</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-emerald-400">{log.action}</td>
                    <td className="p-3.5 text-slate-200">{log.performedBy}</td>
                    <td className="p-3.5 text-indigo-300">{log.targetEntity}</td>
                    <td className="p-3.5 text-slate-400 max-w-sm truncate font-sans text-xs">{log.details}</td>
                    <td className="p-3.5 text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
