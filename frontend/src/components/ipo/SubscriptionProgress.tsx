import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatMultiplier } from '@/lib/utils';

interface SubscriptionProgressProps {
  total: number;
  qib?: number;
  nii?: number;
  retail?: number;
  compact?: boolean;
}

export const SubscriptionProgress: React.FC<SubscriptionProgressProps> = ({
  total,
  qib,
  nii,
  retail,
  compact = false,
}) => {
  // Normalize visual progress up to 25x for clear gauge
  const visualValue = Math.min(100, (total / 20) * 100);

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full max-w-[120px]">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-500 text-[10px]">Total</span>
          <span className={`font-semibold ${total >= 1 ? 'text-emerald-500' : 'text-slate-400'}`}>
            {formatMultiplier(total)}
          </span>
        </div>
        <Progress
          value={visualValue}
          indicatorClassName={total >= 5 ? 'bg-purple-500' : total >= 1 ? 'bg-emerald-500' : 'bg-slate-400'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Oversubscription</span>
        <span className={`text-sm font-mono font-bold ${total >= 1 ? 'text-emerald-500' : 'text-slate-500'}`}>
          {formatMultiplier(total)}
        </span>
      </div>
      <Progress
        value={visualValue}
        indicatorClassName={total >= 10 ? 'bg-purple-600' : total >= 1 ? 'bg-emerald-500' : 'bg-blue-500'}
      />

      {(qib !== undefined || nii !== undefined || retail !== undefined) && (
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-border">
            <div className="text-[10px] text-slate-400 font-sans uppercase">QIB Inst.</div>
            <div className="text-xs font-semibold text-blue-500">{formatMultiplier(qib ?? 0)}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-border">
            <div className="text-[10px] text-slate-400 font-sans uppercase">NII / HNI</div>
            <div className="text-xs font-semibold text-indigo-500">{formatMultiplier(nii ?? 0)}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-border">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Retail Individual</div>
            <div className="text-xs font-semibold text-emerald-500">{formatMultiplier(retail ?? 0)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

