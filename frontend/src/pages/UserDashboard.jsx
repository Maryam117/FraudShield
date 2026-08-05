import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, History, ShieldCheck, AlertTriangle, ArrowUpRight, Eye } from 'lucide-react';
import { transactionService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { Modal } from '../components/Modal';

export const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTxns();
  }, []);

  const fetchMyTxns = async () => {
    try {
      const res = await transactionService.getMyTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const approvedCount = transactions.filter((t) => t.status === 'APPROVED').length;
  const flaggedCount = transactions.filter((t) => t.status === 'SUSPICIOUS' || t.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Client Payment Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Submit transactions with real-time automated fraud protection</p>
        </div>
        <Link
          to="/new-transaction"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Send className="w-4 h-4" /> Send Payment Now
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Spent</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-slate-400 mt-1 block">Across {transactions.length} transactions</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Passed Inspection</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{approvedCount} Txns</h3>
          <span className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Safe
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Flagged / Stopped</span>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-2">{flaggedCount} Txns</h3>
          <span className="text-xs text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Intercepted by Fraud Engine
          </span>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" /> Transaction Ledger
          </h3>
          <span className="text-xs text-slate-400">{transactions.length} Records</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading ledger data...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No transactions recorded yet. Submit your first transfer above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Reference Code</th>
                  <th className="p-3.5">Receiver</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-xs font-semibold text-slate-200">{txn.transactionReference}</td>
                    <td className="p-3.5 text-slate-300">{txn.receiverAccount}</td>
                    <td className="p-3.5 text-slate-400">{txn.merchantCategory}</td>
                    <td className="p-3.5 font-bold text-white">${txn.amount?.toLocaleString()} {txn.currency}</td>
                    <td className="p-3.5"><StatusBadge status={txn.status} /></td>
                    <td className="p-3.5"><RiskBadge score={txn.riskScore} /></td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="View Metadata"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Fraud Assessment Metadata">
        {selectedTxn && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Reference</span>
                <p className="font-mono text-white font-bold mt-0.5">{selectedTxn.transactionReference}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Amount</span>
                <p className="text-emerald-400 font-extrabold text-lg mt-0.5">${selectedTxn.amount} {selectedTxn.currency}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Source Account</span>
                <p className="text-slate-200 mt-0.5">{selectedTxn.accountNumber}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Receiver Account</span>
                <p className="text-slate-200 mt-0.5">{selectedTxn.receiverAccount}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Location / IP</span>
                <p className="text-slate-200 mt-0.5">{selectedTxn.location} ({selectedTxn.ipAddress})</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Evaluation Status</span>
                <div className="mt-1"><StatusBadge status={selectedTxn.status} /></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Risk Engine Score</span>
              <div className="flex items-center gap-3">
                <RiskBadge score={selectedTxn.riskScore} />
                <span className="text-xs text-slate-400">Synchronous rule check output</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Triggered Baseline Rules</span>
              <p className="text-slate-200 font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {selectedTxn.triggeredRules || 'None (Clean Transaction)'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
