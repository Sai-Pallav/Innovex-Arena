import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const cleanLabel = label ? label.replace(/\s*\*+$/, '').trim() : '';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#9b96b0]">
            {cleanLabel} {props.required && <span className="text-[#b7a4fb] font-bold">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-white text-sm placeholder:text-[#6b6680] shadow-[inset_0_0_16px_rgba(255,255,255,0.02)] transition-all duration-200 resize-y min-h-[100px]',
              'focus:outline-none focus:border-[#9382ff]/60 focus:ring-2 focus:ring-[#9382ff]/20 focus:shadow-[0_0_20px_rgba(147,130,255,0.15)] focus:bg-white/[0.07]',
              'hover:border-white/[0.22]',
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

Textarea.displayName = 'Textarea';
