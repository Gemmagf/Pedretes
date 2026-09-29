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
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
          isActive ? 'bg-white/[0.07] text-gold-300' : 'text-cream-300/70 hover:bg-white/[0.05] hover:text-cream-100'}`}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-active" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-400" />}
          <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? 'text-gold-400' : 'text-cream-300/50 group-hover:text-cream-100'}`} />
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
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300" title={t('activeTimers', { count: activeTimers })}>
      <Timer className="h-3 w-3" />{activeTimers}
    </span>
  ) : undefined;

  return (
    <div className="flex h-full flex-col bg-ink-900 text-cream-100">
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <Brand light />
        {isDemoMode && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-300">
            <FlaskConical className="h-3 w-3" /> Demo
          </span>
        )}
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-gold-400/40 via-white/10 to-transparent" />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-0.5">
          {MAIN.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} badge={l.path === '/' ? timerBadge : undefined} />)}
        </div>
        <div>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-300/40">{t('newOrder')}</p>
          <div className="space-y-0.5">{ORDERS.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} />)}</div>
        </div>
        <div className="space-y-0.5">{TEAM.map(l => <NavItem key={l.path} {...l} onNavigate={onNavigate} />)}</div>
      </nav>

      <div className="space-y-3 border-t border-white/[0.07] p-4">
        <LanguageSelector dark className="w-full justify-center" />
        {isDemoMode ? (
          <div className="rounded-xl border border-gold-400/20 bg-gold-400/10 p-3 text-xs text-cream-100">
            <p className="font-semibold text-gold-200">{demoAnswers?.workshopName || t('demoBanner')}</p>
            <p className="mt-0.5 text-cream-300/70">{t('demoSynthetic')}</p>
            <button onClick={exitDemo} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-gold-300 hover:text-gold-200">
              <X className="h-3.5 w-3.5" /> {t('demoExit')}
            </button>
          </div>
        ) : user && (
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-copper-500 text-xs font-bold text-ink-900">
              {(user.name || user.email || '?').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cream-100">{user.name || user.email}</p>
              <p className="truncate text-[11px] text-cream-300/50">{user.provider === 'local' ? t('localBadge') : user.email}</p>
            </div>
            <button onClick={logout} title={t('logout')} aria-label={t('logout')} className="rounded-lg p-1.5 text-cream-300/50 transition-colors hover:bg-white/10 hover:text-red-300">
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
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-ink-900 px-4 text-cream-100 shadow-md lg:hidden">
        <Brand size="sm" light />
        <button onClick={() => setOpen(v => !v)} aria-label={t('menu')} aria-expanded={open} className="rounded-lg bg-white/10 p-2 text-cream-100 hover:bg-white/15">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-lift">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
