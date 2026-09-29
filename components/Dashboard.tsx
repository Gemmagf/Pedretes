import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  Briefcase, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Play, Square,
  FileDown, Search, CalendarDays, AlertTriangle, Trash2, Pencil, Hourglass, Coins, TrendingUp, Users as UsersIcon,
} from 'lucide-react';
import type { Project, ProjectStatus, User } from '../types';
import { PROJECT_STATUSES } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useProjects } from '../hooks/useProjects';
import { exportProjectQuote } from '../utils/pdfExport';
import { useSettings } from '../context/SettingsContext';
import { planSchedule } from '../utils/planning';
import { upcomingDeadlines } from '../utils/analytics';
import { colorFor, daysUntil, fmtClock, fmtDate, fmtMinutes, fmtNumber, statusKey, toISODate } from '../utils/format';
import { TYPE_LABEL } from '../utils/projectTypes';
import { Avatar, Button, Card, EmptyState, Field, Kpi, LoadingBlock, Modal, Segmented, StatusBadge } from './ui';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

type Period = 'week' | 'month' | 'year' | 'all';
type StatusFilter = 'all' | ProjectStatus;

const CHART_OPTIONS = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#F6F1E8' }, ticks: { color: '#9C928A', font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { color: '#9C928A', font: { size: 11 } } },
  },
} as const;

// --- Deadline chip -----------------------------------------------------------

