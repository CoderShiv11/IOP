import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface GMPBadgeProps {
  gmp: number;
  expectedGainPct?: number;
  showGain?: boolean;
}

export const GMPBadge: React.FC<GMPBadgeProps> = ({ gmp, expectedGainPct, showGain = true }) => {
  const isPositive = gmp > 0;
  const isNeutral = gmp === 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border ${
        isNeutral
          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          : isPositive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      }`}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
      )}
      <span>{formatINR(gmp)}</span>
      {showGain && expectedGainPct !== undefined && (
        <span className="text-[11px] opacity-90 font-normal">
          ({isPositive ? '+' : ''}{expectedGainPct.toFixed(1)}%)
        </span>
      )}
    </div>
  );
};

