import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Clock, DollarSign, AlertTriangle, Calendar, CheckCircle2, Gem } from 'lucide-react';
import { mockProjects, getOptimalPriceRange, calculateWorkload } from '../mock/projects';
import { useTranslation } from '../context/LanguageContext';
import { UsersProvider } from '../context/UsersContext';
import WeeklyTimeline from './WeeklyTimeline';
import UserManagement from './UserManagement';

const GemIcon = ({ className }) => <Gem className={className} />;

const DashboardContent = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState(mockProjects);
  const [workloadThisWeek, setWorkloadThisWeek] = useState({});
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    setWorkloadThisWeek(calculateWorkload(projects, weekStart));
  }, [projects]);

  const filteredProjects = selectedType === 'all' ? projects : projects.filter(p => p.type === selectedType);
  const pending = filteredProjects.filter(p => p.status === 'pending').length;
  const inProgress = filteredProjects.filter(p => p.status === 'in_progress').length;
  const completed = filteredProjects.filter(p => p.status === 'completed').length;
  const totalRevenue = filteredProjects.reduce((sum, p) => sum + (p.status === 'completed' ? p.totalPrice : 0), 0);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200'
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return t('statusPending');
      case 'in_progress': return t('statusInProgress');
      case 'completed': return t('statusCompleted');
      default: return t('statusUnknown');
    }
  };

  const projectTypes = ['all', 'Alliance', 'Fassung', 'Pavé'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{t('dashboardTitle')}</h2>
            <p className="text-sm text-gray-600">{t('dashboardSubtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600"
            whileHover={{ scale: 1.05 }}
          >
            {t('newProject')}
          </motion.button>
        </div>
      </div>

      {/* Cards resum */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projectes en Marxa */}
        <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50" whileHover={{ y: -2, scale: 1.02 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('projectsInProgress')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{inProgress}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('ofTotal', { total: filteredProjects.length })}</p>
        </motion.div>

        {/* Total ingressos */}
        <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50" whileHover={{ y: -2, scale: 1.02 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('totalCompletedRevenue')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">€{totalRevenue.toLocaleString()}</h3>
        </motion.div>

        {/* Càrrega setmanal */}
        <motion.div className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${workloadThisWeek.overload ? 'border-red-200' : 'border-gray-200/50'}`} whileHover={{ y: -2, scale: 1.02 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('weeklyWorkload')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{workloadThisWeek.totalHours || 0}h / {workloadThisWeek.capacity || 80}h</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${workloadThisWeek.overload ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${workloadThisWeek.percentage || 0}%` }}></div>
          </div>
          {workloadThisWeek.overload && (
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {t('overloadWarning', { percent: workloadThisWeek.percentage || 0 })}
            </motion.div>
          )}
        </motion.div>

        {/* Projectes completats */}
        <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50" whileHover={{ y: -2, scale: 1.02 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('totalCompleted')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{completed}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('pendingProjects', { pending })}</p>
        </motion.div>
      </div>

      {/* Timeline i usuaris */}
      <WeeklyTimeline projects={projects} />
      <UserManagement />

      {/* Aquí pots afegir la secció de preus i optimització com abans */}
    </motion.div>
  );
};

const Dashboard = () => (
  <UsersProvider>
    <DashboardContent />
  </UsersProvider>
);

export default Dashboard;
