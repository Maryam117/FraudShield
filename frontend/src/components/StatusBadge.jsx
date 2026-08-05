import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;

  switch (status?.toUpperCase()) {
    case 'APPROVED':
    case 'RESOLVED_SAFE':
      style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      Icon = CheckCircle2;
      break;
    case 'SUSPICIOUS':
    case 'UNDER_INVESTIGATION':
    case 'PENDING_REVIEW':
      style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      Icon = AlertTriangle;
      break;
    case 'REJECTED':
    case 'CONFIRMED_FRAUD':
      style = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      Icon = XCircle;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      {status?.replace('_', ' ')}
    </span>
  );
};
