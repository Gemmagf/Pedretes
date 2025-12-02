import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UsersContextType {
  users: User[];
  addUser: (name: string) => void;
  updateUserHours: (id: string, hours: number) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Jordi', baseHours: 40, extraHours: 0 },
    { id: '2', name: 'Maria', baseHours: 35, extraHours: 2 },
    { id: '3', name: 'Hans', baseHours: 42, extraHours: 5 },
  ]);

  const addUser = (name: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      baseHours: 40,
      extraHours: 0
    };
    setUsers([...users, newUser]);
  };

  const updateUserHours = (id: string, hours: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, extraHours: hours } : u));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUserHours }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used within a UsersProvider');
  return context;
};