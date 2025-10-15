import React, { createContext, useState, useContext } from 'react';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Gemma', baseHours: 40, extraHours: 0 },
    { id: 2, name: 'Companya', baseHours: 40, extraHours: 0 },
  ]);

  const addUser = (name, baseHours = 40) => {
    setUsers([...users, { id: Date.now(), name, baseHours, extraHours: 0 }]);
  };

  const updateUserHours = (id, hours) => {
    setUsers(users.map(u => (u.id === id ? { ...u, extraHours: hours } : u)));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUserHours }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
