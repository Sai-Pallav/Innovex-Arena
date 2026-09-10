import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'cyan' | 'purple' | 'none';
  hoverEffect?: boolean;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  className,
  glow = 'cyan',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'wope-surface-card rounded-2xl p-6 relative overflow-hidden group flex flex-col',
          hoverEffect && 'hover:border-[#b7a4fb]/35 hover:shadow-[inset_0_0_28px_rgba(183,164,251,0.08),0_0_28px_rgba(113,61,255,0.16)] hover:-translate-y-1',
          className
        )
      )}
      {...props}
    >
      {/* Bottom Underglow Beam */}
      <div className="card-underglow-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Primary ambient violet spotlight in top-right */}
      <div
        className={clsx(
          'absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-0',
          hoverEffect && 'group-hover:opacity-100 group-hover:scale-110',
          'bg-[#713dff]/[0.12]'
        )}
      />

      {/* Complementary subtle counter-glow in bottom-left */}
      <div
        className={clsx(
          'absolute -bottom-20 -left-20 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-0',
          hoverEffect && 'group-hover:opacity-60',
          'bg-[#8562ff]/[0.08]'
        )}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full">{children}</div>
    </div>
  );
};
