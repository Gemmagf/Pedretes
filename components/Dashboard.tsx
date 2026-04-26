import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { getProjects, updateProject, startTimer, stopTimer } from '../services/supabase';
import { Project } from '../types';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, CheckCircle, AlertCircle, X,
  ChevronLeft, ChevronRight, User, Calendar as CalendarIcon,
  TrendingUp, Filter, Clock, Play, Square, ChevronDown, ChevronUp, FileDown
} from 'lucide-react';
import { exportProjectQuote } from '../utils/pdfExport';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

// Formata minuts → "2h 15m"
const fmtTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Formata segons → "01:23:45"
const fmtSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

// --- Edit Modal ---
const ProjectDetailModal = ({ project, onClose, onUpdate }: { project: Project; onClose: () => void; onUpdate: (p: Project) => void }) => {
  const { t } = useTranslation();
  const [edited, setEdited] = useState({ ...project });
  const hourlyRate = 120;

  const handleSave = async () => {
    const saved = await updateProject(edited);
    if (saved) onUpdate(saved);
    onClose();
  };

  const daysToDeadline = edited.deadline
    ? Math.ceil((new Date(edited.deadline).getTime() - Date.now()) / 86400000)
    : 0;

  const impliedCost = (edited.actualTime || 0) / 60 * hourlyRate;
  const showPriceAlert = (edited.agreedPrice && impliedCost > edited.agreedPrice) || ((edited.actualTime || 0) > (edited.totalTime || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jewelry-copper/20 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-jewelry-gold">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">{edited.projectName}</h2>
            <span className="text-sm font-medium text-jewelry-copper">{edited.client} · {edited.sheetType}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-full transition text-gray-400"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex gap-2 bg-amber-50 p-1.5 rounded-xl">
            {(['Pending', 'In Progress', 'Completed'] as const).map(s => (
              <button key={s} onClick={() => setEdited({ ...edited, status: s })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${edited.status === s ? 'bg-white shadow-sm text-jewelry-copper ring-1 ring-jewelry-gold/30' : 'text-gray-500 hover:text-jewelry-bronze'}`}>
                {t(s.toLowerCase().replace(' ', '_'))}
              </button>
            ))}
          </div>

          {/* Time & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-jewelry-rosegold/30 shadow-sm">
              <label className="text-xs font-bold uppercase text-jewelry-rosegold tracking-wider mb-2 block">{t('deadline')}</label>
              <input type="date" value={edited.deadline || ''} onChange={e => setEdited({ ...edited, deadline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2 focus:ring-2 focus:ring-jewelry-rosegold outline-none" />
              <div className={`text-sm flex items-center gap-1 ${daysToDeadline < 3 ? 'text-red-500' : 'text-gray-500'}`}>
                <CalendarIcon className="w-4 h-4" />
                {daysToDeadline > 0 ? `${daysToDeadline} ${t('daysLabel')}` : t('overdueToday')}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-jewelry-copper/30 shadow-sm">
              <label className="text-xs font-bold uppercase text-jewelry-copper tracking-wider mb-2 block">{t('actualTime')} (min)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={edited.actualTime || 0} onChange={e => setEdited({ ...edited, actualTime: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-jewelry-copper outline-none" />
                <span className="text-sm text-gray-400 whitespace-nowrap">/ {edited.totalTime} est</span>
              </div>
              <div className="w-full bg-gray-100 h-2 mt-3 rounded-full overflow-hidden">
                <div className="bg-jewelry-copper h-full transition-all" style={{ width: `${Math.min(((edited.actualTime || 0) / (edited.totalTime || 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border border-jewelry-gold/30 p-4 rounded-2xl bg-amber-50/20">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">{t('agreedPrice')}</label>
              {showPriceAlert && (
                <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                  <AlertCircle className="w-3 h-3" />{t('priceAlert')}
                </div>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-jewelry-copper font-serif font-bold">CHF</span>
              <input type="number" value={edited.agreedPrice || ''} onChange={e => setEdited({ ...edited, agreedPrice: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2.5 pl-14 font-serif text-xl font-bold text-gray-800 focus:ring-2 focus:ring-jewelry-gold outline-none" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition font-medium">{t('close')}</button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-jewelry-copper to-jewelry-bronze text-white font-medium rounded-lg hover:shadow-lg transition">{t('saveChanges')}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Calendar View ---
const CalendarView = ({ projects, currentDate, onNavigate, onSelectProject, users }: {
  projects: Project[]; currentDate: Date; onNavigate: (d: Date) => void; onSelectProject: (p: Project) => void; users: any[];
}) => {
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d: Date) => { const day = new Date(d.getFullYear(), d.getMonth(), 1).getDay(); return day === 0 ? 6 : day - 1; };

  const daysInMonth = getDaysInMonth(currentDate);
  const startOffset = getFirstDay(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const n = i - startOffset + 1;
    return n > 0 && n <= daysInMonth ? n : null;
  });

  const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const isInRange = (check: Date, start: Date, end: Date) => {
    const c = new Date(check); c.setHours(0, 0, 0, 0);
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(0, 0, 0, 0);
    return c >= s && c <= e;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20 overflow-hidden flex flex-col h-[520px]">
      <div className="p-4 flex items-center justify-between border-b border-amber-100 bg-amber-50/30">
        <h3 className="font-serif font-bold text-xl text-jewelry-copper capitalize">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-jewelry-gold/30 transition text-jewelry-bronze">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => onNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-jewelry-gold/30 transition text-jewelry-bronze">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center border-b border-amber-50">
        {['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(d => (
          <div key={d} className="py-2 text-xs font-bold text-jewelry-brass uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-50/20">
        {calendarDays.map((day, idx) => {
          const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
          const dayProjects = dayDate ? projects.filter(p => {
            const s = new Date(p.date);
            const e = p.deadline ? new Date(p.deadline) : new Date(s.getTime() + 86400000);
            return isInRange(dayDate, s, e);
          }) : [];
          return (
            <div key={idx} className={`border-b border-r border-gray-100 p-1 min-h-[70px] ${day ? 'bg-white hover:bg-amber-50/30' : 'bg-gray-50/40'}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isSameDay(new Date(), dayDate!) ? 'bg-jewelry-gold text-white' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5 overflow-y-auto max-h-[60px]">
                    {dayProjects.slice(0, 3).map(p => (
                      <div key={p.id} onClick={e => { e.stopPropagation(); onSelectProject(p); }}
                        className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer truncate hover:brightness-110 transition"
                        style={{ backgroundColor: p.color || '#cd7f32', color: '#fff' }}
                        title={p.projectName}>
                        {isSameDay(new Date(p.date), dayDate!) && <span className="font-semibold">{p.projectName}</span>}
                      </div>
                    ))}
                    {dayProjects.length > 3 && <div className="text-[9px] text-jewelry-bronze pl-1">+{dayProjects.length - 3}</div>}
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

// --- Expandable Project Row with Timer ---
const ProjectRow = ({ project, users, onSelect, onProjectUpdate }: {
  key?: string; project: Project; users: any[]; onSelect: () => void; onProjectUpdate: (p: Project) => void;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hourlyRate = 120;

  const isTimerActive = !!project.timerStartedAt;

  // Calcula el temps actual (temps base + timer actiu)
  const currentMinutes = () => {
    const base = project.actualTime || 0;
    if (!project.timerStartedAt) return base;
    const extra = (Date.now() - new Date(project.timerStartedAt).getTime()) / 60000;
    return base + extra;
  };

  useEffect(() => {
    if (isTimerActive) {
      const update = () => setElapsed(Math.floor(currentMinutes() * 60));
      update();
      intervalRef.current = setInterval(update, 1000);
    } else {
      setElapsed(Math.floor((project.actualTime || 0) * 60));
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTimerActive, project.timerStartedAt, project.actualTime]);

  const handleStartTimer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await startTimer(project.id);
    onProjectUpdate({ ...project, timerStartedAt: new Date().toISOString() });
  };

  const handleStopTimer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await stopTimer(project);
    if (updated) onProjectUpdate(updated);
  };

  const assignedUser = users.find(u => u.id === project.assignedTo);
  const totalMinutes = elapsed / 60;
  const estCost = Math.round(totalMinutes / 60 * hourlyRate);
  const progress = project.totalTime ? Math.min((totalMinutes / project.totalTime) * 100, 100) : 0;
  const overBudget = project.agreedPrice && estCost > project.agreedPrice;

  return (
    <div className={`rounded-xl border transition-all ${isTimerActive ? 'border-green-300 bg-green-50/30' : 'border-gray-100 bg-white hover:bg-amber-50/20'}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white flex-shrink-0" style={{ backgroundColor: project.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{project.projectName}</p>
          <p className="text-xs text-gray-400 truncate">{project.client} · {project.sheetType}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {assignedUser && (
            <div className="w-6 h-6 rounded-full bg-jewelry-copper/10 flex items-center justify-center text-[10px] font-bold text-jewelry-copper border border-jewelry-copper/20">
              {assignedUser.name.charAt(0)}
            </div>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
            project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {t(project.status?.toLowerCase().replace(' ', '_'))}
          </span>
          {isTimerActive && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {/* Timer */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">{isTimerActive ? t('timerActive') : t('elapsedTime')}</p>
                  <p className={`font-mono text-xl font-bold ${isTimerActive ? 'text-green-600' : 'text-gray-700'}`}>
                    {fmtSeconds(elapsed)}
                  </p>
                </div>
                {isTimerActive ? (
                  <button onClick={handleStopTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition shadow-sm">
                    <Square className="w-4 h-4" fill="white" />
                    {t('stopTimer')}
                  </button>
                ) : (
                  <button onClick={handleStartTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition shadow-sm">
                    <Play className="w-4 h-4" fill="white" />
                    {t('startTimer')}
                  </button>
                )}
              </div>

              {/* Progress */}
              {project.totalTime && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{fmtTime(totalMinutes)} / {fmtTime(project.totalTime)}</span>
                    <span className={overBudget ? 'text-red-500 font-bold' : ''}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-red-400' : 'bg-jewelry-copper'}`}
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Cost */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <p className="text-gray-400">{t('estimatedCost')}</p>
                  <p className={`font-bold text-base ${overBudget ? 'text-red-500' : 'text-gray-800'}`}>{estCost} CHF</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <p className="text-gray-400">{t('agreedPrice')}</p>
                  <p className="font-bold text-base text-jewelry-copper">{project.agreedPrice ?? '—'} CHF</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={e => { e.stopPropagation(); onSelect(); }}
                  className="flex-1 text-center text-xs text-jewelry-copper hover:text-jewelry-bronze font-medium py-1.5 border border-jewelry-gold/30 rounded-lg hover:bg-amber-50 transition">
                  {t('editProject')} →
                </button>
                <button
                  onClick={e => { e.stopPropagation(); exportProjectQuote(project); }}
                  className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium py-1.5 px-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Dashboard ---
const Dashboard = () => {
  const { t } = useTranslation();
  const { users } = useUsers();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [userFilter, setUserFilter] = useState('all');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const refreshData = async () => {
    setLoading(true);
    const data = await getProjects();
    const processed = data.map(p => {
      const hash = [...(p.projectName || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return { ...p, color: `hsl(${25 + (hash % 25)}, ${70 + (hash % 20)}%, ${45 + (hash % 15)}%)` };
    });
    setProjects(processed);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const updateProjectInState = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated, color: p.color } : p));
    if (selectedProject?.id === updated.id) setSelectedProject({ ...updated, color: selectedProject.color });
  };

  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const day = todayStart.getDay();
    const dist = day === 0 ? 6 : day - 1;
    const monday = new Date(todayStart); monday.setDate(todayStart.getDate() - dist);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);

    setFilteredProjects(projects.filter(p => {
      if (userFilter !== 'all' && p.assignedTo !== userFilter) return false;
      const d = new Date(p.date); d.setHours(0, 0, 0, 0);
      if (filter === 'all') return true;
      if (filter === 'year') return d.getFullYear() === todayStart.getFullYear();
      if (filter === 'month') return d.getMonth() === todayStart.getMonth() && d.getFullYear() === todayStart.getFullYear();
      if (filter === 'week') return d >= monday && d <= sunday;
      return true;
    }));
  }, [filter, userFilter, projects]);

  const revenue = filteredProjects.filter(p => p.status === 'Completed').reduce((s, p) => s + (p.agreedPrice || 0), 0);
  const inProgressCount = filteredProjects.filter(p => p.status === 'In Progress').length;
  const completedCount = filteredProjects.filter(p => p.status === 'Completed').length;
  const pendingCount = filteredProjects.filter(p => p.status === 'Pending').length;

  const workloadData = {
    labels: users.map(u => u.name),
    datasets: [{
      label: 'Hours',
      data: users.map(u => filteredProjects.filter(p => p.assignedTo === u.id && p.status !== 'Completed').reduce((a, p) => a + ((p.totalTime || 0) / 60), 0)),
      backgroundColor: '#cd7f32', borderRadius: 4, barThickness: 20,
    }],
  };

  const revenueByMonth = projects.filter(p => p.status === 'Completed').reduce((acc, p) => {
    const d = new Date(p.date);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    acc[k] = (acc[k] || 0) + (p.agreedPrice || 0);
    return acc;
  }, {} as Record<string, number>);
  const sortedKeys = Object.keys(revenueByMonth).sort();
  const revenueChartData = {
    labels: sortedKeys,
    datasets: [{
      label: 'Revenue (CHF)',
      data: sortedKeys.map(k => revenueByMonth[k]),
      borderColor: '#b87333',
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
      pointBackgroundColor: '#b5a642',
      pointBorderColor: '#fff',
      pointRadius: 4, tension: 0.4, fill: true,
    }],
  };

  const activeProjects = filteredProjects.filter(p => p.status !== 'Completed');
  const activeTimers = projects.filter(p => p.timerStartedAt).length;

  return (
    <div className="space-y-6 pb-10">
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdate={updateProjectInState}
          />
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20">
        <div className="flex bg-gray-50 rounded-xl p-1 gap-1 shadow-inner">
          {(['week', 'month', 'year', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-gradient-to-r from-jewelry-gold to-jewelry-brass text-white shadow-md scale-105' : 'text-gray-500 hover:text-jewelry-copper hover:bg-white'}`}>
              {t(`filter_${f}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {activeTimers > 0 && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-bold border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {activeTimers} timer{activeTimers > 1 ? 's' : ''} actiu{activeTimers > 1 ? 's' : ''}
            </div>
          )}
          <div className="relative w-full lg:w-56">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jewelry-copper" />
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-jewelry-gold/30 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-jewelry-gold outline-none appearance-none cursor-pointer hover:border-jewelry-gold transition shadow-sm">
              <option value="all">{t('allUsers')}</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Calendar + Project List */}
        <div className="xl:col-span-2 space-y-6">
          <CalendarView
            projects={filteredProjects}
            currentDate={calendarDate}
            onNavigate={setCalendarDate}
            onSelectProject={setSelectedProject}
            users={users}
          />

          {/* Expandable Project List */}
          <div className="bg-white rounded-2xl shadow-sm border border-jewelry-gold/20">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-jewelry-copper" />
              <h3 className="font-serif font-bold text-gray-800">{t('projectsInProgress')}</h3>
              <span className="text-xs bg-jewelry-gold text-white font-bold px-2 py-0.5 rounded-full">{filteredProjects.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jewelry-gold" /></div>
              ) : filteredProjects.length === 0 ? (
                <p className="text-center text-gray-400 italic py-8">{t('noProjects')}</p>
              ) : (
                filteredProjects.map(p => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    users={users}
                    onSelect={() => setSelectedProject(p)}
                    onProjectUpdate={updateProjectInState}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: KPIs + Chart */}
        <div className="space-y-6">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-jewelry-copper via-jewelry-bronze to-jewelry-rosegold p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs text-amber-100 font-bold uppercase tracking-wider mb-2">{t('completedRevenue')}</p>
              <h3 className="text-4xl font-serif font-bold drop-shadow-md">
                {revenue.toLocaleString('de-CH')} <span className="text-lg text-amber-100 font-sans font-medium">CHF</span>
              </h3>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-jewelry-gold/20 rounded-full blur-2xl" />
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('pending'), count: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-gray-600 bg-gray-50 border-gray-100' },
              { label: t('in_progress'), count: inProgressCount, icon: <Briefcase className="w-5 h-5 text-jewelry-copper" />, color: 'text-jewelry-copper bg-amber-50 border-amber-100' },
              { label: t('completed'), count: completedCount, icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'text-green-600 bg-green-50 border-green-100' },
            ].map(({ label, count, icon, color }) => (
              <motion.div key={label} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-jewelry-gold/20 flex flex-col items-center text-center">
                <div className={`p-2 w-fit rounded-xl mb-2 border ${color}`}>{icon}</div>
                <h3 className="text-xl font-bold text-gray-800">{count}</h3>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 truncate w-full">{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-jewelry-gold/20 h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              {filter === 'all' ? <TrendingUp className="w-5 h-5 text-jewelry-copper" /> : <User className="w-5 h-5 text-jewelry-copper" />}
              <h3 className="font-serif font-bold text-gray-800 text-base">{filter === 'all' ? 'Revenue Evolution' : t('weeklyWorkload')}</h3>
            </div>
            <div className="h-[220px]">
              {filter === 'all'
                ? <Line data={revenueChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }} />
                : <Bar data={workloadData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
