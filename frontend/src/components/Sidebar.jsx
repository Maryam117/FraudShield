import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  AlertTriangle,
  Sliders,
  BarChart3,
  FileText,
  ShieldCheck,
  Activity,
  Users,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/new-transaction', label: 'Submit Payment', icon: Send },
    { to: '/profile', label: 'Profile & Security', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'User Management', icon: Users },
    { to: '/blacklist', label: 'Lists & Blacklist', icon: ShieldCheck },
    { to: '/alerts', label: 'Fraud Alerts Triage', icon: AlertTriangle, badge: 'Live' },
    { to: '/rules', label: 'Rule Engine Config', icon: Sliders },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/audit-logs', label: 'Audit Security Log', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-slate-800/60 p-4 min-h-[calc(100vh-65px)] flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Risk Officer Tools' : 'Client Services'}
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
          <Activity className="w-3.5 h-3.5 text-emerald-400" /> Engine Status
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Rule Evaluator: <span className="text-emerald-400 font-bold">ACTIVE</span> (Latency &lt;15ms)
        </p>
      </div>
    </aside>
  );
};
