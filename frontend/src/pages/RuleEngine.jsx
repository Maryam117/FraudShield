import React, { useEffect, useState } from 'react';
import { Sliders, ToggleLeft, ToggleRight, Edit3, Shield, Info } from 'lucide-react';
import { adminService } from '../services/api';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const RuleEngine = () => {
  const [rules, setRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [threshold, setThreshold] = useState('');
  const [riskPoints, setRiskPoints] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Fraud Detection Rule Engine</h2>
        <p className="text-sm text-slate-400 mt-1">Configure baseline thresholds and risk scoring point weights</p>
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
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Threshold
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
