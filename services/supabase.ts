import { createClient } from '@supabase/supabase-js';
import { Project, User, PredictionData } from '../types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- MAPPERS ---

const toProject = (row: any): Project => ({
  id: row.id,
  projectName: row.project_name,
  client: row.client,
  sheetType: row.project_type,
  status: row.status,
  assignedTo: row.assigned_to,
  date: row.date,
  deadline: row.deadline,
  stoneCount: row.stone_count,
  timePerStone: row.time_per_stone,
  totalTime: row.total_time,
  actualTime: row.actual_time,
  timerStartedAt: row.timer_started_at,
  pricePerStone: row.price_per_stone,
  agreedPrice: row.agreed_price,
  goldWeight: row.gold_weight,
  stoneSize: row.stone_size,
  stoneType: row.stone_type,
  material: row.material,
  style: row.style,
  shape: row.shape,
  layout: row.layout,
  fixation: row.fixation,
});

const toRow = (p: Partial<Project>) => ({
  project_name: p.projectName,
  client: p.client || null,
  project_type: p.sheetType,
  status: p.status || 'Pending',
  assigned_to: p.assignedTo || null,
  date: p.date || new Date().toISOString(),
  deadline: p.deadline || null,
  stone_count: p.stoneCount || null,
  time_per_stone: p.timePerStone || null,
  total_time: p.totalTime || null,
  actual_time: p.actualTime ?? 0,
  timer_started_at: p.timerStartedAt || null,
  price_per_stone: p.pricePerStone || null,
  agreed_price: p.agreedPrice || null,
  gold_weight: p.goldWeight || null,
  stone_size: p.stoneSize || null,
  stone_type: p.stoneType || null,
  material: p.material || null,
  style: p.style || null,
  shape: p.shape || null,
  layout: p.layout || null,
  fixation: p.fixation || null,
});

const toUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  baseHours: row.base_hours,
  extraHours: row.extra_hours,
  workingDays: row.working_days ?? [1, 2, 3, 4, 5],
  daysOff: row.days_off ?? [],
});

// --- PROJECTS ---

export const getProjects = async (type?: 'Alliance' | 'Fassung' | 'Pave'): Promise<Project[]> => {
  let query = supabase.from('projects').select('*').order('date', { ascending: false });
  if (type) query = query.eq('project_type', type);
  const { data, error } = await query;
  if (error) { console.error('getProjects error:', error); return []; }
  return (data || []).map(toProject);
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .insert(toRow(project))
    .select()
    .single();
  if (error) { console.error('addProject error:', error); return null; }
  return toProject(data);
};

export const updateProject = async (project: Project): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .update(toRow(project))
    .eq('id', project.id)
    .select()
    .single();
  if (error) { console.error('updateProject error:', error); return null; }
  return toProject(data);
};

// --- TIMER ---

export const startTimer = async (projectId: string): Promise<void> => {
  await supabase
    .from('projects')
    .update({ timer_started_at: new Date().toISOString() })
    .eq('id', projectId);
};

export const stopTimer = async (project: Project): Promise<Project | null> => {
  if (!project.timerStartedAt) return null;
  const elapsedMin = (Date.now() - new Date(project.timerStartedAt).getTime()) / 60000;
  const newActualTime = Math.round(((project.actualTime || 0) + elapsedMin) * 10) / 10;

  const { data, error } = await supabase
    .from('projects')
    .update({ actual_time: newActualTime, timer_started_at: null })
    .eq('id', project.id)
    .select()
    .single();
  if (error) { console.error('stopTimer error:', error); return null; }
  return toProject(data);
};

// --- PREDICCIÓ INTEL·LIGENT ---
// Cerca projectes similars per predir temps i preu

export const getSimilarProjects = async (
  projectType: 'Alliance' | 'Fassung' | 'Pave',
  filters: { style?: string; material?: string; stoneType?: string; shape?: string }
): Promise<PredictionData | null> => {
  let query = supabase
    .from('projects')
    .select('total_time, actual_time, agreed_price')
    .eq('project_type', projectType)
    .not('total_time', 'is', null);

  // Aplica filtres disponibles (de més específic a menys)
  if (filters.style) query = query.eq('style', filters.style);
  if (filters.material) query = query.eq('material', filters.material);
  if (filters.stoneType) query = query.eq('stone_type', filters.stoneType);

  const { data } = await query.limit(100);
  if (!data || data.length < 2) return null;

  const times = data
    .map(d => d.actual_time && d.actual_time > 0 ? d.actual_time : d.total_time)
    .filter((t): t is number => t != null && t > 0);

  const prices = data
    .map(d => d.agreed_price)
    .filter((p): p is number => p != null && p > 0);

  if (times.length < 2) return null;

  return {
    count: data.length,
    avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    avgPrice: prices.length >= 2 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
  };
};

