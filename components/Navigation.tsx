import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, CircleDot, Gem, Sparkles, Users, Menu, X, LogOut, FlaskConical, Timer } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { useProjects } from '../hooks/useProjects';
import { LanguageSelector } from './LanguageSelector';
import { Brand } from './Brand';
import { Avatar } from './ui';
import type { TranslationKey } from '../i18n';

interface Link { path: string; icon: React.ComponentType<{ className?: string }>; labelKey: TranslationKey; }

const MAIN: Link[] = [
  { path: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/analytics', icon: BarChart3, labelKey: 'analytics' },
];
const ORDERS: Link[] = [
  { path: '/alliance', icon: CircleDot, labelKey: 'allianceFormTitle' },
  { path: '/fassung', icon: Gem, labelKey: 'fassungFormTitle' },
  { path: '/pave', icon: Sparkles, labelKey: 'paveFormTitle' },
];
const TEAM: Link[] = [{ path: '/users', icon: Users, labelKey: 'userManagement' }];

const NavItem: React.FC<Link & { onNavigate: () => void; badge?: React.ReactNode }> = ({ path, icon: Icon, labelKey, onNavigate, badge }) => {
  const { t } = useTranslation();
  return (
    <NavLink to={path} end={path === '/'} onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-gold-50 text-copper-700' : 'text-ink-500 hover:bg-cream-100 hover:text-ink-900'}`}>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-copper-500" />}
          <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-copper-600' : 'text-ink-400 group-hover:text-ink-700'}`} />
          <span className="flex-1">{t(labelKey)}</span>
          {badge}
        </>
      )}
    </NavLink>
  );
};

const SidebarContent: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDemoMode, exitDemo, demoAnswers } = useDemo();
  const { all } = useProjects();
  const activeTimers = all.filter(p => p.timerStartedAt).length;

  const timerBadge = activeTimers > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700" title={t('activeTimers', { count: activeTimers })}>
      <Timer className="h-3 w-3" />{activeTimers}
    </span>
  ) : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Brand />
        {isDemoMode && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            <FlaskConical className="h-3 w-3" /> Demo
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {MAIN.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} badge={l.path === '/' ? timerBadge : undefined} />)}
        </div>
        <div>
          <p className="kicker mb-1.5 px-3">{t('newOrder')}</p>
          <div className="space-y-0.5">{ORDERS.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} />)}</div>
        </div>
        <div className="space-y-0.5">{TEAM.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} />)}</div>
      </nav>

      <div className="space-y-3 border-t border-cream-200 p-4">
        <LanguageSelector className="w-full justify-center" />
        {isDemoMode ? (
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">{demoAnswers?.workshopName || t('demoBanner')}</p>
            <p className="mt-0.5 text-amber-700">{t('demoSynthetic')}</p>
            <button onClick={exitDemo} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-amber-800 hover:underline">
              <X className="h-3.5 w-3.5" /> {t('demoExit')}
            </button>
          </div>
        ) : user && (
          <div className="flex items-center gap-3 rounded-xl bg-cream-100 px-3 py-2.5">
            <Avatar name={user.name || user.email || '?'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{user.name || user.email}</p>
              <p className="truncate text-[11px] text-ink-400">{user.provider === 'local' ? t('localBadge') : user.email}</p>
            </div>
            <button onClick={logout} title={t('logout')} aria-label={t('logout')} className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-cream-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand size="sm" />
        <button onClick={() => setOpen(v => !v)} aria-label={t('menu')} aria-expanded={open} className="rounded-lg border border-cream-300 bg-white p-2 text-ink-700">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-cream-200 bg-white lg:block">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-lift">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
