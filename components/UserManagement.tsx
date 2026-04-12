import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ChevronDown, ChevronUp, X, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_NUMS = [1, 2, 3, 4, 5, 6, 0]; // 0=Sun, 1=Mon...

const ChangePasswordCard: React.FC = () => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess('Passwort erfolgreich geändert.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message ?? 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20 overflow-hidden">
      <button
        onClick={() => setCurrentSection(v => !v)}
        className="w-full flex items-center gap-4 p-5 border-b border-gray-100 bg-amber-50/30 hover:bg-amber-50/60 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-800">Passwort ändern</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        {currentSection
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {currentSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleChange} className="p-5 space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition text-sm"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                {loading ? 'Speichern...' : 'Passwort speichern'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
      {/* Change Password */}
      <ChangePasswordCard />

      {/* Team Management */}
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
                    {user.daysOff.length > 0 && ` · ${user.daysOff.length} freie Tage`}
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
                                {new Date(day + 'T12:00:00').toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })}
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
