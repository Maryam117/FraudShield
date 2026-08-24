import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Trash2, Edit2, Filter } from 'lucide-react';
import { blacklistService } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ListManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    listType: 'BLACKLIST',
    entryType: 'IP',
    value: '',
    reason: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await blacklistService.getAll();
      if (res.success && res.data) {
        setEntries(res.data);
      }
    } catch (err) {
      addToast('Failed to fetch list entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        listType: entry.listType,
        entryType: entry.entryType,
        value: entry.value,
        reason: entry.reason || ''
      });
    } else {
      setEditingId(null);
      setFormData({ listType: 'BLACKLIST', entryType: 'IP', value: '', reason: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await blacklistService.update(editingId, formData);
        if (res.success) {
          addToast('List entry updated successfully!', 'success');
          setIsModalOpen(false);
          fetchEntries();
        }
      } else {
        const res = await blacklistService.add(formData);
        if (res.success) {
          addToast(`Entry added to ${formData.listType}!`, 'success');
          setIsModalOpen(false);
          fetchEntries();
        }
      }
    } catch (err) {
      addToast(err || 'Failed to save entry', 'error');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this entry?')) return;
    try {
      const res = await blacklistService.remove(id);
      if (res.success) {
        addToast('Entry removed successfully', 'success');
        fetchEntries();
      }
    } catch (err) {
      addToast('Failed to remove entry', 'error');
    }
  };

  const filteredEntries = filterType === 'ALL' 
    ? entries 
    : entries.filter(e => e.listType === filterType);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            List Management (Blacklist & Whitelist)
          </h1>
          <p className="text-slate-400 mt-1">Configure instant pre-check decision rules for IPs, Accounts, and Emails</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add List Entry
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400 font-semibold uppercase">Filter List:</span>
        <div className="flex gap-2">
          {['ALL', 'BLACKLIST', 'WHITELIST'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-1 rounded-2xl border border-slate-800/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">List Type</th>
                <th className="p-4 font-semibold">Entry Type</th>
                <th className="p-4 font-semibold">Value</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Added By</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading list entries...</td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No entries found</td>
                </tr>
              ) : (
                filteredEntries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      {e.listType === 'BLACKLIST' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" /> Blacklist (Auto-Reject)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" /> Whitelist (Auto-Approve)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-indigo-400">
                      {e.entryType}
                    </td>
                    <td className="p-4 text-sm font-bold text-white font-mono">
                      {e.value}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {e.reason || 'No description provided'}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {e.createdBy || 'System Admin'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(e)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(e.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        title="Remove Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">
              {editingId ? 'Edit List Entry' : 'Add Entry to List'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">List Target</label>
                <select
                  value={formData.listType}
                  onChange={(e) => setFormData({ ...formData, listType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5"
                >
                  <option value="BLACKLIST">Blacklist (Instant Rejection)</option>
                  <option value="WHITELIST">Whitelist (Instant Pass)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Entity Type</label>
                <select
                  value={formData.entryType}
                  onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5"
                >
                  <option value="IP">IP Address</option>
                  <option value="ACCOUNT">Account Number</option>
                  <option value="EMAIL">Customer Email</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 185.220.101.5 or john.doe@example.com"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Reason for blacklisting/whitelisting"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
                >
                  {editingId ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
