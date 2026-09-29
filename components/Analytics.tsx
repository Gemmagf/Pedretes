import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, Users, Award, Lightbulb, BarChart3, Star, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../hooks/useProjects';
import { computeClientStats, computeMonthlyRevenue, computePersonStats, computeProfitabilityByType, computeRevenueStats } from '../utils/analytics';
import { daysUntil, fmtMinutes, fmtNumber } from '../utils/format';
import { TYPE_LABEL } from '../utils/projectTypes';
import { Avatar, Card, EmptyState, LoadingBlock } from './ui';

const AXIS = { grid: { color: '#F6F1E8' }, ticks: { color: '#9C928A', font: { size: 11 } } };

const Analytics: React.FC = () => {
  const { t, locale } = useTranslation();
  const { users } = useUsers();
  const { projects, loading } = useProjects();

  const stats = useMemo(() => computeRevenueStats(projects), [projects]);
  const profitability = useMemo(() => computeProfitabilityByType(projects), [projects]);
  const clients = useMemo(() => computeClientStats(projects), [projects]);
  const monthly = useMemo(() => computeMonthlyRevenue(projects, 12), [projects]);
  const people = useMemo(() => computePersonStats(projects, users), [projects, users]);
  const overdue = projects.filter(p => p.status !== 'Completed' && (daysUntil(p.deadline) ?? 1) < 0).length;

  if (loading) return <LoadingBlock className="py-24" />;
  if (profitability.length === 0) return <Card><EmptyState icon={<BarChart3 className="h-6 w-6" />} title={t('noAnalyticsData')} /></Card>;

  const avgRate = Math.round(profitability.reduce((a, b) => a + b.chfPerHour, 0) / profitability.length);
  const best = profitability[0];
  const worst = profitability[profitability.length - 1];
  const topClient = clients[0];

  const recommendations: { icon: React.ReactNode; text: string; cls: string }[] = [];
  if (best) recommendations.push({ icon: <Star className="h-4 w-4" />, text: `${t('mostProfitable')}: ${t('recBestType', { type: TYPE_LABEL[best.type], rate: fmtNumber(best.chfPerHour) })}`, cls: 'border-gold-200 bg-gold-50 text-gold-700' });
  if (topClient) recommendations.push({ icon: <Award className="h-4 w-4" />, text: `${t('bestClient')}: ${t('recBestClient', { client: topClient.client, revenue: fmtNumber(topClient.revenue), count: topClient.projectCount })}`, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' });
  if (avgRate > 0 && avgRate < 100) recommendations.push({ icon: <TrendingUp className="h-4 w-4" />, text: t('recHourlyRate', { rate: fmtNumber(avgRate) }), cls: 'border-sky-200 bg-sky-50 text-sky-800' });
  if (profitability.length >= 2 && worst.chfPerHour < avgRate * 0.7) recommendations.push({ icon: <Lightbulb className="h-4 w-4" />, text: t('recWorstType', { type: TYPE_LABEL[worst.type], rate: fmtNumber(worst.chfPerHour) }), cls: 'border-red-200 bg-red-50 text-red-800' });
  if (overdue > 0) recommendations.push({ icon: <AlertTriangle className="h-4 w-4" />, text: t('recOverdue', { count: overdue }), cls: 'border-amber-200 bg-amber-50 text-amber-900' });

  const monthlyData = {
    labels: monthly.map(m => new Date(`${m.month}-01T12:00:00`).toLocaleDateString(locale, { month: 'short' })),
    datasets: [{ data: monthly.map(m => m.revenue), backgroundColor: '#C9A24D', hoverBackgroundColor: '#A8663A', borderRadius: 6, maxBarThickness: 36 }],
  };
  const profitData = {
    labels: profitability.map(p => TYPE_LABEL[p.type]),
    datasets: [{ data: profitability.map(p => p.chfPerHour), backgroundColor: ['#A8663A', '#C9A24D', '#B76E79'], borderRadius: 8, maxBarThickness: 48 }],
  };

  const kpis = [
    { label: t('revenueToday'), value: stats.today, cls: 'from-ink-700 to-ink-900' },
    { label: t('revenueMonth'), value: stats.month, cls: 'from-copper-600 to-copper-500' },
    { label: t('revenueYear'), value: stats.year, cls: 'from-gold-600 to-gold-400' },
    { label: t('revenueAllTime'), value: stats.allTime, cls: 'from-copper-700 to-gold-600' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${k.cls} p-5 text-white shadow-lift`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">{k.label}</p>
            <p className="mt-2 font-serif text-2xl font-semibold">{fmtNumber(k.value)} <span className="text-sm font-sans font-medium text-white/70">CHF</span></p>
          </motion.div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <Card title={t('recommendations')} icon={<Lightbulb className="h-5 w-5" />}>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${r.cls}`}>
                <span className="mt-0.5 shrink-0">{r.icon}</span><span>{r.text}</span>
              </li>
            ))}
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
          <div className="h-40">
            <Bar data={profitData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ...AXIS }, y: { grid: { display: false }, ticks: AXIS.ticks } } }} />
          </div>
          <ul className="mt-3 divide-y divide-cream-200 text-sm">
            {profitability.map(p => (
              <li key={p.type} className="flex items-center justify-between py-2">
                <span className="font-medium text-ink-800">{TYPE_LABEL[p.type]}</span>
                <span className="flex gap-4 text-xs text-ink-500">
                  <span>{p.projectCount} {t('projectCount')}</span>
                  <span>{fmtMinutes(p.totalMinutes)}</span>
                  <span className="font-bold text-copper-600">{fmtNumber(p.chfPerHour)} {t('chfPerHour')}</span>
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between pt-3 text-sm font-semibold text-ink-900">
              <span>{t('hourlyRate')}</span><span className="text-gold-600">{fmtNumber(avgRate)} {t('chfPerHour')}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t('topClients')} icon={<Award className="h-5 w-5" />} bodyClassName="p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400">
                <th className="px-3 py-2">#</th><th className="px-3 py-2">{t('client')}</th>
                <th className="px-3 py-2 text-right">{t('projectCount')}</th><th className="px-3 py-2 text-right">{t('avgPrice')}</th><th className="px-3 py-2 text-right">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 10).map((c, i) => (
                <tr key={c.client} className="border-t border-cream-200 hover:bg-cream-50">
                  <td className="px-3 py-2 text-ink-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-ink-900">{c.client}</td>
                  <td className="px-3 py-2 text-right text-ink-500">{c.projectCount}</td>
                  <td className="px-3 py-2 text-right text-ink-500">{fmtNumber(c.avgPrice)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-copper-600">{fmtNumber(c.revenue)} CHF</td>
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
                    <p className="text-xs text-ink-400">{s.completed} {t('completedCount').toLowerCase()} · {s.open} {t('openCount').toLowerCase()} · {fmtMinutes(s.minutes)} {t('trackedHours').toLowerCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-copper-600">{fmtNumber(s.revenue)} CHF</p>
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
