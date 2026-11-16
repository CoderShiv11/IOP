import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-slate-50 dark:bg-slate-950/60 py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Indian Stock Market (NSE/BSE) IPO & FinBERT Sentiment Platform</span>
        </div>

        <div className="flex items-center gap-2 text-center md:text-right">
          <Info className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Data for analytical & educational purposes. Consult a SEBI-registered Investment Adviser before bidding.
          </span>
        </div>
      </div>
    </footer>
  );
};

