import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserPlus, ChevronDown, ChevronUp, X, KeyRound, Eye, EyeOff, ShieldCheck, Database, Download, Upload, RotateCcw, Users, Store } from 'lucide-react';
import type { User } from '../types';
import { useUsers } from '../context/UsersContext';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { changePassword } from '../services/auth';
import type { DataSnapshot } from '../services/store';
import { hoursPerDay } from '../utils/scheduling';
import { fmtDate, fmtNumber } from '../utils/format';
import { Avatar, Button, Card, Field } from './ui';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 0];

// --- Password (Supabase accounts only) ---------------------------------------

const ChangePasswordCard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pw.length < 6) return setError(t('passwordMin'));
    if (pw !== pw2) return setError(t('passwordMismatch'));
    setLoading(true);
    try { await changePassword(pw); toast(t('passwordSaved')); setPw(''); setPw2(''); setOpen(false); }
    catch (err: any) { setError(err?.message ?? t('errorGeneric')); }
    finally { setLoading(false); }
  };

  return (
    <Card bodyClassName="">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-4 p-5 text-left hover:bg-cream-50" aria-expanded={open}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700"><KeyRound className="h-5 w-5" /></span>
        <span className="flex-1"><span className="block font-semibold text-ink-900">{t('changePassword')}</span><span className="block text-xs text-ink-400">{user?.email}</span></span>
        {open ? <ChevronUp className="h-4 w-4 text-ink-400" /> : <ChevronDown className="h-4 w-4 text-ink-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={submit} className="space-y-4 border-t border-cream-200 p-5">
              <Field label={t('newPassword')}>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder={t('passwordPlaceholder')} className="input pr-10" required />
                  <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </Field>
              <Field label={t('confirmPassword')}>
                <input type={show ? 'text' : 'password'} value={pw2} onChange={e => setPw2(e.target.value)} placeholder={t('repeatPassword')} className="input" required />
              </Field>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
              <Button type="submit" loading={loading} icon={<ShieldCheck className="h-4 w-4" />}>{t('savePassword')}</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// --- Atelier settings ---------------------------------------------------------

const AtelierCard: React.FC = () => {
  const { t } = useTranslation();
  const { targetRate, workshopName, update } = useSettings();
  return (
    <Card title={t('atelierSettings')} icon={<Store className="h-5 w-5" />}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('workshopName')} hint={t('workshopNameHint')}>
          <input className="input" value={workshopName} onChange={e => update({ workshopName: e.target.value })} />
        </Field>
        <Field label={t('targetRate')} hint={t('targetRateHint')}>
          <div className="relative">
            <input type="number" min={1} step={5} className="input pr-16" value={targetRate} onChange={e => update({ targetRate: Math.max(1, Number(e.target.value) || 0) })} />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400">CHF/h</span>
          </div>
        </Field>
      </div>
    </Card>
  );
};

// --- Local data backup --------------------------------------------------------

const DataCard: React.FC = () => {
  const { t } = useTranslation();
  const { store } = useData();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const snapshot = store.exportSnapshot!();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedretes-backup-${new Date().toISOString().substring(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const snapshot = JSON.parse(await file.text()) as DataSnapshot;
      store.importSnapshot!(snapshot);
      toast(t('importSuccess', { projects: snapshot.projects.length, users: snapshot.users.length }));
    } catch { toast(t('importError'), 'error'); }
  };

  const reset = () => { if (window.confirm(t('resetConfirm'))) { store.reset!(); toast(t('projectUpdated'), 'info'); } };

  return (
    <Card title={t('dataTitle')} icon={<Database className="h-5 w-5" />}>
      <p className="mb-4 text-sm text-ink-500">{t('dataLocalHint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={exportJson} icon={<Download className="h-4 w-4" />}>{t('exportData')}</Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} icon={<Upload className="h-4 w-4" />}>{t('importData')}</Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
        <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="h-4 w-4" />} className="text-ink-500">{t('resetData')}</Button>
      </div>
    </Card>
  );
};

// --- Team ---------------------------------------------------------------------

const UserRow: React.FC<{ user: User; expanded: boolean; onToggle: () => void; onUpdate: (patch: Partial<User>) => void }> = ({ user, expanded, onToggle, onUpdate }) => {
  const { t, locale } = useTranslation();
  const [newDayOff, setNewDayOff] = useState('');

  const toggleDay = (n: number) => {
    const next = user.workingDays.includes(n) ? user.workingDays.filter(d => d !== n) : [...user.workingDays, n].sort();
    onUpdate({ workingDays: next });
  };
  const addDayOff = () => {
    if (!newDayOff || user.daysOff.includes(newDayOff)) return;
    onUpdate({ daysOff: [...user.daysOff, newDayOff].sort() });
    setNewDayOff('');
  };

  return (
    <li>
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left hover:bg-cream-50" aria-expanded={expanded}>
        <Avatar name={user.name} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink-900">{user.name}</span>
          <span className="block truncate text-xs text-ink-400">
            {user.workingDays.map(d => t(DAY_KEYS[DAY_NUMS.indexOf(d)])).join(' · ')}
            {' · '}{t('capacityPerDay', { hours: fmtNumber(hoursPerDay(user), locale, 1) })}
            {user.daysOff.length > 0 && ` · ${user.daysOff.length} ${t('freeDaysLabel')}`}
          </span>
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-ink-400" /> : <ChevronDown className="h-4 w-4 text-ink-400" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-5 border-t border-cream-200 bg-cream-50/60 p-4">
              <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
                <Field label={t('hoursPerWeek')}>
                  <input type="number" min={0} max={80} className="input" value={user.baseHours} onChange={e => onUpdate({ baseHours: Number(e.target.value) || 0 })} />
                </Field>
                <Field label={t('extraHours')}>
                  <input type="number" min={0} max={40} className="input" value={user.extraHours} onChange={e => onUpdate({ extraHours: Number(e.target.value) || 0 })} />
                </Field>
              </div>

              <div>
                <p className="label">{t('workingDays')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_KEYS.map((key, i) => {
                    const active = user.workingDays.includes(DAY_NUMS[i]);
                    return (
                      <button key={key} onClick={() => toggleDay(DAY_NUMS[i])} aria-pressed={active}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${active ? 'bg-copper-600 text-white shadow-sm' : 'border border-cream-300 bg-white text-ink-400 hover:border-gold-400'}`}>
                        {t(key)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="label">{t('daysOff')}</p>
                <div className="mb-2 flex gap-2">
                  <input type="date" value={newDayOff} onChange={e => setNewDayOff(e.target.value)} className="input max-w-[200px]" />
                  <Button size="sm" onClick={addDayOff} disabled={!newDayOff}>{t('addDayOff')}</Button>
                </div>
                {user.daysOff.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {user.daysOff.map(day => (
                      <span key={day} className="inline-flex items-center gap-1.5 rounded-full border border-rosegold-400/50 bg-white px-2.5 py-1 text-xs text-rosegold-500">
                        {fmtDate(day, locale, { day: '2-digit', month: 'short', year: '2-digit' })}
                        <button onClick={() => onUpdate({ daysOff: user.daysOff.filter(d => d !== day) })} className="hover:text-red-700" aria-label={t('delete')}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUser } = useUsers();
  const { user: authUser } = useAuth();
  const { store } = useData();
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const submitNew = () => { if (newName.trim()) { addUser(newName); setNewName(''); } };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      <Card title={t('userManagement')} icon={<Users className="h-5 w-5" />} bodyClassName=""
        action={<span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">{users.length}</span>}>
        <ul className="divide-y divide-cream-200">
          {users.map(u => (
            <UserRow key={u.id} user={u} expanded={expandedId === u.id} onToggle={() => setExpandedId(prev => (prev === u.id ? null : u.id))} onUpdate={patch => updateUser(u.id, patch)} />
          ))}
        </ul>
        <div className="flex gap-2 border-t border-cream-200 bg-cream-50 p-4">
          <input className="input" placeholder={t('newUser')} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitNew(); }} />
          <Button onClick={submitNew} icon={<UserPlus className="h-4 w-4" />} disabled={!newName.trim()} className="shrink-0">{t('addUser')}</Button>
        </div>
      </Card>

      <AtelierCard />
      {store.kind === 'local' && <DataCard />}
      {authUser?.provider === 'supabase' && <ChangePasswordCard />}
    </div>
  );
};

export default UserManagement;
