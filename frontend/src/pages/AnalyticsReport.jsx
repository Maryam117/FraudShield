import React, { useEffect, useState } from 'react';
import { Download, FileText, BarChart2, DollarSign, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, transactionService } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 10;

export const AnalyticsReport = () => {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
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

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 pb-10">
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
          value={`$${analytics?.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`}
          color="emerald"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Revenue Intercepted"
          value={`$${analytics?.revenueAtRisk?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`}
          color="rose"
          icon={AlertCircle}
        />
        <MetricCard
          title="Effective Fraud Intercept %"
          value={`${analytics?.fraudRatePercentage || '0.0'}%`}
          color="amber"
          icon={BarChart2}
        />
      </div>

      {/* Historical Fraud Ledger - fixed height, internal scroll */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col" style={{ height: '480px' }}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Historical Fraud Ledger
          </h3>
          <span className="text-xs text-slate-400">{transactions.length} total records</span>
        </div>

        {/* Scrollable table body */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800 sticky top-0 z-10">
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No transactions recorded yet.</td>
                </tr>
              ) : paginated.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-slate-200">{txn.transactionReference}</td>
                  <td className="p-3.5 text-slate-300">{txn.username || '—'}</td>
                  <td className="p-3.5 font-bold text-white">${txn.amount?.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-400">{txn.merchantCategory}</td>
                  <td className="p-3.5 text-slate-400">{txn.location}</td>
                  <td className="p-3.5">
                    <span className={`font-bold text-xs px-2 py-1 rounded-lg ${
                      txn.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      txn.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{txn.status}</span>
                  </td>
                  <td className="p-3.5 text-xs font-mono text-slate-400 max-w-xs truncate">{txn.triggeredRules || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages} &nbsp;·&nbsp; Showing {paginated.length} of {transactions.length}
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