// --- ANALÍTIQUES ---

export interface RevenueStats {
  today: number;
  month: number;
  year: number;
  allTime: number;
}

export interface ProfitabilityByType {
  type: string;
  revenue: number;
  totalMinutes: number;
  chfPerHour: number;
  projectCount: number;
}

export interface ClientStats {
  client: string;
  revenue: number;
  projectCount: number;
  avgPrice: number;
}

export interface MonthlyRevenue {
  month: string; // "YYYY-MM"
  revenue: number;
}

export const getRevenueStats = async (): Promise<RevenueStats> => {
  const { data } = await supabase
    .from('projects')
    .select('agreed_price, date, status')
    .eq('status', 'Completed')
    .not('agreed_price', 'is', null);

  if (!data) return { today: 0, month: 0, year: 0, allTime: 0 };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearStr = `${now.getFullYear()}`;

  let today = 0, month = 0, year = 0, allTime = 0;
  for (const row of data) {
    const price = row.agreed_price || 0;
    const dateStr = (row.date || '').substring(0, 10);
    allTime += price;
    if (dateStr.startsWith(yearStr)) year += price;
    if (dateStr.startsWith(monthStr)) month += price;
    if (dateStr === todayStr) today += price;
  }

  return { today, month, year, allTime };
};

export const getProfitabilityByType = async (): Promise<ProfitabilityByType[]> => {
  const { data } = await supabase
    .from('projects')
    .select('project_type, agreed_price, actual_time, total_time')
    .eq('status', 'Completed');

  if (!data) return [];

  const byType: Record<string, { revenue: number; minutes: number; count: number }> = {};
  for (const row of data) {
    const type = row.project_type;
    if (!byType[type]) byType[type] = { revenue: 0, minutes: 0, count: 0 };
    byType[type].revenue += row.agreed_price || 0;
    byType[type].minutes += row.actual_time || row.total_time || 0;
    byType[type].count++;
  }

  return Object.entries(byType).map(([type, d]) => ({
    type,
    revenue: Math.round(d.revenue),
    totalMinutes: Math.round(d.minutes),
    chfPerHour: d.minutes > 0 ? Math.round((d.revenue / d.minutes) * 60) : 0,
    projectCount: d.count,
  })).sort((a, b) => b.chfPerHour - a.chfPerHour);
};

export const getClientStats = async (): Promise<ClientStats[]> => {
  const { data } = await supabase
    .from('projects')
    .select('client, agreed_price')
    .eq('status', 'Completed')
    .not('client', 'is', null);

  if (!data) return [];

  const byClient: Record<string, { revenue: number; count: number }> = {};
  for (const row of data) {
    const client = row.client || 'Desconegut';
    if (!byClient[client]) byClient[client] = { revenue: 0, count: 0 };
    byClient[client].revenue += row.agreed_price || 0;
    byClient[client].count++;
  }

  return Object.entries(byClient).map(([client, d]) => ({
    client,
    revenue: Math.round(d.revenue),
    projectCount: d.count,
    avgPrice: d.count > 0 ? Math.round(d.revenue / d.count) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
};

export const getMonthlyRevenue = async (): Promise<MonthlyRevenue[]> => {
  const { data } = await supabase
    .from('projects')
    .select('agreed_price, date')
    .eq('status', 'Completed')
    .not('agreed_price', 'is', null)
    .order('date', { ascending: true });

  if (!data) return [];

  const byMonth: Record<string, number> = {};
  for (const row of data) {
    const d = new Date(row.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + (row.agreed_price || 0);
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
};

// --- USERS ---

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*').order('name');
  if (error) { console.error('getUsers error:', error); return []; }
  return (data || []).map(toUser);
};

export const addUser = async (name: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, base_hours: 40, extra_hours: 0, working_days: [1, 2, 3, 4, 5], days_off: [] })
    .select()
    .single();
  if (error) { console.error('addUser error:', error); return null; }
  return toUser(data);
};

export const updateUserHours = async (id: string, extraHours: number): Promise<void> => {
  await supabase.from('users').update({ extra_hours: extraHours }).eq('id', id);
};

export const updateUserAvailability = async (
  id: string,
  workingDays: number[],
  daysOff: string[]
): Promise<void> => {
  await supabase
    .from('users')
    .update({ working_days: workingDays, days_off: daysOff })
    .eq('id', id);
};
