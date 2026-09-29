import type { Project, User } from '../types';
import { hoursPerDay } from './scheduling';
import { toISODate } from './format';

export interface PlanItem {
  project: Project;
  assigneeId: string | null;
  /** True when the planner picked the person (project was unassigned). */
  autoAssigned: boolean;
  remainingMinutes: number;
  start: string | null;
  finish: string | null;
  late: boolean;
  daysLate: number;
}

export interface WeekLoad {
  weekStart: string; // Monday, YYYY-MM-DD
  perUser: Record<string, { capacity: number; planned: number }>; // minutes
}

export interface Plan {
  items: PlanItem[];
  weeks: WeekLoad[];
  totalRemaining: number;
  capacityNext4Weeks: number;
  plannedNext4Weeks: number;
}

const DEFAULT_MINUTES = 60;
const HORIZON_DAYS = 120;

const remainingOf = (p: Project) => Math.max(0, (p.totalTime || DEFAULT_MINUTES) - (p.actualTime || 0));

const mondayOf = (d: Date) => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); m.setHours(12, 0, 0, 0); return m; };

/**
 * Greedy capacity planner: open orders in deadline order are poured into each
 * person's working days (respecting days off and hours/day). Unassigned orders
 * go to whoever is free first. Returns per-order start/finish and weekly load.
 */
export function planSchedule(projects: Project[], users: User[], opts: { from?: Date; weeks?: number } = {}): Plan {
  const from = opts.from ?? new Date();
  const weeksCount = opts.weeks ?? 8;
  const open = projects
    .filter(p => p.status !== 'Completed')
    .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999') || a.date.localeCompare(b.date));

  // Day-by-day capacity per user over the horizon.
  type Day = { iso: string; free: number };
  const calendars = new Map<string, Day[]>();
  const cursor0 = new Date(from); cursor0.setHours(12, 0, 0, 0);
  for (const u of users) {
    const days: Day[] = [];
    const daysOff = new Set(u.daysOff);
    const working = new Set(u.workingDays.length ? u.workingDays : [1, 2, 3, 4, 5]);
    const cap = hoursPerDay(u) * 60;
    const c = new Date(cursor0);
    for (let i = 0; i < HORIZON_DAYS; i++) {
      const iso = toISODate(c);
      days.push({ iso, free: working.has(c.getDay()) && !daysOff.has(iso) ? cap : 0 });
      c.setDate(c.getDate() + 1);
    }
    calendars.set(u.id, days);
  }
  const pointers = new Map<string, number>(users.map(u => [u.id, 0]));
  const firstFreeIndex = (uid: string) => {
    const days = calendars.get(uid)!;
    let i = pointers.get(uid)!;
    while (i < days.length && days[i].free <= 0) i++;
    return i;
  };

  const items: PlanItem[] = [];
  const todayISO = toISODate(from);

  for (const p of open) {
    let remaining = remainingOf(p);
    let assigneeId: string | null = p.assignedTo && calendars.has(p.assignedTo) ? p.assignedTo : null;
    let autoAssigned = false;
    if (!assigneeId && users.length) {
      assigneeId = users.map(u => u.id).sort((a, b) => firstFreeIndex(a) - firstFreeIndex(b))[0];
      autoAssigned = true;
    }
    if (!assigneeId || remaining === 0) {
      items.push({ project: p, assigneeId, autoAssigned, remainingMinutes: remaining, start: null, finish: null, late: false, daysLate: 0 });
      continue;
    }
    // A running timer means the job is being worked on today.
    if (p.timerStartedAt) remaining = Math.max(0, remaining);
    const days = calendars.get(assigneeId)!;
    let i = pointers.get(assigneeId)!;
    let start: string | null = null, finish: string | null = null;
    while (remaining > 0 && i < days.length) {
      const d = days[i];
      if (d.free <= 0) { i++; continue; }
      if (!start) start = d.iso;
      const used = Math.min(d.free, remaining);
      d.free -= used; remaining -= used; finish = d.iso;
      if (d.free <= 0) i++;
    }
    pointers.set(assigneeId, i);
    const late = !!(p.deadline && finish && finish > p.deadline);
    const daysLate = late ? Math.round((new Date(finish! + 'T12:00:00').getTime() - new Date(p.deadline! + 'T12:00:00').getTime()) / 86400000) : 0;
    items.push({ project: p, assigneeId, autoAssigned, remainingMinutes: remainingOf(p), start: start ?? todayISO, finish, late, daysLate });
  }

  // Weekly load: capacity vs planned per user.
  const weeks: WeekLoad[] = [];
  const monday = mondayOf(from);
  for (let w = 0; w < weeksCount; w++) {
    const ws = new Date(monday); ws.setDate(ws.getDate() + w * 7);
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    const a = toISODate(ws), b = toISODate(we);
    const perUser: WeekLoad['perUser'] = {};
    for (const u of users) {
      const cap = hoursPerDay(u) * 60;
      const daysOff = new Set(u.daysOff);
      const working = new Set(u.workingDays.length ? u.workingDays : [1, 2, 3, 4, 5]);
      let capacity = 0;
      for (let k = 0; k < 7; k++) {
        const d = new Date(ws); d.setDate(d.getDate() + k);
        const iso = toISODate(d);
        if (iso < todayISO) continue;
        if (working.has(d.getDay()) && !daysOff.has(iso)) capacity += cap;
      }
      const days = calendars.get(u.id)!;
      const original = days.filter(d => d.iso >= a && d.iso <= b);
      // planned = capacity that was consumed by the greedy pass
      const freeLeft = original.reduce((s, d) => s + d.free, 0);
      perUser[u.id] = { capacity, planned: Math.max(0, capacity - freeLeft) };
    }
    weeks.push({ weekStart: a, perUser });
  }
  const sum = (n: number, f: (w: WeekLoad) => number) => weeks.slice(0, n).reduce((s, w) => s + f(w), 0);
  return {
    items,
    weeks,
    totalRemaining: items.reduce((s, i) => s + i.remainingMinutes, 0),
    capacityNext4Weeks: sum(4, w => Object.values(w.perUser).reduce((s, v) => s + v.capacity, 0)),
    plannedNext4Weeks: sum(4, w => Object.values(w.perUser).reduce((s, v) => s + v.planned, 0)),
  };
}
