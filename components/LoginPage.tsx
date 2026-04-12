import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn, signUp } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Gem, LogIn, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { } = useAuth(); // trigger re-render when auth state changes
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Die Passwörter stimmen nicht überein.');
        return;
      }
      if (password.length < 6) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }
      if (!name.trim()) {
        setError('Bitte gib deinen Namen ein.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        // AuthContext will detect the new session automatically
      } else {
        const newUser = await signUp(email, password, name.trim());
        if (newUser) {
          // Email confirmation disabled → user is already authenticated
          setSuccess('Konto erstellt! Du bist jetzt angemeldet.');
        } else {
          // Email confirmation enabled → user must confirm first
          setSuccess('Konto erstellt! Bitte bestätige deine E-Mail-Adresse und melde dich dann an.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Invalid login credentials')) {
        setError('E-Mail oder Passwort falsch.');
      } else if (msg.includes('User already registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert.');
      } else {
        setError(msg || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-jewelry-gold to-jewelry-copper shadow-lg mb-4">
            <Gem className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-amber-700 tracking-wider">PEDRETES</h1>
          <p className="text-gray-500 mt-1 text-sm">Atelier Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'text-amber-700 border-b-2 border-amber-600 bg-amber-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Anmelden
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'text-amber-700 border-b-2 border-amber-600 bg-amber-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="z.B. Sarah Müller"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@atelier.ch"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-jewelry-gold to-jewelry-copper text-white rounded-xl font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Bitte warten...
                </span>
              ) : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pedretes Manager · Schmuckatelier Zürich
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
