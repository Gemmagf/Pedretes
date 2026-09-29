import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { type AuthUser, getSessionUser, onAuthStateChange, signIn, signOut, signUp } from '../services/auth';
import { isSupabaseConfigured } from '../services/supabase';
import { LOCAL_ACCOUNT, STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  /** Local account (browser-only data). Returns false on wrong credentials. */
  loginLocal: (username: string, password: string) => boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  /** Resolves to 'active' when signed in right away, 'confirm' when email confirmation is pending. */
  registerWithEmail: (email: string, password: string, name: string) => Promise<'active' | 'confirm'>;
  logout: () => Promise<void>;
  cloudAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER: AuthUser = { id: 'local-sara', name: LOCAL_ACCOUNT.displayName, provider: 'local' };

const readLocalSession = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.provider === 'local' ? LOCAL_USER : null;
  } catch { return null; }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readLocalSession);
  const [loading, setLoading] = useState(isSupabaseConfigured && !user);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    getSessionUser().then(u => {
      if (cancelled) return;
      if (u) setUser(u);
      setLoading(false);
    });
    const subscription = onAuthStateChange(u => {
      // Never let a Supabase "signed out" event clobber a local session.
      setUser(prev => (u ? u : prev?.provider === 'local' ? prev : null));
      setLoading(false);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const loginLocal = useCallback((username: string, password: string) => {
    const ok = username.trim().toLowerCase() === LOCAL_ACCOUNT.username.toLowerCase() && password === LOCAL_ACCOUNT.password;
    if (!ok) return false;
    try { localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ provider: 'local', at: Date.now() })); } catch { /* ignore */ }
    setUser(LOCAL_USER);
    return true;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const u = await signIn(email, password);
    if (u) setUser(u);
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const u = await signUp(email, password, name);
    if (u) { setUser(u); return 'active' as const; }
    return 'confirm' as const;
  }, []);

  const logout = useCallback(async () => {
    try { localStorage.removeItem(STORAGE_KEYS.session); } catch { /* ignore */ }
    if (user?.provider === 'supabase') await signOut();
    setUser(null);
  }, [user]);

  const value = useMemo(() => ({
    user, loading, loginLocal, loginWithEmail, registerWithEmail, logout, cloudAvailable: isSupabaseConfigured,
  }), [user, loading, loginLocal, loginWithEmail, registerWithEmail, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