const DeadlineChip: React.FC<{ deadline?: string; done?: boolean }> = ({ deadline, done }) => {
  const { t, locale } = useTranslation();
  if (!deadline) return <span className="text-xs text-ink-300">{t('noDeadline')}</span>;
  const d = daysUntil(deadline)!;
  if (done) return <span className="text-xs text-ink-400">{fmtDate(deadline, locale)}</span>;
  const cls = d < 0 ? 'bg-red-50 text-red-700 border-red-200' : d === 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : d <= 3 ? 'bg-gold-50 text-gold-700 border-gold-200' : 'bg-cream-100 text-ink-600 border-cream-300';
  const label = d < 0 ? t('overdueBy', { count: -d }) : d === 0 ? t('dueToday') : d === 1 ? t('tomorrow') : t('inDays', { count: d });
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`} title={fmtDate(deadline, locale)}>
      {d < 0 && <AlertTriangle className="h-3 w-3" />}{label}
    </span>
  );
};

// --- Edit modal --------------------------------------------------------------

const ProjectEditModal: React.FC<{
  project: Project; users: User[]; onClose: () => void;
  onSave: (p: Project) => Promise<unknown>; onDelete: (p: Project) => Promise<unknown>;
}> = ({ project, users, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { targetRate: HOURLY_RATE } = useSettings();
  const [edited, setEdited] = useState<Project>({ ...project });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setEdited(prev => ({ ...prev, [k]: v }));

  const cost = ((edited.actualTime || 0) / 60) * HOURLY_RATE;
  const overPrice = !!edited.agreedPrice && cost > edited.agreedPrice;
  const overTime = !!edited.totalTime && (edited.actualTime || 0) > edited.totalTime;

  const save = async () => { setSaving(true); await onSave(edited); setSaving(false); onClose(); };
  const remove = async () => {
    if (!window.confirm(t('confirmDelete', { name: project.projectName }))) return;
    await onDelete(project);
    onClose();
  };

  return (
    <Modal onClose={onClose} title={t('editProject')} subtitle={`${edited.client} · ${TYPE_LABEL[edited.sheetType]}`}
      footer={<>
        <Button variant="ghost" onClick={remove} icon={<Trash2 className="h-4 w-4" />} className="mr-auto text-red-600 hover:bg-red-50">{t('deleteProject')}</Button>
        <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={save} loading={saving}>{t('saveChanges')}</Button>
      </>}>
      <div className="space-y-5">
        <div className="flex gap-1 rounded-xl bg-cream-100 p-1">
          {PROJECT_STATUSES.map(s => (
            <button key={s} onClick={() => set('status', s)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${edited.status === s ? 'bg-white text-copper-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
              {t(statusKey(s))}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('projectName')} className="sm:col-span-2">
            <input className="input" value={edited.projectName} onChange={e => set('projectName', e.target.value)} />
          </Field>
          <Field label={t('client')}>
            <input className="input" value={edited.client || ''} onChange={e => set('client', e.target.value)} />
          </Field>
          <Field label={t('assignedTo')}>
            <select className="input" value={edited.assignedTo || ''} onChange={e => set('assignedTo', e.target.value || undefined)}>
              <option value="">{t('unassigned')}</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label={t('deadline')}>
            <input type="date" className="input" value={edited.deadline || ''} onChange={e => set('deadline', e.target.value || undefined)} />
            <div className="mt-2"><DeadlineChip deadline={edited.deadline} done={edited.status === 'Completed'} /></div>
          </Field>
          <Field label={t('actualTime')} hint={edited.totalTime ? t('ofEstimated', { est: fmtMinutes(edited.totalTime) }) : undefined}>
            <input type="number" min={0} className="input" value={edited.actualTime ?? 0} onChange={e => set('actualTime', Number(e.target.value))} />
            {!!edited.totalTime && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                <div className={`h-full transition-all ${overTime ? 'bg-red-500' : 'bg-copper-500'}`} style={{ width: `${Math.min(((edited.actualTime || 0) / edited.totalTime) * 100, 100)}%` }} />
              </div>
            )}
          </Field>
        </div>

        <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="label mb-0">{t('agreedPrice')}</label>
            {(overPrice || overTime) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                <AlertTriangle className="h-3 w-3" />{overPrice ? t('priceAlert') : t('overEstimate')}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-sm font-semibold text-copper-600">CHF</span>
            <input type="number" min={0} className="input pl-14 font-serif text-xl font-semibold" value={edited.agreedPrice ?? ''} onChange={e => set('agreedPrice', e.target.value === '' ? undefined : Number(e.target.value))} />
          </div>
          <p className="mt-2 text-xs text-ink-500">{t('estimatedCost', { rate: HOURLY_RATE })}: <span className={`font-semibold ${overPrice ? 'text-red-600' : 'text-ink-800'}`}>{fmtNumber(cost)} CHF</span></p>
        </div>
      </div>
    </Modal>
  );
};

// --- Calendar ----------------------------------------------------------------

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const CalendarView: React.FC<{ projects: Project[]; date: Date; onNavigate: (d: Date) => void; onSelect: (p: Project) => void }> = ({ projects, date, onNavigate, onSelect }) => {
  const { t, locale } = useTranslation();
  const year = date.getFullYear(), month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => {
    const n = i - firstDay + 1;
    return n > 0 && n <= daysInMonth ? n : null;
  });
  const todayISO = toISODate(new Date());

  const spans = useMemo(() => projects.map(p => ({
    p,
    start: p.date.substring(0, 10),
    end: p.deadline || p.date.substring(0, 10),
    color: colorFor(p.projectName),
  })), [projects]);

  return (
    <Card bodyClassName="" title={date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })} icon={<CalendarDays className="h-5 w-5" />}
      action={<div className="flex gap-1">
        <button onClick={() => onNavigate(new Date(year, month - 1, 1))} aria-label={t('previousMonth')} className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-100"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => onNavigate(new Date())} className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-cream-100">{t('today')}</button>
        <button onClick={() => onNavigate(new Date(year, month + 1, 1))} aria-label={t('nextMonth')} className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-100"><ChevronRight className="h-5 w-5" /></button>
      </div>}>
      <div className="grid grid-cols-7 border-b border-cream-200 bg-cream-50 text-center">
        {DAY_KEYS.map(k => <div key={k} className="py-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">{t(k)}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const iso = day ? toISODate(new Date(year, month, day)) : '';
          const items = day ? spans.filter(s => iso >= s.start && iso <= s.end) : [];
          const isToday = iso === todayISO;
          return (
            <div key={idx} className={`min-h-[76px] border-b border-r border-cream-200 py-1 ${day ? (idx % 7 >= 5 ? 'bg-cream-50/70' : 'bg-white') : 'bg-cream-100/40'} ${idx % 7 === 6 ? 'border-r-0' : ''} ${isToday ? 'bg-gold-50/40' : ''}`}>
              {day && (
                <>
                  <span className={`mx-1 mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-ink-900 text-gold-300' : 'text-ink-500'}`}>{day}</span>
                  <div className="space-y-[3px]">
                    {items.slice(0, 3).map(s => {
                      const isStart = iso === s.start, isEnd = iso === s.end;
                      return (
                        <button key={s.p.id} onClick={() => onSelect(s.p)} title={`${s.p.projectName} · ${s.p.client}`}
                          className={`block h-[18px] truncate px-1.5 text-left text-[10px] font-semibold leading-[18px] text-white transition hover:brightness-110 ${isStart ? 'ml-1 rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''} ${isStart && isEnd ? 'w-[calc(100%-8px)]' : isStart || isEnd ? 'w-[calc(100%-4px)]' : 'w-full'} ${isStart ? '' : 'opacity-70'}`}
                          style={{ backgroundColor: s.color }}>
                          {isStart ? s.p.projectName : '\u00a0'}
                        </button>
                      );
                    })}
                    {items.length > 3 && <p className="pl-2 text-[10px] text-ink-400">+{items.length - 3} {t('more')}</p>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// --- Project row -------------------------------------------------------------

const useElapsed = (project: Project) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => {
      const base = (project.actualTime || 0) * 60;
      const extra = project.timerStartedAt ? (Date.now() - new Date(project.timerStartedAt).getTime()) / 1000 : 0;
      setElapsed(Math.floor(base + extra));
    };
    calc();
    if (!project.timerStartedAt) return;
    const id = window.setInterval(calc, 1000);
    return () => window.clearInterval(id);
  }, [project.timerStartedAt, project.actualTime]);
  return elapsed;
};

