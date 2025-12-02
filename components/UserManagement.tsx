import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { useTranslation } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { UserPlus, Clock } from 'lucide-react';

const UserManagement = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUserHours } = useUsers();
  const [newName, setNewName] = useState('');

  return (
    <div className="flex justify-center items-start pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-2xl w-full"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
           <div className="bg-amber-100 p-2 rounded-lg">
             <Clock className="w-6 h-6 text-amber-600" />
           </div>
           <h3 className="font-serif font-bold text-2xl text-gray-800">{t('userManagement')}</h3>
        </div>

        <div className="space-y-4 mb-8">
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="flex-1 font-medium text-gray-700">{user.name}</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">{t('extraHours')}:</label>
                <input
                  type="number"
                  min={0}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1 text-center focus:ring-2 focus:ring-amber-400 outline-none"
                  value={user.extraHours}
                  onChange={e => updateUserHours(user.id, Number(e.target.value))}
                />
              </div>
              <span className="text-sm text-gray-400 w-24 text-right">{user.baseHours}h base</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 bg-gray-50 p-4 rounded-xl">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder={t('newUser')}
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium shadow-sm"
            onClick={() => {
              if(newName.trim()) {
                addUser(newName);
                setNewName('');
              }
            }}
          >
            <UserPlus className="w-4 h-4" />
            {t('addUser')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserManagement;