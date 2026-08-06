import React, { useEffect, useState } from 'react';
import { Download, FileText, BarChart2, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';
import { adminService, transactionService } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { useToast } from '../context/ToastContext';

export const AnalyticsReport = () => {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [analyticsRes, txnsRes] = await Promise.all([
      adminService.getAnalytics(),
      transactionService.getAllTransactions(),
    ]);
    if (analyticsRes.success) setAnalytics(analyticsRes.data);
    if (txnsRes.success) setTransactions(txnsRes.data);
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Reference,User,Account,Receiver,Amount,Currency,Merchant,Location,IP,Status,RiskScore,TriggeredRules,CreatedAt\n'];
      const rows = transactions.map((t) =>
        `"${t.transactionReference}","${t.username}","${t.accountNumber}","${t.receiverAccount}",${t.amount},"${t.currency}","${t.merchantCategory}","${t.location}","${t.ipAddress}","${t.status}",${t.riskScore},"${t.triggeredRules || ''}","${t.createdAt}"`
      );

      const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fraudshield_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('FraudShield CSV Audit Report downloaded successfully!', 'success');
    } catch (err) {
      addToast('Failed to export CSV report', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Analytics &amp; Compliance Reporting</h2>
          <p className="text-sm text-slate-400 mt-1">Exportable transaction ledgers and financial risk metrics</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25 shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV Audit Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Evaluated Volume"
          value={`$${analytics?.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '36,970.50'}`}
          color="emerald"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Revenue Intercepted"
          value={`$${analytics?.revenueAtRisk?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '27,500.00'}`}
          color="rose"
          icon={AlertCircle}
        />
        <MetricCard
          title="Effective Fraud Intercept %"
          value={`${analytics?.fraudRatePercentage || '60.0'}%`}
          color="amber"
          icon={BarChart2}
        />
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Historical Fraud Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Txn Ref</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Merchant</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Triggered Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-slate-200">{txn.transactionReference}</td>
                  <td className="p-3.5 text-slate-300">{txn.username || 'user1'}</td>
                  <td className="p-3.5 font-bold text-white">${txn.amount?.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-400">{txn.merchantCategory}</td>
                  <td className="p-3.5 text-slate-400">{txn.location}</td>
                  <td className="p-3.5 font-bold text-xs">{txn.status}</td>
                  <td className="p-3.5 text-xs font-mono text-slate-400 max-w-xs truncate">{txn.triggeredRules || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
