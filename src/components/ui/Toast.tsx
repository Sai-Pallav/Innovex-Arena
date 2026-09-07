import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; variant?: 'default' | 'success' | 'destructive' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = ({
    title,
    description,
    variant = 'default',
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'destructive';
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 animate-in slide-in-from-bottom-4 ${
              t.variant === 'destructive'
                ? 'bg-[#150a0e]/95 border-red-500/30 text-red-100'
                : t.variant === 'success'
                ? 'bg-[#081512]/95 border-emerald-500/30 text-emerald-100'
                : 'bg-[#0b101e]/95 border-cyan-400/30 text-foreground'
            }`}
          >
            {t.variant === 'destructive' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : t.variant === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-heading font-semibold text-xs sm:text-sm text-foreground">{t.title}</p>
              {t.description && <p className="text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.04] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
