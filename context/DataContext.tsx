import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { createMemoryStore, type Store } from '../services/store';
import { supabaseStore } from '../services/supabase';
import { seedLocalData } from '../utils/localSeed';
import { STORAGE_KEYS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { useDemo } from './DemoContext';
import { useSettings } from './SettingsContext';

interface DataContextType {
  store: Store;
  /** Name shown in banners and on PDF quotes. */
  workshopName: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let localStoreSingleton: Store | null = null;
const getLocalStore = () => {
  if (!localStoreSingleton) {
    localStoreSingleton = createMemoryStore({ kind: 'local', seed: seedLocalData, persistKey: STORAGE_KEYS.localData });
  }
  return localStoreSingleton;
};

/** Picks the active backend: demo (memory) → local account (browser) → Supabase. */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { demoStore, demoAnswers } = useDemo();
  const { workshopName } = useSettings();

  const value = useMemo<DataContextType>(() => {
    if (demoStore) return { store: demoStore, workshopName: demoAnswers?.workshopName || 'Mein Atelier' };
    if (user?.provider === 'local') return { store: getLocalStore(), workshopName };
    return { store: supabaseStore, workshopName };
  }, [demoStore, demoAnswers, user, workshopName]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
