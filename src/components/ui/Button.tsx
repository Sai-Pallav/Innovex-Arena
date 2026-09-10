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
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] select-none';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-7 py-3 text-sm font-semibold gap-2.5',
  };

  const variantStyles = {
    hero: 'bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium border border-white/[0.14] hover:border-[#b7a4fb]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_24px_rgba(113,61,255,0.25)] backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0',
    primary: 'bg-[#713dff] hover:bg-[#8562ff] text-white font-medium shadow-[0_0_20px_rgba(113,61,255,0.35)] hover:shadow-[0_0_28px_rgba(133,98,255,0.5)] hover:-translate-y-0.5',
    secondary: 'bg-[#10093a] hover:bg-[#16092a] text-[#f4f0ff] font-medium border border-[#b7a4fb]/25 hover:border-[#b7a4fb]/50 shadow-[inset_0_0_16px_rgba(183,164,251,0.06),0_0_18px_rgba(113,61,255,0.2)] hover:-translate-y-0.5',
    outline:
      'border border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.06] text-[#d2d0dd] hover:text-white hover:border-[#b7a4fb]/40 hover:shadow-[0_0_18px_rgba(113,61,255,0.18)] backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent text-[#9b96b0] hover:text-white hover:bg-white/[0.04]',
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
