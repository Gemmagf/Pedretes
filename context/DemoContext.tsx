import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { type DemoAnswers, generateDemoProjects, generateDemoUsers } from '../utils/demoData';
import { createMemoryStore, type Store } from '../services/store';

interface DemoContextType {
  isDemoMode: boolean;
  demoAnswers: DemoAnswers | null;
  demoStore: Store | null;
  enterDemo: (answers: DemoAnswers) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [demoAnswers, setDemoAnswers] = useState<DemoAnswers | null>(null);
  const [demoStore, setDemoStore] = useState<Store | null>(null);

  const enterDemo = useCallback((answers: DemoAnswers) => {
    const store = createMemoryStore({
      kind: 'demo',
      seed: () => {
        const users = generateDemoUsers(answers);
        return { users, projects: generateDemoProjects(answers, users) };
      },
    });
    setDemoAnswers(answers);
    setDemoStore(store);
  }, []);

  const exitDemo = useCallback(() => {
    setDemoAnswers(null);
    setDemoStore(null);
  }, []);

  const value = useMemo(() => ({
    isDemoMode: demoStore !== null, demoAnswers, demoStore, enterDemo, exitDemo,
  }), [demoStore, demoAnswers, enterDemo, exitDemo]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
