import type { ProjectStatus } from '../types';

/** Locale used for numbers and dates per app language. */
export const LOCALES = { de: 'de-CH', en: 'en-GB', cat: 'ca-ES' } as const;

export const fmtNumber = (n: number, locale = 'de-CH', digits = 0) =>
  n.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtCHF = (n: number, locale = 'de-CH') => `${fmtNumber(n, locale)} CHF`;

/** minutes → "2h 15m" */
export const fmtMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/** seconds → "01:23:45" */
export const fmtClock = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

export const fmtDate = (iso: string | undefined, locale = 'de-CH', opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) => {
  if (!iso) return '—';
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, opts);
};

export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayISO = () => toISODate(new Date());

/** Whole days from today to a "YYYY-MM-DD" deadline (negative = overdue). */
export const daysUntil = (deadline: string | undefined) => {
  if (!deadline) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(`${deadline}T00:00:00`);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

export const statusKey = (status: ProjectStatus) =>
  status === 'In Progress' ? 'in_progress' : status === 'Completed' ? 'completed' : 'pending';

/** Stable pastel-copper hue derived from a string, for calendar chips. */
export const colorFor = (seed: string) => {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `hsl(${22 + (hash % 28)}, ${52 + (hash % 18)}%, ${42 + (hash % 14)}%)`;
};
