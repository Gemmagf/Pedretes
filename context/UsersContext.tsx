import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from '../types';
import { useData } from './DataContext';

interface UsersContextType {
  users: User[];
  loading: boolean;
  addUser: (name: string) => Promise<void>;
  updateUser: (id: string, patch: Partial<User>) => Promise<void>;
  userById: (id?: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { store } = useData();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => store.listUsers().then(u => { if (active) { setUsers(u); setLoading(false); } });
    setLoading(true);
    load();
    const unsubscribe = store.subscribe(load);
    return () => { active = false; unsubscribe(); };
  }, [store]);

  const addUser = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await store.addUser(trimmed);
  }, [store]);

  const updateUser = useCallback(async (id: string, patch: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
    await store.updateUser(id, patch);
  }, [store]);

  const userById = useCallback((id?: string) => users.find(u => u.id === id), [users]);

  const value = useMemo(() => ({ users, loading, addUser, updateUser, userById }), [users, loading, addUser, updateUser, userById]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used within a UsersProvider');
  return context;
};
