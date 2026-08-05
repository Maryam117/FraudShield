import React from 'react';

export const RiskBadge = ({ score }) => {
  let style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let label = 'Low Risk';

  if (score > 70) {
    style = 'bg-rose-500/15 text-rose-400 border-rose-500/40 glow-rose animate-pulse';
    label = 'Critical Risk';
  } else if (score >= 30) {
    style = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    label = 'Medium Risk';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${style}`}>
      <span className="text-sm">{score}/100</span>
      <span className="opacity-80">({label})</span>
    </div>
  );
};
