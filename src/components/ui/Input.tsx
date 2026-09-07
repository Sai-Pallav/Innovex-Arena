import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            {label} {props.required && <span className="text-primary">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-xl bg-[#0b101e]/80 border border-white/[0.08] text-foreground text-sm placeholder:text-slate-500 transition-all duration-200',
              'focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,217,255,0.12)] focus:bg-[#0e1424]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
