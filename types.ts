export interface Project {
  id: string;
  projectName: string;
  client: string;
  date: string;
  deadline?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  sheetType: 'Alliance' | 'Fassung' | 'Pave';
  assignedTo?: string;

  stoneCount?: number;
  timePerStone?: number;
  totalTime?: number;
  actualTime?: number;
  timerStartedAt?: string; // ISO timestamp — timer actiu

  pricePerStone?: number;
  agreedPrice?: number;
  goldWeight?: number;
  stoneSize?: number;
  stoneType?: string;
  material?: string;
  style?: string;
  shape?: string;
  layout?: string;
  fixation?: string;

  color?: string; // UI helper
}

export interface User {
  id: string;
  name: string;
  baseHours: number;
  extraHours: number;
  workingDays: number[]; // 1=Dl, 2=Dm, 3=Dc, 4=Dj, 5=Dv, 6=Ds, 0=Dg
  daysOff: string[];     // dates ISO "YYYY-MM-DD"
}

export interface ChartData {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  revenue: number;
}

export interface PredictionData {
  count: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  avgPrice: number | null;
}
