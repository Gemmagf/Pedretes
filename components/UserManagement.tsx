import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { useTranslation } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ChevronDown, ChevronUp, X } from 'lucide-react';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 0]; // 0=Dg, 1=Dl...

const UserManagement = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUserHours, updateUserAvailability } = useUsers();
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDayOff, setNewDayOff] = useState('');

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const toggleWorkingDay = (userId: string, dayNum: number, currentDays: number[], daysOff: string[]) => {
    const next = currentDays.includes(dayNum)
      ? currentDays.filter(d => d !== dayNum)
      : [...currentDays, dayNum].sort();
    updateUserAvailability(userId, next, daysOff);
  };

  const addDayOff = (userId: string, workingDays: number[], daysOff: string[]) => {
    if (!newDayOff || daysOff.includes(newDayOff)) return;
    updateUserAvailability(userId, workingDays, [...daysOff, newDayOff].sort());
    setNewDayOff('');
  };

  const removeDayOff = (userId: string, workingDays: number[], daysOff: string[], day: string) => {
    updateUserAvailability(userId, workingDays, daysOff.filter(d => d !== day));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-amber-50/30">
          <h3 className="font-serif font-bold text-xl text-jewelry-copper">{t('userManagement')}</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {users.map(user => (
            <div key={user.id}>
              {/* User Row */}
              <div
                className="flex items-center gap-4 p-4 hover:bg-amber-50/30 transition-colors cursor-pointer"
                onClick={() => toggleExpand(user.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-jewelry-copper to-jewelry-bronze flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">
                    {user.workingDays.map(d => t(DAY_KEYS[DAY_NUMS.indexOf(d)])).join(' · ')}
                    {user.daysOff.length > 0 && ` · ${user.daysOff.length} dies lliures`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('extraHours')}</p>
                    <input
                      type="number"
                      min={0}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-jewelry-gold outline-none"
                      value={user.extraHours}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateUserHours(user.id, Number(e.target.value))}
                    />
                  </div>
                  {expandedId === user.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>
              </div>

              {/* Expanded Availability */}
              <AnimatePresence>
                {expandedId === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-amber-50/20 border-t border-amber-100 space-y-4">
                      {/* Working Days */}
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-2">{t('workingDays')}</p>
                        <div className="flex gap-2 flex-wrap">
                          {DAY_KEYS.map((key, i) => {
                            const num = DAY_NUMS[i];
                            const active = user.workingDays.includes(num);
                            return (
                              <button
                                key={key}
                                onClick={() => toggleWorkingDay(user.id, num, user.workingDays, user.daysOff)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  active
                                    ? 'bg-jewelry-copper text-white shadow-sm'
                                    : 'bg-white text-gray-400 border border-gray-200 hover:border-jewelry-gold'
                                }`}
                              >
                                {t(key)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Days Off */}
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-2">{t('daysOff')}</p>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="date"
                            value={newDayOff}
                            onChange={e => setNewDayOff(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-jewelry-gold outline-none bg-white"
                          />
                          <button
                            onClick={() => addDayOff(user.id, user.workingDays, user.daysOff)}
                            className="px-4 py-1.5 bg-jewelry-copper text-white rounded-lg text-sm font-medium hover:bg-jewelry-bronze transition"
                          >
                            {t('addDayOff')}
                          </button>
                        </div>
                        {user.daysOff.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {user.daysOff.map(day => (
                              <span
                                key={day}
                                className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 text-xs px-2.5 py-1 rounded-full"
                              >
                                {new Date(day + 'T12:00:00').toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' })}
                                <button
                                  onClick={() => removeDayOff(user.id, user.workingDays, user.daysOff, day)}
                                  className="hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Add User */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-jewelry-gold outline-none bg-white"
            placeholder={t('newUser')}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { addUser(newName); setNewName(''); } }}
          />
          <button
            className="flex items-center gap-2 px-5 py-2 bg-jewelry-copper text-white rounded-lg hover:bg-jewelry-bronze transition text-sm font-medium shadow-sm"
            onClick={() => { if (newName.trim()) { addUser(newName); setNewName(''); } }}
          >
            <UserPlus className="w-4 h-4" />
            {t('addUser')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
