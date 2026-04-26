import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import { useTranslation } from '../context/LanguageContext';
import {
  getRevenueStats, getProfitabilityByType, getClientStats, getMonthlyRevenue,
  RevenueStats, ProfitabilityByType, ClientStats, MonthlyRevenue
} from '../services/supabase';
import { TrendingUp, Users, Award, Lightbulb, BarChart2, Star } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const Analytics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityByType[]>([]);
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, p, c, m] = await Promise.all([
        getRevenueStats(),
        getProfitabilityByType(),
        getClientStats(),
        getMonthlyRevenue(),
      ]);
      setStats(s);
      setProfitability(p);
      setClients(c);
      setMonthly(m);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jewelry-gold" />
    </div>
  );

  const totalChfPerHour = profitability.length
    ? Math.round(profitability.reduce((a, b) => a + b.chfPerHour, 0) / profitability.length)
    : 0;

  const best = profitability[0];
  const topClient = clients[0];

  // Recomanacions
  const recommendations: { icon: React.ReactNode; text: string; color: string }[] = [];
  if (best) {
    recommendations.push({
      icon: <Star className="w-4 h-4" />,
      text: `${t('mostProfitable')}: ${t('recBestType', { type: best.type, rate: fmt(best.chfPerHour) })}`,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
    });
  }
  if (topClient) {
    recommendations.push({
      icon: <Award className="w-4 h-4" />,
      text: `${t('bestClient')}: ${t('recBestClient', { client: topClient.client, revenue: fmt(topClient.revenue), count: topClient.projectCount })}`,
      color: 'bg-green-50 border-green-200 text-green-800',
    });
  }
  if (totalChfPerHour > 0 && totalChfPerHour < 100) {
    recommendations.push({
      icon: <TrendingUp className="w-4 h-4" />,
      text: t('recHourlyRate', { rate: fmt(totalChfPerHour) }),
      color: 'bg-blue-50 border-blue-200 text-blue-800',
    });
  }
  if (profitability.length >= 2) {
    const worst = profitability[profitability.length - 1];
    if (worst.chfPerHour < totalChfPerHour * 0.7) {
      recommendations.push({
        icon: <Lightbulb className="w-4 h-4" />,
        text: t('recWorstType', { type: worst.type, rate: fmt(worst.chfPerHour) }),
        color: 'bg-red-50 border-red-200 text-red-800',
      });
    }
  }

  // Gràfica mensual
  const monthlyChartData = {
    labels: monthly.slice(-12).map(m => m.month),
    datasets: [{
      label: 'CHF',
      data: monthly.slice(-12).map(m => m.revenue),
      borderColor: '#b87333',
      backgroundColor: 'rgba(205, 127, 50, 0.15)',
      pointBackgroundColor: '#b5a642',
      pointBorderColor: '#fff',
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }],
  };

  // Gràfica rendibilitat per tipus
  const profitChartData = {
    labels: profitability.map(p => p.type),
    datasets: [{
      label: 'CHF/hora',
      data: profitability.map(p => p.chfPerHour),
      backgroundColor: ['#cd7f32', '#b5a642', '#b87333'],
      borderRadius: 6,
      barThickness: 40,
    }],
  };

  const kpis = [
    { label: t('revenueToday'), value: stats?.today ?? 0, color: 'from-gray-600 to-gray-800' },
    { label: t('revenueMonth'), value: stats?.month ?? 0, color: 'from-jewelry-copper to-jewelry-bronze' },
    { label: t('revenueYear'), value: stats?.year ?? 0, color: 'from-jewelry-gold to-jewelry-brass' },
    { label: t('revenueAllTime'), value: stats?.allTime ?? 0, color: 'from-amber-700 to-amber-900' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${kpi.color} p-5 rounded-2xl text-white shadow-lg`}
          >
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">{kpi.label}</p>
            <p className="text-2xl font-serif font-bold">{fmt(kpi.value)}</p>
            <p className="text-xs opacity-60 mt-1">CHF</p>
          </motion.div>
        ))}
      </div>

      {/* Recomanacions */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-jewelry-gold/20 shadow-sm p-5">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-jewelry-gold" />
            {t('recommendations')}
          </h3>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${r.color}`}>
                <span className="mt-0.5 flex-shrink-0">{r.icon}</span>
                <p className="text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tendència mensual */}
        <div className="bg-white rounded-2xl border border-jewelry-gold/20 shadow-sm p-5">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-jewelry-copper" />
            {t('monthlyTrend')}
          </h3>
          <div className="h-52">
            <Line
              data={monthlyChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: (v) => `${v} CHF` } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Rendibilitat per tipus */}
        <div className="bg-white rounded-2xl border border-jewelry-gold/20 shadow-sm p-5">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-jewelry-copper" />
            {t('profitabilityByType')}
          </h3>
          <div className="h-52">
            <Bar
              data={profitChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: (v) => `${v} CHF/h` } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {profitability.map(p => (
              <div key={p.type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">{p.type}</span>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{p.projectCount} proj.</span>
                  <span className="font-bold text-jewelry-copper">{fmt(p.chfPerHour)} CHF/h</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-700">
              <span>{t('hourlyRate')}</span>
              <span className="text-jewelry-gold">{fmt(totalChfPerHour)} CHF/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-2xl border border-jewelry-gold/20 shadow-sm p-5">
        <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-jewelry-copper" />
          {t('topClients')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs uppercase text-jewelry-brass tracking-wider">
                <th className="p-2 pl-4">#</th>
                <th className="p-2">{t('client')}</th>
                <th className="p-2 text-right">{t('projectCount')}</th>
                <th className="p-2 text-right">{t('avgPrice')}</th>
                <th className="p-2 text-right">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 10).map((c, i) => (
                <tr key={c.client} className="bg-gray-50 hover:bg-amber-50 transition-colors rounded-lg">
                  <td className="p-2 pl-4 rounded-l-lg text-gray-400 font-medium">{i + 1}</td>
                  <td className="p-2 font-semibold text-gray-800">{c.client}</td>
                  <td className="p-2 text-right text-gray-500">{c.projectCount}</td>
                  <td className="p-2 text-right text-gray-500">{fmt(c.avgPrice)} CHF</td>
                  <td className="p-2 pr-4 text-right font-bold text-jewelry-copper rounded-r-lg">{fmt(c.revenue)} CHF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
