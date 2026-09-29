import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, LogIn, UserPlus, HardDrive, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Brand } from './Brand';
import { LanguageSelector } from './LanguageSelector';
import { Button, Field } from './ui';

type Mode = 'login' | 'register';

const LoginPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const { loginLocal, loginWithEmail, registerWithEmail, cloudAvailable } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'login') {
      // 1) Local workshop account (works without any backend, data stays in the browser).
      if (loginLocal(identifier, password)) return;
      // 2) Team account via Supabase, when configured.
      if (!cloudAvailable || !identifier.includes('@')) { setError(t('loginError')); return; }
      setLoading(true);
      try { await loginWithEmail(identifier.trim(), password); }
      catch (err: any) { setError(String(err?.message ?? '').includes('Invalid login') ? t('loginError') : err?.message || t('errorGeneric')); }
      finally { setLoading(false); }
      return;
    }

    if (password !== confirm) return setError(t('passwordMismatch'));
    if (password.length < 6) return setError(t('passwordMin'));
    if (!name.trim()) return setError(t('nameRequired'));
    setLoading(true);
    try {
      const result = await registerWithEmail(identifier.trim(), password, name.trim());
      if (result === 'confirm') { setSuccess(t('accountCreatedConfirm')); setMode('login'); setPassword(''); setConfirm(''); }
      else setSuccess(t('accountCreated'));
    } catch (err: any) {
      setError(String(err?.message ?? '').includes('already registered') ? t('alreadyRegistered') : err?.message || t('errorGeneric'));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />{t('backToLanding')}</button>
        <LanguageSelector />
      </div>

      <div className="flex flex-1 items-center justify-center p-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Brand size="lg" className="justify-center" />
            <p className="mt-2 text-sm text-ink-500">{t('authTagline')}</p>
          </div>

          <div className="card overflow-hidden">
            {cloudAvailable && (
              <div className="flex border-b border-cream-200">
                {(['login', 'register'] as Mode[]).map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${mode === m ? 'border-b-2 border-copper-600 bg-gold-50/50 text-copper-700' : 'text-ink-400 hover:text-ink-700'}`}>
                    {m === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{t(m)}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {mode === 'register' && (
                <Field label={t('name')}>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={t('namePlaceholder')} required />
                </Field>
              )}
              <Field label={mode === 'login' ? t('usernameOrEmail') : t('email')}>
                <input className="input" type={mode === 'login' ? 'text' : 'email'} value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" autoFocus required />
              </Field>
              <Field label={t('password')}>
                <div className="relative">
                  <input className="input pr-10" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                  <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={t('password')}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {mode === 'register' && (
                <Field label={t('confirmPassword')}>
                  <input className="input" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('repeatPassword')} autoComplete="new-password" required />
                </Field>
              )}

              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

              <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading}>
                {loading ? t('pleaseWait') : mode === 'login' ? t('login') : t('createAccount')}
              </Button>
            </form>

            <div className="space-y-1 border-t border-cream-200 bg-cream-50 px-6 py-3 text-[11px] text-ink-400">
              <p className="inline-flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" />{t('localLoginHint')}</p>
              {cloudAvailable && <p className="inline-flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" />{t('cloudLoginHint')}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
