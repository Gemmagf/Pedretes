import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ProjectStatus } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { statusKey } from '../../utils/format';

// --- Button -----------------------------------------------------------------

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-copper-600 text-white shadow-sm hover:bg-copper-700',
  gold: 'bg-gradient-to-r from-gold-500 to-copper-500 text-white shadow-md hover:shadow-lift hover:brightness-105',
  secondary: 'border border-cream-300 bg-white text-ink-800 hover:border-gold-400 hover:bg-gold-50',
  ghost: 'text-ink-700 hover:bg-cream-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};
const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', icon, loading, children, className = '', type = 'button', disabled, ...props }) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...props}
  >
    {loading ? <Spinner className="h-4 w-4 border-current" /> : icon}
    {children}
  </button>
);

// --- Card -------------------------------------------------------------------

export const Card: React.FC<{
  title?: React.ReactNode; icon?: React.ReactNode; action?: React.ReactNode; kicker?: string;
  className?: string; bodyClassName?: string; children: React.ReactNode;
}> = ({ title, icon, action, kicker, className = '', bodyClassName = '', children }) => (
  <section className={`card overflow-hidden ${className}`}>
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-copper-500 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
          <div className="min-w-0">
            {kicker && <p className="kicker">{kicker}</p>}
            {title && <h3 className="truncate font-sans text-[15px] font-semibold text-ink-900">{title}</h3>}
          </div>
        </div>
        {action}
      </header>
    )}
    <div className={bodyClassName || 'p-5'}>{children}</div>
  </section>
);

// --- Field ------------------------------------------------------------------

/** Label wraps the control so it is associated implicitly (accessible, no ids needed). */
export const Field: React.FC<{ label: React.ReactNode; hint?: React.ReactNode; className?: string; children: React.ReactNode }> =
  ({ label, hint, className = '', children }) => (
    <div className={className}>
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );

// --- Status badge -----------------------------------------------------------

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Pending: 'bg-cream-100 text-ink-700 border-cream-300',
  'In Progress': 'bg-gold-50 text-gold-700 border-gold-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const StatusBadge: React.FC<{ status: ProjectStatus; className?: string }> = ({ status, className = '' }) => {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]} ${className}`}>
      {t(statusKey(status))}
    </span>
  );
};

// --- Spinner / Empty --------------------------------------------------------

export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 border-gold-500' }) => (
  <span className={`inline-block animate-spin rounded-full border-2 border-b-transparent ${className}`} role="status" aria-label="loading" />
);

export const LoadingBlock: React.FC<{ className?: string }> = ({ className = 'py-12' }) => (
  <div className={`flex justify-center ${className}`}><Spinner /></div>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode; className?: string }> =
  ({ icon, title, text, action, className = '' }) => (
    <div className={`flex flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-ink-400">{icon}</div>}
      <p className="font-semibold text-ink-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-400">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

// --- KPI tile ---------------------------------------------------------------

export const Kpi: React.FC<{ label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode; tone?: 'default' | 'brand' }> =
  ({ label, value, hint, icon, tone = 'default' }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${tone === 'brand' ? 'bg-ink-900 text-cream-100 shadow-lift' : 'card'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`kicker ${tone === 'brand' ? 'text-cream-300/60' : ''}`}>{label}</p>
        {icon && <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone === 'brand' ? 'bg-white/10 text-gold-300' : 'bg-gold-50 text-copper-500'}`}>{icon}</span>}
      </div>
      <p className={`tnum mt-3 font-serif text-[30px] font-semibold leading-none sm:text-[34px] ${tone === 'brand' ? 'text-gold-300' : 'text-ink-900'}`}>{value}</p>
      {hint && <p className={`mt-2.5 text-xs ${tone === 'brand' ? 'text-cream-300/60' : 'text-ink-400'}`}>{hint}</p>}
      {tone === 'brand' && <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />}
    </motion.div>
  );

// --- Modal ------------------------------------------------------------------

export const Modal: React.FC<{ onClose: () => void; title?: React.ReactNode; subtitle?: React.ReactNode; footer?: React.ReactNode; size?: 'md' | 'lg'; children: React.ReactNode }> =
  ({ onClose, title, subtitle, footer, size = 'md', children }) => {
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [onClose]);

    return (
      <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-2xl ${size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl'}`}>
          {(title || subtitle) && (
            <div className="border-b border-cream-200 px-6 py-4">
              {title && <h2 className="font-serif text-xl font-semibold text-ink-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-cream-200 bg-cream-50 px-6 py-4">{footer}</div>}
        </motion.div>
      </div>
    );
  };

// --- Segmented control ------------------------------------------------------

export function Segmented<T extends string>({ value, options, onChange, size = 'md' }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="inline-flex rounded-xl bg-cream-100 p-1" role="tablist">
      {options.map(o => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-lg font-semibold transition-all ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'} ${value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// --- Avatar -----------------------------------------------------------------

export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ name, size = 'md', className = '' }) => {
  const s = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-8 w-8 text-xs';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-500 to-gold-500 font-bold text-white ${s} ${className}`} title={name}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
};
