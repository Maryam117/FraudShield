import React from 'react';

export const MetricCard = ({ title, value, change, trend, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20 glow-emerald',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20 glow-amber',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-400 border-rose-500/20 glow-rose',
    indigo: 'from-indigo-500/10 to-blue-500/5 text-indigo-400 border-indigo-500/20 glow-indigo',
  };

  return (
    <div className={`p-5 rounded-2xl glass-panel glass-panel-hover border bg-gradient-to-br ${colorMap[color] || colorMap.emerald}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {change && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
