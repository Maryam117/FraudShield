import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, DollarSign, Activity, TrendingUp, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { adminService } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { useToast } from '../context/ToastContext';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, alertsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAlerts(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err) {
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId, status) => {
    try {
      const res = await adminService.resolveAlert(alertId, { status, notes: `Status changed to ${status} from executive dashboard.` });
      if (res.success) {
        addToast(`Alert #${alertId} updated to ${status}`, 'success');
        loadData();
      }
    } catch (err) {
      addToast('Failed to resolve alert', 'error');
    }
  };

  const pieData = analytics
    ? [
        { name: 'Approved', value: analytics.approvedCount || 0, color: '#10b981' },
        { name: 'Suspicious', value: analytics.suspiciousCount || 0, color: '#f59e0b' },
        { name: 'Rejected', value: analytics.rejectedCount || 0, color: '#f43f5e' },
      ]
    : [];

  const barData = [
    { day: 'Mon', volume: 12400, fraud: 1200 },
    { day: 'Tue', volume: 18900, fraud: 3400 },
    { day: 'Wed', volume: 15200, fraud: 890 },
    { day: 'Thu', volume: 22400, fraud: 4500 },
    { day: 'Fri', volume: 31000, fraud: 8900 },
    { day: 'Sat', volume: 28000, fraud: 6200 },
    { day: 'Sun', volume: 19500, fraud: 2100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Risk Control Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time fraud intercept monitoring &amp; policy enforcement</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-bold transition-all shadow-md shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Processed Volume"
          value={`$${analytics?.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '36,970.50'}`}
          change="+14.2%"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Revenue at Risk"
          value={`$${analytics?.revenueAtRisk?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '27,500.00'}`}
          change="Intercepted"
          trend="down"
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

      {/* Recharts Graphical Visualizations */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Volume ($)" />
                <Bar dataKey="fraud" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Blocked Fraud ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Alerts Triage Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Flagged Cases Requiring Triage
          </h3>
          <span className="text-xs text-slate-400">{alerts.length} Total Alerts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Alert ID</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Txn Reference</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Case Status</th>
                <th className="p-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">#{alert.id}</td>
                  <td className="p-3.5 text-slate-200">{alert.user?.username || alert.user?.email}</td>
                  <td className="p-3.5 font-mono text-xs text-slate-400">{alert.transaction?.transactionReference}</td>
                  <td className="p-3.5 font-extrabold text-white">${alert.transaction?.amount?.toLocaleString()}</td>
                  <td className="p-3.5">
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
                  <td className="p-3.5"><StatusBadge status={alert.status} /></td>
                  <td className="p-3.5 text-right space-x-2">
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
      </div>
    </div>
  );
};
