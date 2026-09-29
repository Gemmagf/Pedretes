import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer, BarChart3, Sparkles, FileText, Users, Gem, ArrowRight, Star, LogIn, Clock, CalendarCheck, Coins } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import DemoQuestionnaire from './DemoQuestionnaire';
import { Brand } from './Brand';
import { LanguageSelector } from './LanguageSelector';
import { Button } from './ui';

const FEATURES = [
  { icon: <Timer className="h-5 w-5" />, n: 1, cls: 'bg-gold-50 text-gold-700' },
  { icon: <BarChart3 className="h-5 w-5" />, n: 2, cls: 'bg-sky-50 text-sky-700' },
  { icon: <Sparkles className="h-5 w-5" />, n: 3, cls: 'bg-emerald-50 text-emerald-700' },
  { icon: <FileText className="h-5 w-5" />, n: 4, cls: 'bg-violet-50 text-violet-700' },
  { icon: <Users className="h-5 w-5" />, n: 5, cls: 'bg-rose-50 text-rose-700' },
  { icon: <Gem className="h-5 w-5" />, n: 6, cls: 'bg-copper-50 text-copper-600' },
] as const;

/** Illustrative app preview rendered with CSS only (no screenshot to maintain). */
const Preview: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="card mx-auto mt-14 max-w-4xl overflow-hidden border-cream-300 shadow-lift">
      <div className="flex items-center gap-1.5 border-b border-cream-200 bg-cream-50 px-4 py-2.5">
        {['#E8C3A5', '#E8D49B', '#DDD2BE'].map(c => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />)}
      </div>
      <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
        <div className="col-span-3 grid grid-cols-3 gap-3">
          {[
            { l: t('completedRevenue'), v: '18’450 CHF', i: <Coins className="h-4 w-4" />, brand: true },
            { l: t('openProjects'), v: '12', i: <Clock className="h-4 w-4" /> },
            { l: t('hoursPlanned'), v: '46 h', i: <CalendarCheck className="h-4 w-4" /> },
          ].map(k => (
            <div key={k.l} className={`rounded-xl p-3 ${k.brand ? 'bg-gradient-to-br from-copper-600 to-gold-500 text-white' : 'border border-cream-200 bg-white'}`}>
              <div className="flex items-center justify-between"><span className={`text-[9px] font-bold uppercase tracking-wider ${k.brand ? 'text-white/70' : 'text-ink-400'}`}>{k.l}</span><span className={k.brand ? 'text-white/70' : 'text-copper-500'}>{k.i}</span></div>
              <p className="mt-1 font-serif text-lg font-semibold sm:text-xl">{k.v}</p>
            </div>
          ))}
        </div>
        <div className="col-span-2 space-y-2">
          {[['Alliance 2 mm Brillant', 'Beyer', 'bg-gold-50 text-gold-700', 78], ['Solitär 1.2 ct', 'Peclard', 'bg-emerald-50 text-emerald-700', 100], ['Pavé-Ring Halbmemoire', 'Meister', 'bg-cream-100 text-ink-600', 20]].map(([n, c, cls, p]) => (
            <div key={n as string} className="rounded-xl border border-cream-200 bg-white p-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-copper-400" />
                <span className="flex-1 truncate text-xs font-semibold text-ink-900">{n}</span>
                <span className="hidden text-[10px] text-ink-400 sm:inline">{c}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${cls}`}>{p === 100 ? '✓' : `${p}%`}</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-cream-200"><div className="h-full rounded-full bg-copper-500" style={{ width: `${p}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-end rounded-xl border border-cream-200 bg-white p-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-ink-400">{t('monthlyTrend')}</p>
          <div className="flex h-24 items-end gap-1.5">
            {[35, 55, 40, 70, 60, 85, 75].map((h, i) => <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-copper-500 to-gold-400" style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-cream-200 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Brand />
          <div className="flex items-center gap-2">
            <span className="hidden sm:block"><LanguageSelector compact /></span>
            <Button variant="secondary" size="sm" onClick={onLogin} icon={<LogIn className="h-4 w-4" />}>{t('ctaLogin')}</Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-5 pt-32 pb-16 sm:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(201,162,77,0.18),transparent_60%)]" />
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white px-3 py-1.5 text-xs font-semibold text-copper-700">
              <Sparkles className="h-3.5 w-3.5" />{t('landingBadge')}
            </span>
            <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-6xl">
              {t('landingTitle1')}<br /><span className="bg-gradient-to-r from-copper-600 to-gold-500 bg-clip-text text-transparent">{t('landingTitle2')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">{t('landingLead')}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="gold" size="lg" onClick={() => setShowQuestionnaire(true)} icon={<Sparkles className="h-5 w-5" />}>{t('ctaDemo')} <ArrowRight className="h-4 w-4" /></Button>
              <Button variant="secondary" size="lg" onClick={onLogin}>{t('ctaLogin')}</Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <Preview />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-semibold text-ink-900">{t('featuresTitle')}</h2>
            <p className="mt-2 text-ink-400">{t('featuresSub')}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.n} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-2xl border border-cream-200 bg-cream-50 p-6 transition hover:border-gold-300 hover:shadow-soft">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.cls}`}>{f.icon}</div>
                <h3 className="font-semibold text-ink-900">{t(`feat${f.n}Title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t(`feat${f.n}Desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex justify-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />)}</div>
          <blockquote className="font-serif text-xl italic leading-relaxed text-ink-800 sm:text-2xl">“{t('testimonialQuote')}”</blockquote>
          <p className="mt-5 text-sm font-medium text-ink-400">— {t('testimonialAuthor')}</p>
        </div>
      </section>

      <section className="border-t border-cream-200 bg-gradient-to-br from-gold-50 to-copper-50 px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-ink-900">{t('ctaBottomTitle')}</h2>
          <p className="mt-3 text-ink-500">{t('ctaBottomText')}</p>
          <Button variant="gold" size="lg" className="mt-8" onClick={() => setShowQuestionnaire(true)} icon={<Sparkles className="h-5 w-5" />}>{t('ctaBottomButton')}</Button>
        </div>
      </section>

      <footer className="flex flex-col items-center gap-3 border-t border-cream-200 px-5 py-8 text-center text-xs text-ink-400 sm:flex-row sm:justify-between">
        <span>{t('footerText')}</span>
        <LanguageSelector compact />
      </footer>

      <AnimatePresence>{showQuestionnaire && <DemoQuestionnaire onClose={() => setShowQuestionnaire(false)} />}</AnimatePresence>
    </div>
  );
};

export default LandingPage;
