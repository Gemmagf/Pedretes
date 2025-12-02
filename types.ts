
export interface Project {
  id: string;
  projectName: string;
  client: string;
  date: string; // Creation/Start Date ISO String
  deadline?: string; // Target Delivery Date
  status: 'Pending' | 'In Progress' | 'Completed';
  sheetType: 'Alliance' | 'Fassung' | 'Pave';
  assignedTo?: string; // User ID
  
  // Common numeric fields
  stoneCount?: number;
  timePerStone?: number; // Minutes (Estimated)
  totalTime?: number; // Minutes (Estimated Total)
  actualTime?: number; // Minutes (Logged)
  
  pricePerStone?: number; // CHF (Base)
  agreedPrice?: number; // CHF (Final Price for Client)
  
  goldWeight?: number; // Grams
  
  // Specific fields
  stoneSize?: number;
  stoneType?: string;
  material?: string;
  style?: string;
  shape?: string;
  layout?: string;
  fixation?: string;
  
  // UI helpers
  color?: string;
}

export interface User {
  id: string;
  name: string;
  baseHours: number;
  extraHours: number;
}

export interface ChartData {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  revenue: number;
}
