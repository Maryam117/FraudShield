import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, Zap, DollarSign, Globe, Building, ArrowLeft } from 'lucide-react';
import { transactionService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';

export const NewTransaction = () => {
  const [formData, setFormData] = useState({
    accountNumber: 'ACC-88392019',
    receiverAccount: 'REC-99102944',
    amount: '450.00',
    currency: 'USD',
    merchantCategory: 'Retail Shopping',
    location: 'New York, US',
    ipAddress: '192.168.1.10',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setPreset = (preset) => {
    switch (preset) {
      case 'SAFE':
        setFormData({
          accountNumber: 'ACC-88392019',
          receiverAccount: 'REC-99102944',
          amount: '450.00',
          currency: 'USD',
          merchantCategory: 'Supermarket / Grocery',
          location: 'New York, US',
          ipAddress: '192.168.1.10',
        });
        break;
      case 'HIGH_AMOUNT':
        setFormData({
          accountNumber: 'ACC-88392019',
          receiverAccount: 'REC-44102933',
          amount: '15000.00',
          currency: 'USD',
          merchantCategory: 'Wire Transfer',
          location: 'New York, US',
          ipAddress: '192.168.1.10',
        });
        break;
      case 'HIGH_RISK_MERCHANT':
        setFormData({
          accountNumber: 'ACC-88392019',
          receiverAccount: 'REC-77102955',
          amount: '7500.00',
          currency: 'USD',
          merchantCategory: 'Crypto Exchange / Offshore',
          location: 'New York, US',
          ipAddress: '192.168.1.10',
        });
        break;
      case 'GEO_ANOMALY':
        setFormData({
          accountNumber: 'ACC-88392019',
          receiverAccount: 'REC-11102999',
          amount: '12000.00',
          currency: 'USD',
          merchantCategory: 'Offshore Banking',
          location: 'Panama City, PA',
          ipAddress: '185.220.101.5',
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      const res = await transactionService.create(payload);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.status === 'APPROVED') {
          addToast('Transaction APPROVED by Fraud Engine!', 'success');
        } else if (res.data.status === 'SUSPICIOUS') {
          addToast('Transaction FLAGGED AS SUSPICIOUS (Sent for Admin Triage)', 'warning');
        } else {
          addToast('Transaction REJECTED by Risk Engine Security Policy!', 'error');
        }
      }
    } catch (err) {
      addToast(err.message || 'Transaction submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Submit New Transaction</h2>
          <p className="text-sm text-slate-400 mt-1">Initiate a transfer with synchronous multi-rule risk evaluation</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      {/* Preset Pickers for Easy Testing */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-400" /> Test Presets (Click to Auto-fill Rule Triggers)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setPreset('SAFE')}
            className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 text-left"
          >
            ✅ Normal Safe Payment
          </button>
          <button
            type="button"
            onClick={() => setPreset('HIGH_AMOUNT')}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 text-left"
          >
            ⚠️ High Amount ($15k)
          </button>
          <button
            type="button"
            onClick={() => setPreset('HIGH_RISK_MERCHANT')}
            className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 text-left"
          >
            ⚠️ Crypto / Gambling Merchant
          </button>
          <button
            type="button"
            onClick={() => setPreset('GEO_ANOMALY')}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/20 text-left"
          >
            🚨 Geo Anomaly (Panama IP)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Source Account</label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Receiver Account</label>
                <input
                  type="text"
                  name="receiverAccount"
                  required
                  value={formData.receiverAccount}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Amount</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Merchant Category</label>
              <input
                type="text"
                name="merchantCategory"
                required
                value={formData.merchantCategory}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Geographic Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Client IP Address</label>
                <input
                  type="text"
                  name="ipAddress"
                  required
                  value={formData.ipAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              <span>{loading ? 'Evaluating Risk Parameters...' : 'Submit & Execute Decisioning'}</span>
            </button>
          </form>
        </div>

        {/* Real-time Decision Output Result Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Decision Engine Result
            </h3>

            {result ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Decision Status</span>
                  <div><StatusBadge status={result.status} /></div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Risk Engine Score</span>
                  <div><RiskBadge score={result.riskScore} /></div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Rules Evaluated & Triggered</span>
                  <div className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {result.triggeredRules || 'None (Clean Transaction)'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm leading-relaxed">
                Submit a payment on the left to see instant synchronous risk scoring and rule detection results.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-4 border-t border-slate-800/60">
            Powered by FraudShield Deterministic Rules Engine
          </div>
        </div>
      </div>
    </div>
  );
};
