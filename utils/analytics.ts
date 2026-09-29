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

// ─── Experience-based prediction (per stone) ─────────────────────────────────

export interface PerStonePrediction {
  /** Attributes that matched the history (most specific tier first). */
  matched: ('style' | 'stoneType' | 'material' | 'shape')[];
  count: number;
  minutesPerStone: { median: number; p25: number; p75: number };
  pricePerStone: { median: number; p25: number; p75: number } | null;
  /** Effective CHF/h of the matched jobs. */
  chfPerHour: number | null;
  confidence: 'high' | 'medium' | 'low';
}

const quantile = (sorted: number[], q: number) => {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};
const stats = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  return { median: quantile(s, 0.5), p25: quantile(s, 0.25), p75: quantile(s, 0.75) };
};
const jobMinutes = (p: Project) => (p.actualTime && p.actualTime > 0 ? p.actualTime : p.totalTime) || 0;
const firstStyle = (s?: string) => (s || '').split(',')[0].trim();

/**
 * Predicts minutes and price per stone from similar past jobs, relaxing the match
 * from (style + stone type + material) down to the order type alone.
 */
export function predictPerStone(
  projects: Project[],
  type: ProjectType,
  attrs: { style?: string; stoneType?: string; material?: string; shape?: string },
): PerStonePrediction | null {
  const history = projects.filter(p => p.sheetType === type && jobMinutes(p) > 0);
  const tiers: (keyof typeof attrs)[][] = [
    ['style', 'stoneType', 'material'], ['style', 'stoneType'], ['style', 'material'], ['style'], ['stoneType', 'material'], ['stoneType'], ['shape'], [],
  ];
  for (const tier of tiers) {
    if (tier.some(k => !attrs[k])) continue;
    const matches = history.filter(p => tier.every(k =>
      k === 'style' ? firstStyle(p.style).toLowerCase() === firstStyle(attrs.style).toLowerCase()
      : k === 'shape' ? (p.shape || '').toLowerCase() === (attrs.shape || '').toLowerCase()
      : (p[k] || '') === attrs[k]));
    const min = tier.length === 0 ? 5 : 3;
    if (matches.length < min) continue;
    const perStoneMin = matches.map(p => jobMinutes(p) / Math.max(1, p.stoneCount || 1));
    const prices = matches.map(p => p.pricePerStone || (p.agreedPrice && p.stoneCount ? p.agreedPrice / p.stoneCount : 0)).filter(v => v > 0);
    const revenue = matches.reduce((a, p) => a + (p.agreedPrice || 0), 0);
    const minutes = matches.reduce((a, p) => a + jobMinutes(p), 0);
    return {
      matched: tier,
      count: matches.length,
      minutesPerStone: stats(perStoneMin),
      pricePerStone: prices.length >= 2 ? stats(prices) : null,
      chfPerHour: revenue > 0 && minutes > 0 ? Math.round((revenue / minutes) * 60) : null,
      confidence: matches.length >= 10 && tier.length >= 2 ? 'high' : matches.length >= 5 ? 'medium' : 'low',
    };
  }
  return null;
}

// ─── Profitability by any dimension ──────────────────────────────────────────

export interface RateRow {
  key: string;
  count: number;
  minutes: number;
  revenue: number;
  stones: number;
  chfPerHour: number;
  /** Share of total revenue (0–1). */
  share: number;
  avgPricePerStone: number;
}

