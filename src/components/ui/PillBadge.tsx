import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PillBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'muted' | 'emerald';
  pulseDot?: boolean;
  className?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  icon,
  variant = 'cyan',
  pulseDot = false,
  className,
}) => {
  const variantStyles = {
    cyan: 'bg-primary/[0.08] border-primary/20 text-cyan-300 shadow-[0_0_12px_rgba(0,217,255,0.08)]',
    purple: 'bg-secondary/[0.08] border-secondary/20 text-purple-300 shadow-[0_0_12px_rgba(121,40,202,0.08)]',
    muted: 'bg-white/[0.04] border-white/[0.08] text-slate-300',
    emerald: 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300',
  };

  const dotColor = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    muted: 'bg-slate-400',
    emerald: 'bg-emerald-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium tracking-wide select-none backdrop-blur-sm transition-colors',
          variantStyles[variant],
          className
        )
      )}
    >
      {pulseDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotColor[variant])} />
          <span className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', dotColor[variant])} />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
};
