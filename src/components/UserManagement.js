import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { useTranslation } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const UserManagement = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUserHours } = useUsers();
  const [newName, setNewName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 p-4 rounded-2xl shadow border border-gray-200 max-w-2xl mx-auto"
    >
      <h3 className="font-semibold text-lg mb-4">{t('userManagement')}</h3>
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
              placeholder={t('extraHours')}
            />
            <span>{user.baseHours}h base</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder={t('newUser')}
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
          onClick={() => {
            addUser(newName);
            setNewName('');
          }}
        >
          {t('addUser')}
        </button>
      </div>
    </motion.div>
  );
};

export default UserManagement;
