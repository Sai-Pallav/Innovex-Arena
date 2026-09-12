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
          // Outer box-shadow: subtle ambient occlusion-like separation
          // so cards read as solid surfaces with slight depth, not flat rects.
          // The shadow is not decorative — it creates the environmental gap
          // between the background atmosphere and the card surface.
          'wope-surface-card rounded-2xl p-6 relative overflow-hidden group flex flex-col',
          'shadow-[0_4px_24px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.04)_inset]',
          // Hover: border brightens slightly, inner glow strengthens, lift.
          // Glow reduced from 28px rgba(113,61,255,0.16) → 20px rgba(113,61,255,0.11)
          // so individual cards don't overpower the atmospheric system when
          // multiple are hovered simultaneously (Workshops 3×3 grid).
          hoverEffect && 'hover:border-[#b7a4fb]/35 hover:shadow-[inset_0_0_22px_rgba(183,164,251,0.07),0_8px_28px_rgba(0,0,0,0.55),0_0_20px_rgba(113,61,255,0.11)] hover:-translate-y-1',
          className
        )
      )}
      {...props}
    >
      {/* Bottom Underglow Beam */}
      <div className="card-underglow-beam opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Primary ambient inner rim — top-right corner.
          Pure box-shadow rather than blur-filtered div.
          GPU-composited, no filter pass.
          Opacity kept low so multiple cards don't stack
          into a neon zone (critical for Workshops 3×3 grid). */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 opacity-0',
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
