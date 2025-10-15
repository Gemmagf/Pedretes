import React, { createContext, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([
    { id: uuidv4(), name: 'Sareta', baseHours: 40, extraHours: 0, assignedHours: 0 },
    { id: uuidv4(), name: 'Valentin', baseHours: 40, extraHours: 0, assignedHours: 0 },
  ]);

  const addUser = (name) => {
    if (!name.trim()) return;
    const newUser = {
      id: uuidv4(),
      name,
      baseHours: 40,
      extraHours: 0,
      assignedHours: 0,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserHours = (id, extraHours) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, extraHours } : user)
    );
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUserHours }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
