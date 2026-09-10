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
    cyan: 'bg-white/[0.04] border-white/[0.12] text-[#b7a4fb] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]',
    purple: 'bg-white/[0.04] border-[#9382ff]/30 text-[#e59cff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.15)]',
    muted: 'bg-white/[0.03] border-white/[0.08] text-[#9b96b0]',
    emerald: 'bg-emerald-500/[0.08] border-emerald-400/25 text-emerald-300 shadow-[inset_0_-7px_11px_rgba(16,185,129,0.1)]',
  };

  const dotColor = {
    cyan: 'bg-[#9382ff]',
    purple: 'bg-[#ba9cff]',
    muted: 'bg-[#9b96b0]',
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
