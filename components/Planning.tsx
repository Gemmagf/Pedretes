import React, { useMemo } from 'react';
import { CalendarRange, AlertTriangle, CheckCircle2, Hourglass, Gauge, Info, Users } from 'lucide-react';
import type { Project } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../hooks/useProjects';
import { planSchedule } from '../utils/planning';
import { colorFor, daysUntil, fmtDate, fmtMinutes, fmtNumber } from '../utils/format';
import { TYPE_LABEL } from '../utils/projectTypes';
import { Avatar, Card, EmptyState, Kpi, LoadingBlock, StatusBadge } from './ui';

const loadTone = (ratio: number) => ratio > 1 ? 'bg-red-500' : ratio > 0.85 ? 'bg-gold-400' : 'bg-emerald-500';

const Planning: React.FC = () => {
  const { t, locale } = useTranslation();
  const { users, userById } = useUsers();
  const { projects, loading, update } = useProjects();
  const plan = useMemo(() => planSchedule(projects, users, { weeks: 6 }), [projects, users]);

  const atRisk = plan.items.filter(i => i.late).length;
  const utilization = plan.capacityNext4Weeks > 0 ? plan.plannedNext4Weeks / plan.capacityNext4Weeks : 0;

  const assign = (p: Project, userId: string) => update({ ...p, assignedTo: userId || undefined });

  if (loading) return <LoadingBlock className="py-24" />;

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi tone="brand" label={t('openOrders')} value={plan.items.length} hint={`${t('remaining')} · ${fmtMinutes(plan.totalRemaining)}`} icon={<Hourglass className="h-5 w-5" />} />
        <Kpi label={t('capacityNext4')} value={`${fmtNumber(plan.capacityNext4Weeks / 60, locale)} h`} hint={`${t('planned')} · ${fmtNumber(plan.plannedNext4Weeks / 60, locale)} h`} icon={<Users className="h-5 w-5" />} />
        <Kpi label={t('utilization')} value={`${Math.round(utilization * 100)}%`} hint={t('capacityNext4')} icon={<Gauge className="h-5 w-5" />} />
        <Kpi label={t('riskCount')} value={atRisk} hint={atRisk > 0 ? t('atRisk') : t('onTrack')} icon={atRisk > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 px-4 py-3 text-sm text-ink-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />{t('planningHint')}
      </div>

      <Card title={t('weekLoad')} icon={<CalendarRange className="h-5 w-5" />} bodyClassName="overflow-x-auto p-2">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400">
              <th className="px-3 py-2">{t('week')}</th>
              {users.map(u => <th key={u.id} className="px-3 py-2">{u.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {plan.weeks.map(w => (
              <tr key={w.weekStart} className="border-t border-cream-200">
                <td className="px-3 py-2.5 font-medium text-ink-800">{fmtDate(w.weekStart, locale, { day: '2-digit', month: 'short' })}</td>
                {users.map(u => {
                  const v = w.perUser[u.id];
                  const ratio = v.capacity > 0 ? v.planned / v.capacity : 0;
                  return (
                    <td key={u.id} className="px-3 py-2.5">
                      <div className="flex items-center justify-between text-xs text-ink-500">
                        <span className="tnum">{fmtNumber(v.planned / 60, locale, 1)} / {fmtNumber(v.capacity / 60, locale, 0)} h</span>
                        <span className={`font-semibold ${ratio > 1 ? 'text-red-600' : ratio > 0.85 ? 'text-gold-700' : 'text-emerald-700'}`}>{v.capacity > 0 ? `${Math.round(ratio * 100)}%` : '—'}</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cream-200">
                        <div className={`h-full rounded-full ${loadTone(ratio)}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={t('queue')} icon={<Hourglass className="h-5 w-5" />} bodyClassName="p-2"
        action={<span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">{plan.items.length}</span>}>
        {plan.items.length === 0 ? <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title={t('noOpenOrders')} /> : (
          <ol className="divide-y divide-cream-200">
            {plan.items.map((item, idx) => {
              const p = item.project;
              const assignee = userById(item.assigneeId ?? undefined);
              const dl = daysUntil(p.deadline);
              return (
                <li key={p.id} className="flex flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center">
                  <span className="hidden w-6 text-center text-xs font-bold text-ink-300 lg:block">{idx + 1}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.projectName) }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{p.projectName}</p>
                    <p className="truncate text-xs text-ink-400">{p.client} · {TYPE_LABEL[p.sheetType]} · {t('remaining')} {fmtMinutes(item.remainingMinutes)}{!p.totalTime && <span className="text-gold-600"> · {t('noTimeEstimate')}</span>}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <label className="inline-flex items-center gap-1.5">
                      {assignee && <Avatar name={assignee.name} size="sm" />}
                      <select value={item.assigneeId ?? ''} onChange={e => assign(p, e.target.value)} className={`input w-36 py-1 text-xs ${item.autoAssigned ? 'border-dashed' : ''}`} aria-label={t('assign')}>
                        <option value="">{t('unassigned')}</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}{item.autoAssigned && u.id === item.assigneeId ? ` · ${t('autoAssigned')}` : ''}</option>)}
                      </select>
                    </label>
                    <span className="rounded-lg bg-cream-100 px-2 py-1 text-ink-600 tnum">
                      {item.start ? fmtDate(item.start, locale, { day: '2-digit', month: 'short' }) : '—'} → <span className="font-semibold text-ink-900">{item.finish ? fmtDate(item.finish, locale, { day: '2-digit', month: 'short' }) : '—'}</span>
                    </span>
                    <span className="text-ink-400">{t('deadline')}: {p.deadline ? fmtDate(p.deadline, locale, { day: '2-digit', month: 'short' }) : '—'}{dl !== null && dl < 0 ? ` (${t('overdue')})` : ''}</span>
                    {item.late
                      ? <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-semibold text-red-700"><AlertTriangle className="h-3 w-3" />{t('lateBy', { count: item.daysLate })}</span>
                      : p.deadline && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" />{t('onTrack')}</span>}
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
};

export default Planning;