const ProjectRow: React.FC<{
  project: Project; user?: User; workshopName: string;
  onEdit: () => void; onStart: () => void; onStop: () => void; onStatus: (s: ProjectStatus) => void;
}> = ({ project, user, workshopName, onEdit, onStart, onStop, onStatus }) => {
  const { t } = useTranslation();
  const { targetRate: HOURLY_RATE } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const elapsed = useElapsed(project);
  const running = !!project.timerStartedAt;
  const minutes = elapsed / 60;
  const cost = Math.round((minutes / 60) * HOURLY_RATE);
  const progress = project.totalTime ? Math.min((minutes / project.totalTime) * 100, 100) : 0;
  const overBudget = !!project.agreedPrice && cost > project.agreedPrice;

  return (
    <div className={`rounded-xl border transition-colors ${running ? 'border-emerald-200 bg-emerald-50/40' : 'border-cream-200 bg-white hover:border-gold-200'}`}>
      <button onClick={() => setExpanded(v => !v)} className="flex w-full items-center gap-3 p-3 text-left" aria-expanded={expanded}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorFor(project.projectName) }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{project.projectName}</p>
          <p className="truncate text-xs text-ink-400">{project.client} · {TYPE_LABEL[project.sheetType]}</p>
        </div>
        <div className="hidden sm:block"><DeadlineChip deadline={project.deadline} done={project.status === 'Completed'} /></div>
        {user && <Avatar name={user.name} size="sm" />}
        <StatusBadge status={project.status} />
        {running && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
        {expanded ? <ChevronUp className="h-4 w-4 text-ink-300" /> : <ChevronDown className="h-4 w-4 text-ink-300" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-cream-200 px-4 pb-4 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream-50 p-3">
                <div>
                  <p className="text-xs font-medium text-ink-500">{running ? t('timerActive') : t('elapsedTime')}</p>
                  <p className={`font-mono text-2xl font-semibold tabular-nums ${running ? 'text-emerald-600' : 'text-ink-900'}`}>{fmtClock(elapsed)}</p>
                </div>
                {running
                  ? <Button variant="danger" size="sm" onClick={onStop} icon={<Square className="h-3.5 w-3.5" fill="currentColor" />}>{t('stopTimer')}</Button>
                  : <Button variant="success" size="sm" onClick={onStart} icon={<Play className="h-3.5 w-3.5" fill="currentColor" />}>{t('startTimer')}</Button>}
              </div>

              {!!project.totalTime && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-ink-500">
                    <span>{fmtMinutes(minutes)} / {fmtMinutes(project.totalTime)}</span>
                    <span className={progress >= 100 ? 'font-semibold text-red-600' : ''}>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                    <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-red-500' : 'bg-copper-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-cream-200 p-2.5">
                  <p className="text-ink-400">{t('estimatedCost', { rate: HOURLY_RATE })}</p>
                  <p className={`text-base font-semibold ${overBudget ? 'text-red-600' : 'text-ink-900'}`}>{fmtNumber(cost)} CHF</p>
                </div>
                <div className="rounded-lg border border-cream-200 p-2.5">
                  <p className="text-ink-400">{t('agreedPrice')}</p>
                  <p className="text-base font-semibold text-copper-600">{project.agreedPrice ? `${fmtNumber(project.agreedPrice)} CHF` : '—'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-lg bg-cream-100 p-0.5">
                  {PROJECT_STATUSES.map(s => (
                    <button key={s} onClick={() => onStatus(s)} className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${project.status === s ? 'bg-white text-copper-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
                      {t(statusKey(s))}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => exportProjectQuote(project, workshopName)} icon={<FileDown className="h-3.5 w-3.5" />}>PDF</Button>
                  <Button variant="secondary" size="sm" onClick={onEdit} icon={<Pencil className="h-3.5 w-3.5" />}>{t('edit')}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Dashboard ---------------------------------------------------------------

const Dashboard: React.FC = () => {
  const { t, locale } = useTranslation();
  const { users, userById } = useUsers();
  const { toast } = useToast();
  const { workshopName } = useData();
  const { projects, loading, update, remove, startTimer, stopTimer, setStatus } = useProjects();

  const [period, setPeriod] = useState<Period>('month');
  const [status, setStatusFilter] = useState<StatusFilter>('all');
  const [userFilter, setUserFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
    const q = query.trim().toLowerCase();
    return projects.filter(p => {
      if (userFilter !== 'all' && p.assignedTo !== userFilter) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (q && !`${p.projectName} ${p.client}`.toLowerCase().includes(q)) return false;
      const d = new Date(p.date);
      if (period === 'year') return d.getFullYear() === today.getFullYear();
      if (period === 'month') return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
      if (period === 'week') return d >= monday && d <= sunday;
      return true;
    });
  }, [projects, period, status, userFilter, query]);

  const revenue = filtered.filter(p => p.status === 'Completed').reduce((s, p) => s + (p.agreedPrice || 0), 0);
  const counts = {
    open: filtered.filter(p => p.status !== 'Completed').length,
    completed: filtered.filter(p => p.status === 'Completed').length,
    plannedHours: filtered.filter(p => p.status !== 'Completed').reduce((s, p) => s + Math.max(0, (p.totalTime || 0) - (p.actualTime || 0)), 0) / 60,
  };
  const deadlines = useMemo(() => upcomingDeadlines(projects, 6), [projects]);
  const lateIds = useMemo(() => new Set(planSchedule(projects, users, { weeks: 1 }).items.filter(i => i.late).map(i => i.project.id)), [projects, users]);
  const overdueCount = deadlines.filter(p => (daysUntil(p.deadline) ?? 1) < 0).length;

  const workloadData = useMemo(() => ({
    labels: users.map(u => u.name),
    datasets: [{
      data: users.map(u => projects.filter(p => p.assignedTo === u.id && p.status !== 'Completed').reduce((a, p) => a + Math.max(0, (p.totalTime || 0) - (p.actualTime || 0)) / 60, 0)),
      backgroundColor: '#C9A24D', hoverBackgroundColor: '#A8663A', borderRadius: 6, barThickness: 22,
    }],
  }), [users, projects]);

  const revenueData = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const p of projects) if (p.status === 'Completed') byMonth.set(p.date.substring(0, 7), (byMonth.get(p.date.substring(0, 7)) || 0) + (p.agreedPrice || 0));
    const keys = [...byMonth.keys()].sort().slice(-12);
    return {
      labels: keys.map(k => new Date(`${k}-01T12:00:00`).toLocaleDateString(locale, { month: 'short', year: '2-digit' })),
      datasets: [{ data: keys.map(k => byMonth.get(k)!), borderColor: '#A8663A', backgroundColor: 'rgba(201,162,77,0.18)', pointBackgroundColor: '#C9A24D', pointBorderColor: '#fff', pointRadius: 3, tension: 0.35, fill: true }],
    };
  }, [projects, locale]);

  const save = useCallback(async (p: Project) => { await update(p); toast(t('projectUpdated')); }, [update, toast, t]);
  const del = useCallback(async (p: Project) => { await remove(p.id); toast(t('projectDeleted'), 'info'); }, [remove, toast, t]);

  return (
    <div className="space-y-6 pb-10">
      <AnimatePresence>
        {selected && <ProjectEditModal project={selected} users={users} onClose={() => setSelected(null)} onSave={save} onDelete={del} />}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <Segmented<Period> value={period} onChange={setPeriod} options={(['week', 'month', 'year', 'all'] as Period[]).map(v => ({ value: v, label: t(`filter_${v}`) }))} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="input pl-9" aria-label={t('search')} />
        </div>
        <select value={status} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="input lg:w-44" aria-label={t('status')}>
          <option value="all">{t('statusAll')}</option>
          {PROJECT_STATUSES.map(s => <option key={s} value={s}>{t(statusKey(s))}</option>)}
        </select>
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="input lg:w-48" aria-label={t('filterByUser')}>
          <option value="all">{t('allUsers')}</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi tone="brand" label={t('completedRevenue')} value={<>{fmtNumber(revenue)} <span className="text-base font-sans font-medium opacity-80">CHF</span></>} hint={t('revenueHint')} icon={<Coins className="h-5 w-5" />} />
        <Kpi label={t('openProjects')} value={counts.open} hint={`${t('projectsInProgress')} · ${t(`filter_${period}`)}`} icon={<Briefcase className="h-5 w-5" />} />
        <Kpi label={t('completed')} value={counts.completed} hint={t(`filter_${period}`)} icon={<CheckCircle2 className="h-5 w-5" />} />
        <Kpi label={t('hoursPlanned')} value={`${fmtNumber(counts.plannedHours, locale, 1)} h`} hint={t('openProjects')} icon={<Hourglass className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <CalendarView projects={filtered} date={calendarDate} onNavigate={setCalendarDate} onSelect={setSelected} />

          <Card title={t('projectsInProgress')} icon={<Briefcase className="h-5 w-5" />} bodyClassName="p-3"
            action={<span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">{filtered.length}</span>}>
            {loading ? <LoadingBlock /> : filtered.length === 0 ? (
              <EmptyState icon={<Briefcase className="h-6 w-6" />} title={query ? t('noResults') : t('noProjects')} />
            ) : (
              <div className="scrollbar-thin max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {filtered.map(p => (
                  <ProjectRow key={p.id} project={p} user={userById(p.assignedTo)} workshopName={workshopName}
                    onEdit={() => setSelected(p)} onStart={() => startTimer(p)} onStop={() => stopTimer(p)} onStatus={s => setStatus(p, s)} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('upcomingDeadlines')} icon={<Clock className="h-5 w-5" />} bodyClassName="p-2"
            action={overdueCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700"><AlertTriangle className="h-3 w-3" />{overdueCount}</span>}>
            {deadlines.length === 0 ? <EmptyState title={t('noDeadlines')} className="py-6" /> : (
              <ul className="divide-y divide-cream-200">
                {deadlines.map(p => (
                  <li key={p.id}>
                    <button onClick={() => setSelected(p)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-cream-50">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.projectName) }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{p.projectName}</span>
                        <span className="block truncate text-xs text-ink-400">{p.client} · {fmtDate(p.deadline, locale, { day: '2-digit', month: 'short' })}</span>
                      </span>
                      {lateIds.has(p.id) && <span title={t('atRisk')} className="text-red-500"><AlertTriangle className="h-3.5 w-3.5" /></span>}
                      <DeadlineChip deadline={p.deadline} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={period === 'all' ? t('revenueEvolution') : t('weeklyWorkload')} icon={period === 'all' ? <TrendingUp className="h-5 w-5" /> : <UsersIcon className="h-5 w-5" />}>
            <div className="h-56">
              {period === 'all'
                ? <Line data={revenueData} options={CHART_OPTIONS} />
                : <Bar data={workloadData} options={{ ...CHART_OPTIONS, scales: { ...CHART_OPTIONS.scales, y: { ...CHART_OPTIONS.scales.y, ticks: { ...CHART_OPTIONS.scales.y.ticks, callback: (v: unknown) => `${v} h` } } } }} />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
