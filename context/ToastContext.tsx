import React, { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; message: string; }

interface ToastContextType { toast: (message: string, kind?: ToastKind) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  error: <AlertCircle className="h-4 w-4 text-red-600" />,
  info: <Info className="h-4 w-4 text-gold-600" />,
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++counter.current;
    setToasts(prev => [...prev.slice(-3), { id, kind, message }]);
    window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" aria-live="polite">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-cream-200 bg-white/95 px-4 py-3 text-sm text-ink-800 shadow-lift backdrop-blur">
              <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="rounded p-0.5 text-ink-300 hover:text-ink-700" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
