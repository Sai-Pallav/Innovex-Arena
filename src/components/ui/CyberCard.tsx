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
          // Base surface — dark physical material inside the environment.
          'wope-surface-card rounded-2xl p-6 relative overflow-hidden group flex flex-col',
          'shadow-[0_4px_24px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.04)_inset]',
          'transition-[border-color,box-shadow,transform] duration-200 ease-out cursor-pointer',
          // Instantaneous hover response: 200ms ease-out
          hoverEffect &&
            'hover:border-[#b7a4fb]/35 hover:shadow-[inset_0_0_22px_rgba(183,164,251,0.07),0_8px_28px_rgba(0,0,0,0.55),0_0_20px_rgba(113,61,255,0.11)] hover:-translate-y-1',
          className
        )
      )}
      {...props}
    >
      {/* Bottom Underglow Beam */}
      <div className="card-underglow-beam opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out" />

      {/* Primary ambient inner rim — top-right corner.
          GPU-composited box-shadow with instant 200ms transition */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 ease-out opacity-0',
          hoverEffect && 'group-hover:opacity-100',
        )}
        style={{
          boxShadow: 'inset 18px -18px 48px -8px rgba(113, 61, 255, 0.08)',
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full">{children}</div>
    </div>
  );
};
