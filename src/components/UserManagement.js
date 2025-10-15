import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';

const UserManagement = () => {
  const { users, addUser, updateUserHours } = useUsers();
  const [newName, setNewName] = useState('');

  return (
    <div className="bg-white/80 p-4 rounded-xl shadow border border-gray-200">
      <h3 className="font-semibold text-lg mb-2">Gestió d'Usuaris</h3>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-2">
            <span className="flex-1">{user.name}</span>
            <input
              type="number"
              min={0}
              className="w-20 border rounded px-2 py-1"
              value={user.extraHours}
              onChange={e => updateUserHours(user.id, Number(e.target.value))}
              placeholder="Hores extra"
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="Nou usuari"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-amber-500 text-white rounded"
          onClick={() => {
            addUser(newName);
            setNewName('');
          }}
        >
          Afegir
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
