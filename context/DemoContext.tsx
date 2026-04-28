import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, User } from '../types';
import { DemoAnswers, generateDemoProjects, generateDemoUsers } from '../utils/demoData';

interface DemoContextType {
  isDemoMode: boolean;
  demoAnswers: DemoAnswers | null;
  demoProjects: Project[];
  demoUsers: User[];
  enterDemo: (answers: DemoAnswers) => void;
  exitDemo: () => void;
  updateDemoProject: (project: Project) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoAnswers, setDemoAnswers] = useState<DemoAnswers | null>(null);
  const [demoProjects, setDemoProjects] = useState<Project[]>([]);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  const enterDemo = (answers: DemoAnswers) => {
    setDemoAnswers(answers);
    setDemoProjects(generateDemoProjects(answers));
    setDemoUsers(generateDemoUsers(answers));
    setIsDemoMode(true);
  };

  const exitDemo = () => {
    setIsDemoMode(false);
    setDemoAnswers(null);
    setDemoProjects([]);
    setDemoUsers([]);
  };

  const updateDemoProject = (project: Project) => {
    setDemoProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, demoAnswers, demoProjects, demoUsers, enterDemo, exitDemo, updateDemoProject }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
