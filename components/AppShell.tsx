import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, X, CalendarDays } from 'lucide-react';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import ProjectFormPage from './ProjectFormPage';
import UserManagement from './UserManagement';
import { useTranslation } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import type { TranslationKey } from '../i18n';

const PAGE_META: Record<string, { title: TranslationKey; subtitle: TranslationKey }> = {
  '/': { title: 'dashboardTitle', subtitle: 'dashboardSubtitle' },
  '/analytics': { title: 'analyticsTitle', subtitle: 'analyticsSubtitle' },
  '/alliance': { title: 'allianceFormTitle', subtitle: 'allianceSubtitle' },
  '/fassung': { title: 'fassungFormTitle', subtitle: 'fassungSubtitle' },
  '/pave': { title: 'paveFormTitle', subtitle: 'paveSubtitle' },
  '/users': { title: 'teamTitle', subtitle: 'teamSubtitle' },
};

const PageHeader: React.FC = () => {
  const { t, locale } = useTranslation();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? PAGE_META['/'];
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 h-[3px] w-10 rounded-full bg-gradient-to-r from-gold-400 to-copper-500" />
        <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[34px]">{t(meta.title)}</h1>
        <p className="mt-1.5 text-sm text-ink-500">{t(meta.subtitle)}</p>
      </div>
      <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-cream-200 bg-white/70 px-3 py-1 text-xs font-medium capitalize text-ink-500 sm:self-auto">
        <CalendarDays className="h-3.5 w-3.5 text-gold-500" />{today}
      </p>
    </header>
  );
};

const DemoBar: React.FC = () => {
  const { t } = useTranslation();
  const { exitDemo, demoAnswers } = useDemo();
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-300/60 bg-gold-50 px-4 py-2.5 text-xs text-gold-700">
      <span className="inline-flex items-center gap-2 font-semibold">
        <FlaskConical className="h-4 w-4" />
        {t('demoBanner')} · {demoAnswers?.workshopName} <span className="font-normal text-gold-600">· {t('demoSynthetic')}</span>
      </span>
      <button onClick={exitDemo} className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1 font-semibold hover:bg-white">
        <X className="h-3.5 w-3.5" /> {t('demoExit')}
      </button>
    </div>
  );
};

/** Authenticated (or demo) layout: sidebar + page header + routes. */
const AppShell: React.FC = () => {
  const { isDemoMode } = useDemo();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-cream-50">
      <Navigation />
      <div className="pt-14 lg:pl-64 lg:pt-0">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {isDemoMode && <DemoBar />}
          <PageHeader />
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alliance" element={<ProjectFormPage type="Alliance" />} />
            <Route path="/fassung" element={<ProjectFormPage type="Fassung" />} />
            <Route path="/pave" element={<ProjectFormPage type="Pave" />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
