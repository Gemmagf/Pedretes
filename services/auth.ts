import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  provider: 'supabase' | 'local';
}

const notConfigured = () => new Error('SUPABASE_NOT_CONFIGURED');

const toAuthUser = (user: SupabaseUser): AuthUser => ({
  id: user.id,
  email: user.email ?? '',
  name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '',
  provider: 'supabase',
});

export const signIn = async (email: string, password: string) => {
  if (!supabase) throw notConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
};

/** Returns the user when the session is active right away, or null when email confirmation is pending. */
export const signUp = async (email: string, password: string, name: string) => {
  if (!supabase) throw notConfigured();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  return data.session && data.user ? toAuthUser(data.user) : null;
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const changePassword = async (newPassword: string) => {
  if (!supabase) throw notConfigured();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const getSessionUser = async (): Promise<AuthUser | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ? toAuthUser(data.session.user) : null;
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!supabase) return { unsubscribe: () => {} };
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });
  return subscription;
};
