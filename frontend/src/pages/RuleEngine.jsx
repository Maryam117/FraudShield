import React, { useEffect, useState } from 'react';
import { Sliders, ToggleLeft, ToggleRight, Edit3, Plus, Save, X } from 'lucide-react';
import { adminService } from '../services/api';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

const EMPTY_NEW_RULE = {
  ruleCode: '',
  ruleName: '',
  description: '',
  thresholdValue: '',
  riskPoints: '',
};

export const RuleEngine = () => {
  const [rules, setRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [threshold, setThreshold] = useState('');
  const [riskPoints, setRiskPoints] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // New Rule modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRule, setNewRule] = useState(EMPTY_NEW_RULE);
  const [creating, setCreating] = useState(false);

  // Simulation state
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await adminService.getRules();
      if (res.success && res.data) {
        setRules(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await adminService.toggleRule(id);
      if (res.success) {
        addToast('Rule status toggled dynamically!', 'success');
        fetchRules();
      }
    } catch (err) {
      addToast('Failed to toggle rule', 'error');
    }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      const res = await adminService.updateRule(editingRule.id, {
        thresholdValue: parseFloat(threshold),
        riskPoints: parseInt(riskPoints),
      });
      if (res.success) {
        addToast(`Rule ${editingRule.ruleCode} threshold updated!`, 'success');
        setEditingRule(null);
        fetchRules();
      }
    } catch (err) {
      addToast('Failed to update rule parameters', 'error');
    }
  };

  const handleSimulate = async () => {
    if (!editingRule) return;
    try {
      setSimulating(true);
      const res = await adminService.simulateRule({
        ruleCode: editingRule.ruleCode,
        thresholdValue: parseFloat(threshold),
        riskPoints: parseInt(riskPoints),
      });
      if (res.success && res.data) {
        setSimResult(res.data);
        addToast('Backtest simulation completed!', 'info');
      }
    } catch (err) {
      addToast('Failed to run simulation', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await adminService.createRule({
        ruleCode: newRule.ruleCode,
        ruleName: newRule.ruleName,
        description: newRule.description,
        thresholdValue: parseFloat(newRule.thresholdValue),
        riskPoints: parseInt(newRule.riskPoints),
      });
      if (res.success) {
        addToast(`Rule "${newRule.ruleName}" created successfully!`, 'success');
        setShowNewModal(false);
        setNewRule(EMPTY_NEW_RULE);
        fetchRules();
      }
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to create rule', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Fraud Detection Rule Engine</h2>
          <p className="text-sm text-slate-400 mt-1">Configure baseline thresholds and risk scoring point weights</p>
        </div>
        <button
          onClick={() => { setShowNewModal(true); setNewRule(EMPTY_NEW_RULE); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25"
        >
          <Plus className="w-4 h-4" /> Add New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading detection rules...</div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {rule.ruleCode}
                  </span>
                  <h3 className="text-base font-bold text-white">{rule.ruleName}</h3>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">{rule.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-300 pt-2">
                  <span>Threshold Value: <strong className="text-emerald-400">${rule.thresholdValue?.toLocaleString()}</strong></span>
                  <span>Risk Penalty: <strong className="text-amber-400">+{rule.riskPoints} Risk Points</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setThreshold(rule.thresholdValue);
                    setRiskPoints(rule.riskPoints);
                    setSimResult(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit &amp; Backtest
                </button>

                <button
                  onClick={() => handleToggle(rule.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
                    rule.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {rule.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                  <span>{rule.isActive ? 'Rule Active' : 'Rule Disabled'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Rule Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Add New Detection Rule">
        <form onSubmit={handleCreateRule} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Rule Code <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. HIGH_VELOCITY"
                value={newRule.ruleCode}
                onChange={(e) => setNewRule({ ...newRule, ruleCode: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs font-bold uppercase focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Unique identifier, auto-uppercased</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Rule Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. High Velocity Transactions"
                value={newRule.ruleName}
                onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Describe when this rule triggers and what risk it detects…"
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs resize-none focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Threshold Value ($) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="e.g. 5000"
                value={newRule.thresholdValue}
                onChange={(e) => setNewRule({ ...newRule, thresholdValue: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Risk Points (0–100) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                required
                min="0"
                max="100"
                placeholder="e.g. 35"
                value={newRule.riskPoints}
                onChange={(e) => setNewRule({ ...newRule, riskPoints: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {creating ? 'Creating Rule...' : 'Create Rule Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal isOpen={!!editingRule} onClose={() => setEditingRule(null)} title={`Edit Parameters: ${editingRule?.ruleCode}`}>
        {editingRule && (
          <form onSubmit={handleSaveRule} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Threshold Value ($ or count)</label>
              <input
                type="number"
                step="0.01"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Risk Points Weight (0 - 100)</label>
              <input
                type="number"
                required
                value={riskPoints}
                onChange={(e) => setRiskPoints(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Historical Backtest Impact</span>
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all"
                >
                  {simulating ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {simResult && (
                <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                  <div>Evaluated Ledger: <strong className="text-white">{simResult.totalEvaluated} txns</strong></div>
                  <div>Would Flag: <strong className="text-rose-400">{simResult.flaggedCount} txns</strong></div>
                  <div>Simulated Intercepted Volume: <strong className="text-emerald-400">${simResult.simulatedRiskVolume?.toLocaleString()}</strong></div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25"
              >
                Save Updated Rule Policy
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
