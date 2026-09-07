import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'hero' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] select-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3 text-sm font-semibold gap-2.5',
  };

  const variantStyles = {
    hero: 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_24px_rgba(0,217,255,0.35)] hover:shadow-[0_0_32px_rgba(0,217,255,0.55)] hover:-translate-y-0.5 border-t border-white/50 active:translate-y-0',
    primary: 'bg-primary text-[#050811] hover:bg-[#38e1ff] font-semibold shadow-sm hover:shadow-[0_4px_18px_rgba(0,217,255,0.25)] hover:-translate-y-0.5',
    secondary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 font-semibold shadow-sm hover:shadow-[0_4px_18px_rgba(147,51,234,0.3)] hover:-translate-y-0.5',
    outline:
      'border border-white/[0.12] bg-slate-900/50 hover:bg-white/[0.08] text-slate-200 hover:text-white hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,217,255,0.15)] backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
