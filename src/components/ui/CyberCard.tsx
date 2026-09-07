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
          'glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col',
          hoverEffect && 'glass-card-hover',
          hoverEffect && glow === 'cyan' && 'hover:border-cyan-400/30 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),0_0_25px_rgba(0,217,255,0.08)]',
          hoverEffect && glow === 'purple' && 'glass-card-purple hover:border-purple-400/30 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.08)]',
          className
        )
      )}
      {...props}
    >
      {/* Hairline shimmer at top border that glides on hover */}
      {hoverEffect && (
        <div className={glow === 'purple' ? 'shimmer-hairline-purple' : 'shimmer-hairline'} />
      )}

      {/* Primary ambient spotlight in top-right */}
      <div
        className={clsx(
          'absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-0',
          hoverEffect && 'group-hover:opacity-100 group-hover:scale-110',
          glow === 'purple' ? 'bg-purple-500/[0.12]' : 'bg-cyan-400/[0.10]'
        )}
      />

      {/* Complementary subtle counter-glow in bottom-left for dual-tone cyber depth */}
      <div
        className={clsx(
          'absolute -bottom-20 -left-20 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-0',
          hoverEffect && 'group-hover:opacity-60',
          glow === 'purple' ? 'bg-cyan-500/[0.05]' : 'bg-purple-500/[0.05]'
        )}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full">{children}</div>
    </div>
  );
};
