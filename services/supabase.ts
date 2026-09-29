import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Project, User } from '../types';
import { Emitter, type Store } from './store';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the build was given Supabase credentials. Without them the app runs local/demo only. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null;

// --- Mappers -----------------------------------------------------------------

const toProject = (row: any): Project => ({
  id: row.id,
  projectName: row.project_name,
  client: row.client,
  sheetType: row.project_type,
  status: row.status,
  assignedTo: row.assigned_to ?? undefined,
  date: row.date,
  deadline: row.deadline ?? undefined,
  stoneCount: row.stone_count ?? undefined,
  timePerStone: row.time_per_stone ?? undefined,
  totalTime: row.total_time ?? undefined,
  actualTime: row.actual_time ?? undefined,
  timerStartedAt: row.timer_started_at ?? undefined,
  pricePerStone: row.price_per_stone ?? undefined,
  agreedPrice: row.agreed_price ?? undefined,
  goldWeight: row.gold_weight ?? undefined,
  stoneSize: row.stone_size ?? undefined,
  stoneType: row.stone_type ?? undefined,
  material: row.material ?? undefined,
  style: row.style ?? undefined,
  shape: row.shape ?? undefined,
  layout: row.layout ?? undefined,
  fixation: row.fixation ?? undefined,
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
  baseHours: row.base_hours ?? 40,
  extraHours: row.extra_hours ?? 0,
  workingDays: row.working_days ?? [1, 2, 3, 4, 5],
  daysOff: row.days_off ?? [],
});

const toUserRow = (patch: Partial<User>) => {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.baseHours !== undefined) row.base_hours = patch.baseHours;
  if (patch.extraHours !== undefined) row.extra_hours = patch.extraHours;
  if (patch.workingDays !== undefined) row.working_days = patch.workingDays;
  if (patch.daysOff !== undefined) row.days_off = patch.daysOff;
  return row;
};

// --- Store -------------------------------------------------------------------

const emitter = new Emitter();

const logError = (scope: string, error: unknown) => console.error(`[supabase] ${scope}:`, error);

export const supabaseStore: Store = {
  kind: 'supabase',

  async listProjects() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('projects').select('*').order('date', { ascending: false });
    if (error) { logError('listProjects', error); return []; }
    return (data ?? []).map(toProject);
  },

  async addProject(project) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('projects').insert(toRow(project)).select().single();
    if (error) { logError('addProject', error); return null; }
    emitter.emit();
    return toProject(data);
  },

  async updateProject(project) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('projects').update(toRow(project)).eq('id', project.id).select().single();
    if (error) { logError('updateProject', error); return null; }
    emitter.emit();
    return toProject(data);
  },

  async deleteProject(id) {
    if (!supabase) return false;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { logError('deleteProject', error); return false; }
    emitter.emit();
    return true;
  },

  async listUsers() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) { logError('listUsers', error); return []; }
    return (data ?? []).map(toUser);
  },

  async addUser(name) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .insert({ name, base_hours: 40, extra_hours: 0, working_days: [1, 2, 3, 4, 5], days_off: [] })
      .select().single();
    if (error) { logError('addUser', error); return null; }
    emitter.emit();
    return toUser(data);
  },

  async updateUser(id, patch) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').update(toUserRow(patch)).eq('id', id).select().single();
    if (error) { logError('updateUser', error); return null; }
    emitter.emit();
    return toUser(data);
  },

  subscribe: l => emitter.subscribe(l),
};
