import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  getUsers,
  addUser as addUserDB,
  updateUserHours as updateUserHoursDB,
  updateUserAvailability as updateUserAvailabilityDB,
} from '../services/supabase';

interface UsersContextType {
  users: User[];
  addUser: (name: string) => void;
  updateUserHours: (id: string, hours: number) => void;
  updateUserAvailability: (id: string, workingDays: number[], daysOff: string[]) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const addUser = async (name: string) => {
    const newUser = await addUserDB(name);
    if (newUser) setUsers(prev => [...prev, newUser]);
  };

  const updateUserHours = async (id: string, hours: number) => {
    await updateUserHoursDB(id, hours);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, extraHours: hours } : u));
  };

  const updateUserAvailability = async (id: string, workingDays: number[], daysOff: string[]) => {
    await updateUserAvailabilityDB(id, workingDays, daysOff);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, workingDays, daysOff } : u));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUserHours, updateUserAvailability }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used within a UsersProvider');
  return context;
};
