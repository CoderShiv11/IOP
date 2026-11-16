import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'bullish' | 'bearish' | 'neutral' | 'upcoming' | 'open' | 'listed';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent',
    outline: 'border border-border text-foreground',
    bullish: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    bearish: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    neutral: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    upcoming: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    open: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 animate-pulse',
    listed: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

