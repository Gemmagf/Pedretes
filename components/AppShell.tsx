import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FlaskConical, X } from 'lucide-react';
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
    <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{t(meta.title)}</h1>
        <p className="mt-1 text-sm text-ink-500">{t(meta.subtitle)}</p>
      </div>
      <p className="text-xs font-medium capitalize text-ink-400">{today}</p>
    </header>
  );
};

const DemoBar: React.FC = () => {
  const { t } = useTranslation();
  const { exitDemo, demoAnswers } = useDemo();
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
      <span className="inline-flex items-center gap-2 font-semibold">
        <FlaskConical className="h-4 w-4" />
        {t('demoBanner')} · {demoAnswers?.workshopName} <span className="font-normal text-amber-700">· {t('demoSynthetic')}</span>
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
  return (
    <div className="min-h-screen bg-cream-50">
      <Navigation />
      <div className="pt-14 lg:pl-64 lg:pt-0">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {isDemoMode && <DemoBar />}
          <PageHeader />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alliance" element={<ProjectFormPage type="Alliance" />} />
            <Route path="/fassung" element={<ProjectFormPage type="Fassung" />} />
            <Route path="/pave" element={<ProjectFormPage type="Pave" />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
