import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Activity, DollarSign, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { adminService } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 8;

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, alertsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAlerts(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id, status) => {
    try {
      const res = await adminService.resolveAlert(id, {
        status,
        notes: `Triage resolution action: ${status}`,
      });
      if (res.success) {
        addToast(`Alert #${id} successfully marked as ${status}`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      addToast('Failed to resolve alert', 'error');
    }
  };

  const pieData = [
    { name: 'Approved', value: 145, color: '#10b981' },
    { name: 'Suspicious', value: 24, color: '#f59e0b' },
    { name: 'Rejected', value: 12, color: '#f43f5e' },
  ];

  const barData = [
    { day: 'Mon', volume: 12000, fraud: 1500 },
    { day: 'Tue', volume: 19000, fraud: 3200 },
    { day: 'Wed', volume: 15000, fraud: 2000 },
    { day: 'Thu', volume: 24000, fraud: 4500 },
    { day: 'Fri', volume: 32000, fraud: 7800 },
    { day: 'Sat', volume: 28000, fraud: 6100 },
    { day: 'Sun', volume: 22000, fraud: 3900 },
  ];

  const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
  const paginatedAlerts = alerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Decision Engine Online</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">Executive Risk Overview</h2>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          Last Synced: <span className="text-slate-200 font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Evaluated Volume"
          value={`$${analytics?.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '36,970.50'}`}
          change="+12.4% vs last week"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Intercepted Fraud Loss"
          value={`$${analytics?.revenueAtRisk?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '27,500.00'}`}
          change="Saved by Rule Triggers"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Fraud Rate %"
          value={`${analytics?.fraudRatePercentage || '60.0'}%`}
          change="Rule Threshold Evaluated"
          icon={Activity}
          color="amber"
        />
        <MetricCard
          title="Active Triage Alerts"
          value={analytics?.activeAlertsCount || '2'}
          change="Requires Action"
          icon={Shield}
          color="indigo"
        />
      </div>

      {/* Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-4">Transaction Risk Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Daily Volume vs Intercepted Fraud</h3>
            <span className="text-xs text-slate-400">Weekly Performance Trend</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Bar dataKey="volume" name="Total Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" name="Fraud Caught" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flagged Cases Requiring Triage - Fixed height & Scrollable with Pagination */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col" style={{ height: '440px' }}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Flagged Cases Requiring Triage
          </h3>
          <span className="text-xs text-slate-400">{alerts.length} Total Alerts</span>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="p-3.5 whitespace-nowrap">Alert ID</th>
                <th className="p-3.5 whitespace-nowrap">User</th>
                <th className="p-3.5 whitespace-nowrap">Txn Reference</th>
                <th className="p-3.5 whitespace-nowrap">Amount</th>
                <th className="p-3.5 whitespace-nowrap">Severity</th>
                <th className="p-3.5 whitespace-nowrap">Case Status</th>
                <th className="p-3.5 text-right whitespace-nowrap">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No active alerts requiring triage.</td>
                </tr>
              ) : paginatedAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">#{alert.id}</td>
                  <td className="p-3.5 text-slate-200 whitespace-nowrap">{alert.user?.username || alert.user?.email}</td>
                  <td className="p-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">{alert.transaction?.transactionReference}</td>
                  <td className="p-3.5 font-extrabold text-white whitespace-nowrap">${alert.transaction?.amount?.toLocaleString()}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                        alert.alertLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 glow-rose'
                          : alert.alertLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}
                    >
                      {alert.alertLevel}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap"><StatusBadge status={alert.status} /></td>
                  <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleResolveAlert(alert.id, 'RESOLVED_SAFE')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
                    >
                      Mark Safe
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id, 'CONFIRMED_FRAUD')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors"
                    >
                      Block Fraud
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages} &nbsp;·&nbsp; Showing {paginatedAlerts.length} of {alerts.length}
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
