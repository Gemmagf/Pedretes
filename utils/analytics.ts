import type { PredictionData, Project, ProjectType, User } from '../types';

export interface RevenueStats { today: number; month: number; year: number; allTime: number; }
export interface ProfitabilityByType { type: ProjectType; revenue: number; totalMinutes: number; chfPerHour: number; projectCount: number; }
export interface ClientStats { client: string; revenue: number; projectCount: number; avgPrice: number; }
export interface MonthlyRevenue { month: string; revenue: number; count: number; }
export interface PersonStats { user: User; completed: number; open: number; minutes: number; revenue: number; chfPerHour: number; }

const completed = (projects: Project[]) => projects.filter(p => p.status === 'Completed');
const monthKey = (iso: string) => iso.substring(0, 7);

export function computeRevenueStats(projects: Project[], now = new Date()): RevenueStats {
  const todayStr = now.toISOString().substring(0, 10);
  const monthStr = todayStr.substring(0, 7);
  const yearStr = todayStr.substring(0, 4);
  const stats = { today: 0, month: 0, year: 0, allTime: 0 };
  for (const p of completed(projects)) {
    const price = p.agreedPrice || 0;
    const d = (p.date || '').substring(0, 10);
    stats.allTime += price;
    if (d.startsWith(yearStr)) stats.year += price;
    if (d.startsWith(monthStr)) stats.month += price;
    if (d === todayStr) stats.today += price;
  }
  return stats;
}

export function computeProfitabilityByType(projects: Project[]): ProfitabilityByType[] {
  const byType = new Map<ProjectType, { revenue: number; minutes: number; count: number }>();
  for (const p of completed(projects)) {
    const cur = byType.get(p.sheetType) ?? { revenue: 0, minutes: 0, count: 0 };
    cur.revenue += p.agreedPrice || 0;
    cur.minutes += (p.actualTime && p.actualTime > 0 ? p.actualTime : p.totalTime) || 0;
    cur.count++;
    byType.set(p.sheetType, cur);
  }
  return [...byType.entries()]
    .map(([type, d]) => ({
      type,
      revenue: Math.round(d.revenue),
      totalMinutes: Math.round(d.minutes),
      chfPerHour: d.minutes > 0 ? Math.round((d.revenue / d.minutes) * 60) : 0,
      projectCount: d.count,
    }))
    .sort((a, b) => b.chfPerHour - a.chfPerHour);
}

export function computeClientStats(projects: Project[]): ClientStats[] {
  const byClient = new Map<string, { revenue: number; count: number }>();
  for (const p of completed(projects)) {
    if (!p.client) continue;
    const cur = byClient.get(p.client) ?? { revenue: 0, count: 0 };
    cur.revenue += p.agreedPrice || 0;
    cur.count++;
    byClient.set(p.client, cur);
  }
  return [...byClient.entries()]
    .map(([client, d]) => ({ client, revenue: Math.round(d.revenue), projectCount: d.count, avgPrice: d.count ? Math.round(d.revenue / d.count) : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeMonthlyRevenue(projects: Project[], months = 12, now = new Date()): MonthlyRevenue[] {
  const byMonth = new Map<string, { revenue: number; count: number }>();
  for (const p of completed(projects)) {
    if (!p.date) continue;
    const k = monthKey(p.date);
    const cur = byMonth.get(k) ?? { revenue: 0, count: 0 };
    cur.revenue += p.agreedPrice || 0;
    cur.count++;
    byMonth.set(k, cur);
  }
  // Always return a continuous window ending this month (zero-filled).
  const out: MonthlyRevenue[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const v = byMonth.get(k) ?? { revenue: 0, count: 0 };
    out.push({ month: k, revenue: Math.round(v.revenue), count: v.count });
  }
  return out;
}

export function computePersonStats(projects: Project[], users: User[]): PersonStats[] {
  return users.map(user => {
    const mine = projects.filter(p => p.assignedTo === user.id);
    const done = mine.filter(p => p.status === 'Completed');
    const minutes = done.reduce((a, p) => a + ((p.actualTime && p.actualTime > 0 ? p.actualTime : p.totalTime) || 0), 0);
    const revenue = done.reduce((a, p) => a + (p.agreedPrice || 0), 0);
    return {
      user,
      completed: done.length,
      open: mine.length - done.length,
      minutes: Math.round(minutes),
      revenue: Math.round(revenue),
      chfPerHour: minutes > 0 ? Math.round((revenue / minutes) * 60) : 0,
    };
  }).filter(s => s.completed + s.open > 0);
}

/** Predict time/price from similar projects of the same type (matching the given attributes). */
export function computePrediction(
  projects: Project[],
  type: ProjectType,
  filters: { style?: string; material?: string; stoneType?: string; shape?: string },
): PredictionData | null {
  const active = Object.entries(filters).filter(([, v]) => !!v) as [keyof typeof filters, string][];
  if (active.length === 0) return null;

  // Try the full match first, then progressively relax filters so we still learn from sparse data.
  for (let n = active.length; n >= 1; n--) {
    const use = active.slice(0, n);
    const matches = projects.filter(p => p.sheetType === type && p.totalTime && use.every(([k, v]) => p[k] === v));
    if (matches.length < 2) continue;
    const times = matches.map(p => (p.actualTime && p.actualTime > 0 ? p.actualTime : p.totalTime!)).filter(t => t > 0);
    if (times.length < 2) continue;
    const prices = matches.map(p => p.agreedPrice).filter((v): v is number => !!v && v > 0);
    return {
      count: matches.length,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgPrice: prices.length >= 2 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
    };
  }
  return null;
}

/** Open projects sorted by deadline; overdue first. */
export function upcomingDeadlines(projects: Project[], limit = 6): Project[] {
  return projects
    .filter(p => p.status !== 'Completed' && p.deadline)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, limit);
}
