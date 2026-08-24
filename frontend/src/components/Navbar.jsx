import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, Bell, AlertTriangle, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/api';

export const Navbar = () => {
  const { user, token, logout, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [liveAlertCount, setLiveAlertCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load of latest alerts for Admin
  useEffect(() => {
    if (!isAdmin) return;
    const fetchInitialAlerts = async () => {
      try {
        const res = await adminService.getAlerts();
        if (res.success && Array.isArray(res.data)) {
          const initial = res.data.slice(0, 5).map((a) => ({
            id: a.id,
            alertLevel: a.alertLevel || 'HIGH',
            reference: a.transaction?.transactionReference || `#${a.id}`,
            amount: a.transaction?.amount,
            username: a.user?.username || 'Client',
            time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            read: a.status !== 'NEW',
          }));
          setNotifications(initial);
          const unread = res.data.filter((a) => a.status === 'NEW').length;
          setLiveAlertCount(unread);
        }
      } catch (err) {
        // Silent fail for initial alerts
      }
    };
    fetchInitialAlerts();
  }, [isAdmin]);

  // Connect to SSE stream for live updates
  useEffect(() => {
    if (!isAdmin) return;

    const authToken = token || localStorage.getItem('fraudshield_token');
    if (!authToken) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const eventSource = new EventSource(`${apiBase}/admin/alerts/stream?token=${authToken}`);

    eventSource.addEventListener('fraud-alert', (event) => {
      try {
        const data = JSON.parse(event.data);
        const newNotif = {
          id: data.id || Date.now(),
          alertLevel: data.alertLevel || 'CRITICAL',
          reference: data.transaction?.transactionReference || `TXN-ALERT-${data.id}`,
          amount: data.transaction?.amount,
          username: data.user?.username || 'Client',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev.slice(0, 14)]);
        setLiveAlertCount((prev) => prev + 1);
        addToast(`🚨 Real-Time Alert: ${data.alertLevel || 'CRITICAL'} severity fraud alert created!`, 'error');

        // Broadcast to active pages (Triage workbench, Executive dashboard) for live grid auto-update
        window.dispatchEvent(new CustomEvent('fraud-alert-received', { detail: data }));
      } catch (err) {
        console.error('Error parsing alert event', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [isAdmin, token, addToast]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    setLiveAlertCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (alertId) => {
    setNotifications((prev) => prev.map((n) => (n.id === alertId ? { ...n, read: true } : n)));
    setShowDropdown(false);
    navigate('/alerts');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Fraud<span className="text-emerald-400">Shield</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Enterprise v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-Time Transaction Decisioning Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell with Dropdown */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className={`relative p-2.5 rounded-xl transition-all ${
                  showDropdown
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
                title="Real-Time Alerts Stream"
              >
                <Bell className="w-5 h-5" />
                {liveAlertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/40">
                    {liveAlertCount > 99 ? '99+' : liveAlertCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl glass-panel border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Fraud Alerts Stream
                      </span>
                      {liveAlertCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-extrabold border border-rose-500/30">
                          {liveAlertCount} New
                        </span>
                      )}
                    </div>
                    {liveAlertCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No recent fraud alerts. System nominal.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            !item.read ? 'bg-rose-500/5' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              item.alertLevel === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : item.alertLevel === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                  item.alertLevel === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {item.alertLevel}
                              </span>
                              <span className="text-[10px] text-slate-500">{item.time}</span>
                            </div>
                            <p className="text-xs font-semibold text-white mt-1 truncate">
                              {item.username} • {item.amount ? `$${item.amount.toLocaleString()}` : 'Flagged Payment'}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {item.reference}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 text-center">
                    <Link
                      to="/alerts"
                      onClick={() => setShowDropdown(false)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors py-1 px-2"
                    >
                      Open Full Triage Workbench <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 border border-slate-700">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-white leading-none">{user.fullName || user.username}</div>
                <div className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                  {isAdmin ? 'Risk Administrator' : 'Account User'}
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
