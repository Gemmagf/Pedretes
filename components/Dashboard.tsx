
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { getSheetData, updateRow } from '../services/sheetsAPI';
import { Project } from '../types';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, AlertCircle, X, 
  ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, DollarSign, TrendingUp, Filter, Clock
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

// --- Edit Modal Component ---
const ProjectDetailModal = ({ project, onClose, onUpdate }: { project: Project, onClose: () => void, onUpdate: (p: Project) => void }) => {
  const { t } = useTranslation();
  const [edited, setEdited] = useState({ ...project });

  const handleSave = async () => {
    await updateRow(edited);
    onUpdate(edited);
    onClose();
  };

  const daysToDeadline = edited.deadline 
    ? Math.ceil((new Date(edited.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) 
    : 0;
  
  const hourlyRate = 120;
  const impliedCost = (edited.actualTime || 0) / 60 * hourlyRate;
  const showPriceAlert = (edited.agreedPrice && impliedCost > edited.agreedPrice) || ((edited.actualTime || 0) > (edited.totalTime || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jewelry-copper/20 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-jewelry-gold">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
             <h2 className="text-2xl font-serif font-bold text-gray-800">{edited.projectName}</h2>
             <span className="text-sm font-medium text-jewelry-copper tracking-wide">{edited.client} • {edited.sheetType}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-full transition text-gray-400 hover:text-jewelry-copper"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Bar */}
          <div className="flex gap-2 bg-amber-50 p-1.5 rounded-xl">
             {['Pending', 'In Progress', 'Completed'].map(s => (
               <button 
                key={s}
                onClick={() => setEdited({ ...edited, status: s as any })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${edited.status === s ? 'bg-white shadow-sm text-jewelry-copper ring-1 ring-jewelry-gold/30' : 'text-gray-500 hover:text-jewelry-bronze'}`}
               >
                 {t(s.toLowerCase().replace(' ', '_'))}
               </button>
             ))}
          </div>

          {/* Time & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-5 rounded-2xl border border-jewelry-rosegold/30 shadow-sm">
                <label className="text-xs font-bold uppercase text-jewelry-rosegold tracking-wider mb-2 block">{t('deadline')}</label>
                <input 
                  type="date" 
                  value={edited.deadline || ''} 
                  onChange={e => setEdited({ ...edited, deadline: e.target.value })} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2 focus:ring-2 focus:ring-jewelry-rosegold outline-none transition"
                />
                <div className={`text-sm font-medium flex items-center gap-1 ${daysToDeadline < 3 ? 'text-red-500' : 'text-gray-500'}`}>
                   <CalendarIcon className="w-4 h-4" />
                   {daysToDeadline > 0 ? `${daysToDeadline} days left` : 'Overdue/Today'}
                </div>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-jewelry-copper/30 shadow-sm">
                <label className="text-xs font-bold uppercase text-jewelry-copper tracking-wider mb-2 block">{t('actualTime')} (min)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={edited.actualTime || 0} 
                    onChange={e => setEdited({ ...edited, actualTime: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-jewelry-copper outline-none transition"
                  />
                  <span className="text-sm text-gray-400 whitespace-nowrap">/ {edited.totalTime} est</span>
                </div>
                <div className="w-full bg-gray-100 h-2 mt-4 rounded-full overflow-hidden">
                   <div className="bg-jewelry-copper h-full transition-all" style={{ width: `${Math.min(((edited.actualTime || 0) / (edited.totalTime || 1)) * 100, 100)}%` }} />
                </div>
             </div>
          </div>

          {/* Pricing */}
          <div className="border border-jewelry-gold/30 p-5 rounded-2xl bg-amber-50/20">
             <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700">{t('agreedPrice')}</label>
                {showPriceAlert && (
                  <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    {t('priceAlert')}
                  </div>
                )}
             </div>
             <div className="relative">
                <span className="absolute left-3 top-3 text-jewelry-copper font-serif font-bold">CHF</span>
                <input 
                  type="number" 
                  value={edited.agreedPrice || ''} 
                  onChange={e => setEdited({ ...edited, agreedPrice: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 pl-14 font-serif text-xl font-bold text-gray-800 focus:ring-2 focus:ring-jewelry-gold outline-none"
                />
             </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition font-medium">{t('close')}</button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-jewelry-copper to-jewelry-bronze text-white font-medium rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5">{t('saveChanges')}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Calendar View Component ---
const CalendarView = ({ 
  projects, 
  currentDate, 
  onNavigate, 
  onSelectProject,
  users
}: { 
  projects: Project[], 
  currentDate: Date, 
  onNavigate: (d: Date) => void,
  onSelectProject: (p: Project) => void,
  users: any[]
}) => {
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Mon, 6=Sun)
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startOffset = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const isWithinRange = (dateCheck: Date, start: Date, end?: Date) => {
    const e = end ? new Date(end) : new Date(start);
    const check = new Date(dateCheck.setHours(0,0,0,0));
    const s = new Date(start.setHours(0,0,0,0));
    const finalEnd = new Date(e.setHours(0,0,0,0));
    return check >= s && check <= finalEnd;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20 overflow-hidden flex flex-col h-[600px]">
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between border-b border-amber-100 bg-amber-50/30">
        <h3 className="font-serif font-bold text-xl text-jewelry-copper capitalize">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-jewelry-gold/30 transition text-jewelry-bronze"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
             onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
             className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-jewelry-gold/30 transition text-jewelry-bronze"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center border-b border-amber-50 bg-white">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-3 text-xs font-bold text-jewelry-brass uppercase tracking-widest">{day}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-50/20">
        {calendarDays.map((day, idx) => {
          const currentDayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
          
          const dayProjects = currentDayDate ? projects.filter(p => {
             const start = new Date(p.date);
             const end = p.deadline ? new Date(p.deadline) : new Date(start.getTime() + 86400000); 
             return isWithinRange(currentDayDate, start, end);
          }) : [];

          return (
            <div 
              key={idx} 
              className={`border-b border-r border-gray-100 p-1 min-h-[80px] relative transition-colors ${day ? 'bg-white hover:bg-amber-50/30' : 'bg-gray-50/40'}`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isSameDay(new Date(), currentDayDate!) ? 'bg-jewelry-gold text-white shadow-md' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayProjects.slice(0, 4).map(p => {
                      const isStart = isSameDay(new Date(p.date), currentDayDate!);
                      const assignedUser = users.find(u => u.id === p.assignedTo);
                      
                      return (
                        <div 
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); onSelectProject(p); }}
                          className={`text-[10px] px-2 py-1 rounded cursor-pointer truncate shadow-sm hover:brightness-110 transition flex items-center gap-1`}
                          style={{ 
                            backgroundColor: p.color || '#cd7f32', 
                            color: '#fff',
                            marginLeft: isStart ? '0' : '-4px', 
                            borderRadius: '4px',
                            borderLeft: isStart ? '2px solid rgba(255,255,255,0.5)' : 'none'
                          }}
                          title={`${p.projectName} (${assignedUser?.name || 'Unassigned'})`}
                        >
                          {assignedUser && <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block flex-shrink-0" />}
                          {isStart ? <span className="font-semibold truncate">{p.projectName}</span> : <span className="opacity-0">.</span>}
                        </div>
                      );
                    })}
                    {dayProjects.length > 4 && (
                      <div className="text-[9px] text-jewelry-bronze font-medium pl-1">+{dayProjects.length - 4} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


const Dashboard = () => {
  const { t } = useTranslation();
  const { users } = useUsers();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const refreshData = async () => {
    setLoading(true);
    const data = await getSheetData('All');
    // Color logic using gold hues
    const processed = data.map(p => {
      const hash = [...(p.projectName || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0);
      // Generate varying warm colors: Hue between 20 (orange) and 45 (gold), Saturation 70-90%, Lightness 45-60%
      const hue = 25 + (hash % 25); 
      const sat = 70 + (hash % 20);
      const light = 45 + (hash % 15);
      return { ...p, color: `hsl(${hue}, ${sat}%, ${light}%)` };
    });
    setProjects(processed);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  // Filter Logic
  useEffect(() => {
    const now = new Date();
    // Normalize today for comparison
    const todayStart = new Date(now.setHours(0,0,0,0));
    
    // Calculate week start (Monday) and end (Sunday)
    const currentDay = todayStart.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(todayStart);
    monday.setDate(todayStart.getDate() - distanceToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const filtered = projects.filter(p => {
      // User Filter
      if (userFilter !== 'all' && p.assignedTo !== userFilter) return false;

      const pDate = new Date(p.date);
      const pDateNormalized = new Date(pDate.setHours(0,0,0,0));
      
      // Time Period Filter
      if (filter === 'all') return true;
      
      if (filter === 'year') {
        return pDateNormalized.getFullYear() === todayStart.getFullYear();
      }
      
      if (filter === 'month') {
        return pDateNormalized.getMonth() === todayStart.getMonth() && 
               pDateNormalized.getFullYear() === todayStart.getFullYear();
      }
      
      if (filter === 'week') {
        return pDateNormalized >= monday && pDateNormalized <= sunday;
      }
      return true;
    });
    
    setFilteredProjects(filtered);

    // Auto-navigate calendar to today when filter changes to ensure visibility
    if (filter === 'week' || filter === 'month' || filter === 'year') {
      setCalendarDate(new Date());
    }

  }, [filter, userFilter, projects]);

  // KPIs
  const revenue = filteredProjects
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (p.agreedPrice || (p.pricePerStone || 0) * (p.stoneCount || 0)), 0);
  
  const inProgressCount = filteredProjects.filter(p => p.status === 'In Progress').length;
  const completedCount = filteredProjects.filter(p => p.status === 'Completed').length;
  const pendingCount = filteredProjects.filter(p => p.status === 'Pending').length;

  // Workload Chart Data
  const workloadData = {
    labels: users.map(u => u.name),
    datasets: [{
      label: 'Hours Assigned',
      data: users.map(u => {
        return filteredProjects
          .filter(p => p.assignedTo === u.id && p.status !== 'Completed')
          .reduce((acc, p) => acc + ((p.totalTime || 0) / 60), 0);
      }),
      backgroundColor: '#cd7f32', // Jewelry Bronze
      borderRadius: 4,
      barThickness: 20,
    }]
  };

  // Revenue Evolution Data (for "All" filter)
  const revenueByMonth = projects
    .filter(p => p.status === 'Completed')
    .reduce((acc, p) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + (p.agreedPrice || 0);
      return acc;
    }, {} as Record<string, number>);

  const sortedMonthKeys = Object.keys(revenueByMonth).sort();
  
  const revenueChartData = {
    labels: sortedMonthKeys,
    datasets: [{
      label: 'Revenue (CHF)',
      data: sortedMonthKeys.map(k => revenueByMonth[k]),
      borderColor: '#b87333', // Copper
      backgroundColor: 'rgba(255, 215, 0, 0.2)', // Gold transparent
      pointBackgroundColor: '#b5a642', // Brass
      pointBorderColor: '#fff',
      pointRadius: 4,
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-10">
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
            onUpdate={(updated) => {
               setProjects(projects.map(p => p.id === updated.id ? updated : p));
            }}
          />
        )}
      </AnimatePresence>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20">
        
        {/* Time Period Toggles */}
        <div className="flex bg-gray-50 rounded-xl p-1.5 gap-1 shadow-inner">
           {['week', 'month', 'year', 'all'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                 filter === f 
                   ? 'bg-gradient-to-r from-jewelry-gold to-jewelry-brass text-white shadow-md transform scale-105' 
                   : 'text-gray-500 hover:text-jewelry-copper hover:bg-white'
               }`}
             >
               {t(`filter_${f}`)}
             </button>
           ))}
        </div>

        {/* User Filter Dropdown */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
           <div className="relative w-full lg:w-64">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jewelry-copper" />
              <select 
                value={userFilter} 
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-jewelry-gold/30 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-jewelry-gold outline-none appearance-none cursor-pointer hover:border-jewelry-gold transition-colors shadow-sm"
              >
                <option value="all">{t('allUsers')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Calendar & List */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Visual Calendar */}
          <CalendarView 
             projects={filteredProjects}
             currentDate={calendarDate}
             onNavigate={setCalendarDate}
             onSelectProject={setSelectedProject}
             users={users}
          />

          {/* Detailed Project List */}
          <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col max-h-[400px]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 rounded-t-2xl z-10">
               <h3 className="font-serif font-bold text-gray-800 flex items-center gap-2">
                 <Briefcase className="w-5 h-5 text-jewelry-copper" />
                 {t('projectsInProgress')}
                 <span className="text-xs bg-jewelry-gold text-white font-bold px-2 py-1 rounded-full shadow-sm">{filteredProjects.length}</span>
               </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
              <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                <thead className="bg-amber-50/50 text-jewelry-brass font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3 pl-4 rounded-l-lg">{t('projectName')}</th>
                    <th className="p-3">{t('assignedTo')}</th>
                    <th className="p-3">{t('deadline')}</th>
                    <th className="p-3">{t('status')}</th>
                    <th className="p-3 rounded-r-lg text-right">{t('revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const assignedUser = users.find(u => u.id === p.assignedTo);
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => setSelectedProject(p)}
                        className="hover:bg-amber-50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3 pl-4 font-semibold text-gray-800 flex items-center gap-3 rounded-l-lg">
                          <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white" style={{ backgroundColor: p.color }}></div>
                          {p.projectName}
                        </td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-2">
                           {assignedUser && (
                             <div className="w-6 h-6 rounded-full bg-jewelry-copper/10 flex items-center justify-center text-[10px] font-bold text-jewelry-copper border border-jewelry-copper/20">
                               {assignedUser.name.charAt(0)}
                             </div>
                           )}
                           <span className="text-xs font-medium">{assignedUser?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 font-mono text-xs">
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            p.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            p.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {t(p.status?.toLowerCase().replace(' ', '_'))}
                          </span>
                        </td>
                        <td className="p-3 text-right font-serif font-bold text-gray-700 rounded-r-lg">
                          {p.agreedPrice ? p.agreedPrice.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: KPIs & Charts */}
        <div className="space-y-6">
           
           {/* Revenue Card - UPDATED STYLE */}
           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-jewelry-copper via-jewelry-bronze to-jewelry-rosegold p-6 rounded-2xl shadow-xl text-white relative overflow-hidden ring-1 ring-white/20">
              <div className="relative z-10">
                <p className="text-xs text-amber-100 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {t('completedRevenue')}
                </p>
                <h3 className="text-4xl font-serif font-bold text-white mt-1 drop-shadow-md">{revenue.toLocaleString('de-CH')} <span className="text-lg text-amber-100 font-sans font-medium">CHF</span></h3>
              </div>
              {/* Abstract decorative circles */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-jewelry-gold/20 rounded-full blur-2xl"></div>
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
           </motion.div>

           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-3">
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col items-center justify-center text-center">
                 <div className="p-2 bg-gray-50 w-fit rounded-xl text-gray-600 mb-2 border border-gray-100"><Clock className="w-5 h-5" /></div>
                 <h3 className="text-xl font-bold text-gray-800">{pendingCount}</h3>
                 <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 truncate w-full">{t('pending')}</p>
              </motion.div>

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col items-center justify-center text-center">
                 <div className="p-2 bg-amber-50 w-fit rounded-xl text-jewelry-copper mb-2 border border-amber-100"><Briefcase className="w-5 h-5" /></div>
                 <h3 className="text-xl font-bold text-gray-800">{inProgressCount}</h3>
                 <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 truncate w-full">{t('in_progress')}</p>
              </motion.div>

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col items-center justify-center text-center">
                 <div className="p-2 bg-green-50 w-fit rounded-xl text-green-600 mb-2 border border-green-100"><CheckCircle className="w-5 h-5" /></div>
                 <h3 className="text-xl font-bold text-gray-800">{completedCount}</h3>
                 <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 truncate w-full">{t('completed')}</p>
              </motion.div>
           </div>

           {/* Workload OR Income Evolution Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col justify-between h-[340px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {filter === 'all' ? <TrendingUp className="w-5 h-5 text-jewelry-copper"/> : <User className="w-5 h-5 text-jewelry-copper"/>}
                    <h3 className="font-serif font-bold text-gray-800 text-lg">{filter === 'all' ? t('revenue') + ' Evolution' : t('weeklyWorkload')}</h3>
                  </div>
                  {filter !== 'all' && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">Hours</span>
                  )}
                </div>
                <div className="h-[240px]">
                  {filter === 'all' ? (
                     <Line 
                       data={revenueChartData} 
                       options={{
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Inter' } } },
                            x: { grid: { display: false }, ticks: { font: { family: 'Inter' } } }
                          }
                       }}
                     />
                  ) : (
                    <Bar 
                      data={workloadData} 
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                          y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                          x: { grid: { display: false } }
                        } 
                      }} 
                    />
                  )}
                </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
