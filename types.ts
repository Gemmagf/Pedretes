export type ProjectType = 'Alliance' | 'Fassung' | 'Pave';
export type ProjectStatus = 'Pending' | 'In Progress' | 'Completed';

export const PROJECT_TYPES: ProjectType[] = ['Alliance', 'Fassung', 'Pave'];
export const PROJECT_STATUSES: ProjectStatus[] = ['Pending', 'In Progress', 'Completed'];

export interface Project {
  id: string;
  projectName: string;
  client: string;
  date: string;          // ISO date-time of creation / start
  deadline?: string;     // "YYYY-MM-DD"
  status: ProjectStatus;
  sheetType: ProjectType;
  assignedTo?: string;   // User id

  stoneCount?: number;
  timePerStone?: number; // minutes
  totalTime?: number;    // estimated minutes
  actualTime?: number;   // tracked minutes
  timerStartedAt?: string; // ISO timestamp while a timer is running

  pricePerStone?: number;
  agreedPrice?: number;  // CHF
  goldWeight?: number;   // grams
  stoneSize?: number;    // mm
  stoneType?: string;
  material?: string;
  style?: string;
  shape?: string;
  layout?: string;
  fixation?: string;

  color?: string; // UI helper, never persisted
}

export interface User {
  id: string;
  name: string;
  baseHours: number;     // hours per week
  extraHours: number;
  workingDays: number[]; // 0=Sun … 6=Sat
  daysOff: string[];     // "YYYY-MM-DD"
}

export interface PredictionData {
  count: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  avgPrice: number | null;
}
