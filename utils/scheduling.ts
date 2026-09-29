import type { Project, User } from '../types';
import { toISODate } from './format';

const DEFAULT_HOURS_PER_DAY = 6;
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];

/** Productive hours a person can dedicate per working day. */
export const hoursPerDay = (user?: User) => {
  if (!user) return DEFAULT_HOURS_PER_DAY;
  const days = user.workingDays.length || 5;
  return Math.max(1, (user.baseHours + user.extraHours) / days);
};

/** Remaining minutes of open work already assigned to a user. */
export const openMinutesFor = (projects: Project[], userId?: string) =>
  projects
    .filter(p => p.status !== 'Completed' && (!userId || p.assignedTo === userId))
    .reduce((acc, p) => acc + Math.max(0, (p.totalTime || 0) - (p.actualTime || 0)), 0);

export interface ScheduleSuggestion {
  date: string;          // "YYYY-MM-DD"
  workingDays: number;   // working days consumed
  queueMinutes: number;  // minutes of prior work in the queue
}

/**
 * Walk the calendar from tomorrow, skipping non-working days and days off,
 * until the queued work plus the new job fits into the person's capacity.
 */
export function suggestDeliveryDate(opts: { minutes: number; user?: User; openMinutes?: number; from?: Date }): ScheduleSuggestion {
  const { minutes, user, openMinutes = 0 } = opts;
  const workingDays = new Set(user?.workingDays?.length ? user.workingDays : DEFAULT_WORKING_DAYS);
  const daysOff = new Set(user?.daysOff ?? []);
  const capacityPerDay = hoursPerDay(user) * 60;

  let remaining = openMinutes + Math.max(0, minutes);
  let consumed = 0;
  const cursor = new Date(opts.from ?? new Date());
  cursor.setHours(12, 0, 0, 0);

  for (let i = 0; i < 400; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const iso = toISODate(cursor);
    if (!workingDays.has(cursor.getDay()) || daysOff.has(iso)) continue;
    consumed++;
    remaining -= capacityPerDay;
    if (remaining <= 0) break;
  }
  return { date: toISODate(cursor), workingDays: consumed, queueMinutes: openMinutes };
}
