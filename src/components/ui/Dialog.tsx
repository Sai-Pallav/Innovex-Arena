import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0a0118] backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] p-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Shimmer hairline */}
        <div className="aurora-divider-line absolute top-0 left-0 right-0" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-rebond text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#9b96b0] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-white hover:border-[#9382ff]/60 hover:bg-white/[0.08] transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle underglow beam */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#9382ff]/40 to-transparent pointer-events-none" />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
