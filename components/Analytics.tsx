import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, Users, Award, Lightbulb, BarChart3, Star, AlertTriangle, Gem, Layers, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { useSettings } from '../context/SettingsContext';
import { useProjects } from '../hooks/useProjects';
import { planSchedule } from '../utils/planning';
import {
  computeClientInsights, computeMonthlyRevenue, computePersonStats, computeProfitabilityByType, computeRateBy, computeRevenueStats,
  overallRate, priceForTargetRate, sizeBandKey, SIZE_BAND_ORDER, stoneTypeKey, styleKey, type RateRow,
} from '../utils/analytics';
import { fmtDate, fmtMinutes, fmtNumber } from '../utils/format';
import { TYPE_LABEL } from '../utils/projectTypes';
import type { TranslationKey } from '../i18n';
import { Avatar, Card, EmptyState, LoadingBlock } from './ui';

const AXIS = { grid: { color: '#F6F1E8' }, ticks: { color: '#9C928A', font: { size: 11 } } };

/** Horizontal bars of CHF/h per segment with a target line. */
const RateTable: React.FC<{ rows: RateRow[]; target: number; labelOf?: (k: string) => string; max?: number }> = ({ rows, target, labelOf = k => k, max = 8 }) => {
  const { t, locale } = useTranslation();
  const top = Math.max(target, ...rows.map(r => r.chfPerHour)) * 1.05;
  return (
    <ul className="space-y-3">
      {rows.slice(0, max).map(r => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-medium text-ink-800" title={r.key}>{labelOf(r.key)}</span>
            <b className={`shrink-0 text-sm tnum ${r.chfPerHour >= target ? 'text-emerald-700' : r.chfPerHour >= target * 0.85 ? 'text-gold-700' : 'text-red-600'}`}>{fmtNumber(r.chfPerHour)} {t('chfPerHour')}</b>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div className={`h-full rounded-full ${r.chfPerHour >= target ? 'bg-emerald-500' : r.chfPerHour >= target * 0.85 ? 'bg-gold-400' : 'bg-red-400'}`} style={{ width: `${(r.chfPerHour / top) * 100}%` }} />
            <div className="absolute inset-y-0 w-px bg-ink-900/50" style={{ left: `${(target / top) * 100}%` }} title={`${t('targetRate')}: ${target}`} />
          </div>
          <p className="mt-1 text-[11px] text-ink-400">{r.count} {t('projectCount').toLowerCase()} · {fmtMinutes(r.minutes)}{r.avgPricePerStone > 0 && <> · Ø {fmtNumber(r.avgPricePerStone, locale, 1)} CHF/{t('stonesLabel')}</>} · {fmtNumber(r.revenue)} CHF</p>
        </li>
      ))}
    </ul>
  );
};