export function computeRateBy(projects: Project[], keyOf: (p: Project) => string | undefined, minCount = 2): RateRow[] {
  const done = completed(projects);
  const total = done.reduce((a, p) => a + (p.agreedPrice || 0), 0) || 1;
  const map = new Map<string, { count: number; minutes: number; revenue: number; stones: number }>();
  for (const p of done) {
    const key = keyOf(p);
    if (!key) continue;
    const cur = map.get(key) ?? { count: 0, minutes: 0, revenue: 0, stones: 0 };
    cur.count++; cur.minutes += jobMinutes(p); cur.revenue += p.agreedPrice || 0; cur.stones += p.stoneCount || 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .filter(([, d]) => d.count >= minCount && d.minutes > 0)
    .map(([key, d]) => ({
      key, count: d.count, minutes: Math.round(d.minutes), revenue: Math.round(d.revenue), stones: d.stones,
      chfPerHour: Math.round((d.revenue / d.minutes) * 60), share: d.revenue / total,
      avgPricePerStone: d.stones > 0 ? Math.round((d.revenue / d.stones) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.chfPerHour - a.chfPerHour);
}

export const styleKey = (p: Project) => firstStyle(p.style) || undefined;
export const stoneTypeKey = (p: Project) => (p.stoneType || '').split(',')[0].trim() || undefined;
export const sizeBandKey = (p: Project): string => {
  const n = p.stoneCount || 1;
  return n <= 1 ? '1' : n <= 5 ? '2-5' : n <= 20 ? '6-20' : n <= 50 ? '21-50' : '50+';
};
export const SIZE_BAND_ORDER = ['1', '2-5', '6-20', '21-50', '50+'];

/** Price per stone needed for a segment to reach the target hourly rate. */
export const priceForTargetRate = (row: RateRow, targetRate: number) =>
  Math.round(((row.minutes / row.stones) / 60) * targetRate * 10) / 10;

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface ClientInsight extends RateRow {
  lastDate: string;
  /** Revenue of the last 90 days vs the 90 days before (ratio, 1 = flat). */
  trend: number | null;
}

export function computeClientInsights(projects: Project[], now = new Date()): ClientInsight[] {
  const rows = computeRateBy(projects, p => p.client || undefined, 1);
  const t0 = now.getTime(), d90 = 90 * 86400000;
  return rows.map(row => {
    const mine = completed(projects).filter(p => p.client === row.key);
    const recent = mine.filter(p => t0 - new Date(p.date).getTime() <= d90).reduce((a, p) => a + (p.agreedPrice || 0), 0);
    const prev = mine.filter(p => { const age = t0 - new Date(p.date).getTime(); return age > d90 && age <= 2 * d90; }).reduce((a, p) => a + (p.agreedPrice || 0), 0);
    return {
      ...row,
      lastDate: mine.reduce((m, p) => (p.date > m ? p.date : m), ''),
      trend: prev > 0 ? recent / prev : recent > 0 ? Infinity : null,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

/** Overall effective hourly rate of completed work. */
export function overallRate(projects: Project[]): number {
  const done = completed(projects);
  const minutes = done.reduce((a, p) => a + jobMinutes(p), 0);
  const revenue = done.reduce((a, p) => a + (p.agreedPrice || 0), 0);
  return minutes > 0 ? Math.round((revenue / minutes) * 60) : 0;
}

/** Hint when an order's agreed price sits below the experience of similar orders or the target rate. */
export function priceHint(projects: Project[], p: Project, targetRate: number): { kind: 'similar'; price: number; rate: number } | { kind: 'target'; rate: number } | null {
  if (!p.agreedPrice || p.status === 'Completed') return null;
  const similar = predictPerStone(projects.filter(x => x.id !== p.id), p.sheetType, { style: p.style, stoneType: p.stoneType, material: p.material, shape: p.shape });
  if (similar?.pricePerStone && similar.matched.length > 0) {
    const expected = Math.round(similar.pricePerStone.median * Math.max(1, p.stoneCount || 1));
    if (p.agreedPrice < expected * 0.9) return { kind: 'similar', price: expected, rate: similar.chfPerHour ?? 0 };
  }
  const minutes = p.totalTime || 0;
  if (minutes > 0) {
    const rate = Math.round(p.agreedPrice / (minutes / 60));
    if (rate < targetRate * 0.85) return { kind: 'target', rate };
  }
  return null;
}
