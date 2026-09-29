import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { HOURLY_RATE, STORAGE_KEYS } from '../utils/constants';

export interface Settings {
  /** Target hourly rate used for cost tracking, warnings and pricing advice (CHF/h). */
  targetRate: number;
  workshopName: string;
}

interface SettingsContextType extends Settings {
  update: (patch: Partial<Settings>) => void;
}

const DEFAULTS: Settings = { targetRate: HOURLY_RATE, workshopName: 'Pedretes Atelier' };
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const read = (): Settings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(read);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); } catch { /* ignore */ } }, [settings]);
  const update = useCallback((patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch })), []);
  const value = useMemo(() => ({ ...settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