const Analytics: React.FC = () => {
  const { t, locale } = useTranslation();
  const { users } = useUsers();
  const { targetRate } = useSettings();
  const { projects, loading } = useProjects();

  const stats = useMemo(() => computeRevenueStats(projects), [projects]);
  const profitability = useMemo(() => computeProfitabilityByType(projects), [projects]);
  const monthly = useMemo(() => computeMonthlyRevenue(projects, 12), [projects]);
  const people = useMemo(() => computePersonStats(projects, users), [projects, users]);
  const byStyle = useMemo(() => computeRateBy(projects, styleKey, 3), [projects]);
  const byStone = useMemo(() => computeRateBy(projects, stoneTypeKey, 3), [projects]);
  const bySize = useMemo(() => computeRateBy(projects, sizeBandKey, 2).sort((a, b) => SIZE_BAND_ORDER.indexOf(a.key) - SIZE_BAND_ORDER.indexOf(b.key)), [projects]);
  const clients = useMemo(() => computeClientInsights(projects), [projects]);
  const avgRate = useMemo(() => overallRate(projects), [projects]);
  const lateCount = useMemo(() => planSchedule(projects, users, { weeks: 1 }).items.filter(i => i.late).length, [projects, users]);

  if (loading) return <LoadingBlock className="py-24" />;
  if (profitability.length === 0) return <Card><EmptyState icon={<BarChart3 className="h-6 w-6" />} title={t('noAnalyticsData')} /></Card>;

  // ── Recommendations ──────────────────────────────────────────────────────
  type Rec = { icon: React.ReactNode; text: string; cls: string };
  const recs: Rec[] = [];
  const bestSeg = [...byStyle].sort((a, b) => b.chfPerHour - a.chfPerHour)[0];
  if (bestSeg) recs.push({ icon: <Star className="h-4 w-4" />, text: t('topSegment', { key: bestSeg.key, rate: fmtNumber(bestSeg.chfPerHour) }), cls: 'border-gold-200 bg-gold-50 text-gold-700' });
  for (const r of byStyle.filter(r => r.chfPerHour < targetRate * 0.85 && r.count >= 3).slice(-2)) {
    recs.push({ icon: <Lightbulb className="h-4 w-4" />, text: t('pricingAdvice', { key: r.key, current: fmtNumber(r.avgPricePerStone, locale, 1), rate: fmtNumber(r.chfPerHour), target: targetRate, needed: fmtNumber(priceForTargetRate(r, targetRate), locale, 1) }), cls: 'border-sky-200 bg-sky-50 text-sky-800' });
  }
  const weakClient = clients.filter(c => c.count >= 5 && c.chfPerHour < targetRate * 0.8).sort((a, b) => b.revenue - a.revenue)[0];
  if (weakClient) recs.push({ icon: <Users className="h-4 w-4" />, text: t('clientBelowRate', { client: weakClient.key, rate: fmtNumber(weakClient.chfPerHour), target: targetRate }), cls: 'border-red-200 bg-red-50 text-red-800' });
  if (clients[0] && clients[0].share > 0.4) recs.push({ icon: <AlertTriangle className="h-4 w-4" />, text: t('concentrationRisk', { client: clients[0].key, share: Math.round(clients[0].share * 100) }), cls: 'border-amber-200 bg-amber-50 text-amber-900' });
  if (clients[0]) recs.push({ icon: <Award className="h-4 w-4" />, text: `${t('bestClient')}: ${t('recBestClient', { client: clients[0].key, revenue: fmtNumber(clients[0].revenue), count: clients[0].count })}`, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' });
  if (lateCount > 0) recs.push({ icon: <AlertTriangle className="h-4 w-4" />, text: t('lateRisk', { count: lateCount }), cls: 'border-red-200 bg-red-50 text-red-800' });

  const monthlyData = {
    labels: monthly.map(m => new Date(`${m.month}-01T12:00:00`).toLocaleDateString(locale, { month: 'short' })),
    datasets: [{ data: monthly.map(m => m.revenue), backgroundColor: '#C9A24D', hoverBackgroundColor: '#A8663A', borderRadius: 6, maxBarThickness: 36 }],
  };

  const kpis = [
    { label: t('revenueToday'), value: stats.today, cls: 'from-ink-700 to-ink-900' },
    { label: t('revenueMonth'), value: stats.month, cls: 'from-copper-600 to-copper-500' },
    { label: t('revenueYear'), value: stats.year, cls: 'from-gold-600 to-gold-400' },
    { label: t('revenueAllTime'), value: stats.allTime, cls: 'from-copper-700 to-gold-600' },
  ];
  const sizeLabel = (k: string) => t(`size_${k}` as TranslationKey);
  const trendIcon = (v: number | null) => v === null ? <Minus className="h-3.5 w-3.5 text-ink-300" /> : v > 1.15 ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : v < 0.85 ? <ArrowDownRight className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5 text-ink-400" />;

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${k.cls} p-5 text-white shadow-lift`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">{k.label}</p>
            <p className="tnum mt-2 font-serif text-2xl font-semibold">{fmtNumber(k.value)} <span className="text-sm font-sans font-medium text-white/70">CHF</span></p>
          </motion.div>
        ))}
      </div>

      {/* Rate vs target */}
      <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-copper-500"><Target className="h-5 w-5" /></span>
          <div>
            <p className="kicker">{t('currentRate')}</p>
            <p className="tnum font-serif text-2xl font-semibold text-ink-900">{fmtNumber(avgRate)} <span className="text-sm font-sans text-ink-500">{t('chfPerHour')}</span></p>
          </div>
        </div>
        <div className="text-sm text-ink-500">
          {t('targetRate')}: <b className="text-ink-900">{targetRate} {t('chfPerHour')}</b>
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${avgRate >= targetRate ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{avgRate >= targetRate ? '+' : ''}{fmtNumber(avgRate - targetRate)}</span>
        </div>
      </div>

      {recs.length > 0 && (
        <Card title={t('recommendations')} icon={<Lightbulb className="h-5 w-5" />}>
          <ul className="space-y-2">
            {recs.map((r, i) => <li key={i} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${r.cls}`}><span className="mt-0.5 shrink-0">{r.icon}</span><span>{r.text}</span></li>)}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t('monthlyTrend')} icon={<TrendingUp className="h-5 w-5" />}>
          <div className="h-56">
            <Bar data={monthlyData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ...AXIS }, x: { grid: { display: false }, ticks: AXIS.ticks } } }} />
          </div>
        </Card>
        <Card title={t('profitabilityByType')} icon={<BarChart3 className="h-5 w-5" />}>
          <RateTable target={targetRate} rows={profitability.map(p => ({ key: p.type, count: p.projectCount, minutes: p.totalMinutes, revenue: p.revenue, stones: 0, chfPerHour: p.chfPerHour, share: 0, avgPricePerStone: 0 }))} labelOf={k => TYPE_LABEL[k as keyof typeof TYPE_LABEL] ?? k} />
          <p className="mt-4 flex items-center justify-between border-t border-cream-200 pt-3 text-sm font-semibold text-ink-900"><span>{t('hourlyRate')}</span><span className="text-gold-600">{fmtNumber(avgRate)} {t('chfPerHour')}</span></p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title={t('byStyle')} icon={<Layers className="h-5 w-5" />} className="xl:col-span-1">
          {byStyle.length ? <RateTable rows={[...byStyle].sort((a, b) => b.count - a.count)} target={targetRate} max={10} /> : <EmptyState title={t('noAnalyticsData')} className="py-4" />}
        </Card>
        <Card title={t('byStoneType')} icon={<Gem className="h-5 w-5" />}>
          {byStone.length ? <RateTable rows={byStone} target={targetRate} /> : <EmptyState title={t('noAnalyticsData')} className="py-4" />}
        </Card>
        <Card title={t('bySize')} icon={<BarChart3 className="h-5 w-5" />}>
          {bySize.length ? <RateTable rows={bySize} target={targetRate} labelOf={sizeLabel} /> : <EmptyState title={t('noAnalyticsData')} className="py-4" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title={t('clientsInsights')} icon={<Award className="h-5 w-5" />} bodyClassName="overflow-x-auto p-2" className="xl:col-span-2">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400">
                <th className="px-3 py-2">{t('client')}</th><th className="px-3 py-2 text-right">{t('projectCount')}</th><th className="px-3 py-2 text-right">{t('hours')}</th>
                <th className="px-3 py-2 text-right">{t('revenue')}</th><th className="px-3 py-2 text-right">{t('share')}</th><th className="px-3 py-2 text-right">{t('chfPerHour')}</th>
                <th className="px-3 py-2 text-right">{t('lastOrder')}</th><th className="px-3 py-2 text-center">{t('trend')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 12).map(c => (
                <tr key={c.key} className="border-t border-cream-200 hover:bg-cream-50">
                  <td className="px-3 py-2 font-medium text-ink-900">{c.key}</td>
                  <td className="px-3 py-2 text-right text-ink-500 tnum">{c.count}</td>
                  <td className="px-3 py-2 text-right text-ink-500 tnum">{fmtNumber(c.minutes / 60, locale, 0)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-copper-600 tnum">{fmtNumber(c.revenue)}</td>
                  <td className="px-3 py-2 text-right text-ink-500 tnum">{Math.round(c.share * 100)}%</td>
                  <td className={`px-3 py-2 text-right font-semibold tnum ${c.chfPerHour >= targetRate ? 'text-emerald-700' : c.chfPerHour >= targetRate * 0.85 ? 'text-gold-700' : 'text-red-600'}`}>{fmtNumber(c.chfPerHour)}</td>
                  <td className="px-3 py-2 text-right text-ink-500">{fmtDate(c.lastDate, locale, { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="px-3 py-2 text-center"><span className="inline-flex justify-center">{trendIcon(c.trend)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title={t('byPerson')} icon={<Users className="h-5 w-5" />} bodyClassName="p-2">
          {people.length === 0 ? <EmptyState icon={<Users className="h-6 w-6" />} title={t('unassigned')} text={t('byPersonHint')} className="py-6" /> : (
            <ul className="divide-y divide-cream-200">
              {people.map(s => (
                <li key={s.user.id} className="flex items-center gap-3 px-3 py-3">
                  <Avatar name={s.user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900">{s.user.name}</p>
                    <p className="text-xs text-ink-400">{s.completed} {t('completedCount').toLowerCase()} · {s.open} {t('openCount').toLowerCase()} · {fmtMinutes(s.minutes)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-copper-600 tnum">{fmtNumber(s.revenue)} CHF</p>
                    <p className="text-xs text-ink-400">{fmtNumber(s.chfPerHour)} {t('chfPerHour')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
