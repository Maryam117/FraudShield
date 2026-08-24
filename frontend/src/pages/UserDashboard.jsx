import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, History, ShieldCheck, AlertTriangle, Eye, PieChart, CheckCircle } from 'lucide-react';
import { transactionService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing] = useState(false);
  const { addToast } = useToast();

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

  const handleDispute = async (e) => {
    e.preventDefault();
    if (!selectedTxn || !disputeReason) return;
    try {
      setDisputing(true);
      const res = await transactionService.dispute(selectedTxn.id, { reason: disputeReason });
      if (res.success) {
        addToast('Dispute verification submitted to Risk Officers!', 'success');
        setDisputeReason('');
        setSelectedTxn(null);
        fetchMyTxns();
      }
    } catch (err) {
      addToast(err || 'Failed to submit dispute', 'error');
    } finally {
      setDisputing(false);
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const approvedCount = transactions.filter((t) => t.status === 'APPROVED').length;
  const flaggedCount = transactions.filter((t) => t.status === 'SUSPICIOUS' || t.status === 'REJECTED').length;

  // Category breakdown calculation
  const categoryTotals = transactions.reduce((acc, t) => {
    const cat = t.merchantCategory || 'Other';
    acc[cat] = (acc[cat] || 0) + (t.amount || 0);
    return acc;
  }, {});

  const safetyScore = transactions.length === 0 ? 100 : Math.max(0, 100 - Math.round((flaggedCount / transactions.length) * 100));

  return (
    <div className="space-y-6 pb-10">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Volume</span>
          <h3 className="text-2xl font-extrabold text-white mt-2">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-slate-400 mt-1 block">{transactions.length} transfers initiated</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Passed Inspection</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{approvedCount} Txns</h3>
          <span className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Safe
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Flagged / Intercepted</span>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-2">{flaggedCount} Txns</h3>
          <span className="text-xs text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Checked by Risk Engine
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Account Safety Rating</span>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-2">{safetyScore} / 100</h3>
          <span className="text-xs text-indigo-400/80 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Trust Index Rating
          </span>
        </div>
      </div>

      {/* Spending Insights Category Breakdown (Feature 4) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" /> Category Spending &amp; Risk Insights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase truncate block">{category}</span>
              <p className="text-lg font-bold text-white mt-0.5">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
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
                        title="View Receipt & Dispute"
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

      {/* Transaction Details & Dispute Modal (Feature 1) */}
      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Receipt & Fraud Details">
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
                <span className="text-xs text-slate-400">Synchronous rule evaluation output</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Triggered Baseline Rules</span>
              <p className="text-slate-200 font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {selectedTxn.triggeredRules || 'None (Clean Transaction)'}
              </p>
            </div>

            {/* Dispute Form for Flagged / Rejected Transactions */}
            {(selectedTxn.status === 'SUSPICIOUS' || selectedTxn.status === 'REJECTED') && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" /> Customer Dispute &amp; Identity Verification
                </div>
                <p className="text-xs text-slate-300">
                  Was this payment authorized by you? Submit a verification note so Risk Officers can review your case.
                </p>
                <form onSubmit={handleDispute} className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. I authorized this transfer to my vendor from home IP"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <button
                    type="submit"
                    disabled={disputing}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
                  >
                    {disputing ? 'Submitting Dispute...' : 'Verify & Dispute Decision'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
