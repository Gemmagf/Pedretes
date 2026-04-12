import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

const toAuthUser = (user: SupabaseUser): AuthUser => ({
  id: user.id,
  email: user.email ?? '',
  name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '',
});

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
};

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const changePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user ? toAuthUser(data.user) : null;
};

export const getSession = () => supabase.auth.getSession();

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });
  return subscription;
};
