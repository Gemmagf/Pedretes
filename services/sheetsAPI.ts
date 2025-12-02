
import { Project } from '../types';

// Mock Data based on the prompt
const mockData: Project[] = [
  // PAVE DATA
  {
    id: 'p1',
    sheetType: 'Pave',
    date: '2025-10-28',
    deadline: '2025-11-05',
    projectName: 'Pomona Ring midi',
    stoneType: 'weiße Diamanten',
    material: 'WG + GG + Roségold',
    style: 'wildes Pavé, Honeycomb',
    layout: 'nicht vorhanden',
    fixation: 'einfache Fixierung',
    pricePerStone: 17,
    agreedPrice: 2500,
    totalTime: 1165,
    actualTime: 500,
    goldWeight: 3,
    client: 'Ann Perica',
    stoneCount: 148,
    status: 'In Progress',
    assignedTo: '1'
  },
  {
    id: 'p2',
    sheetType: 'Pave',
    date: '2025-08-15',
    deadline: '2025-08-30',
    projectName: 'Ornamentina nur Pavé für Mandaringranat',
    stoneType: 'weiße Diamanten',
    material: 'WG + GG + Roségold',
    style: 'Fadenpavé',
    layout: 'nicht vorhanden',
    fixation: 'einfache Fixierung',
    pricePerStone: 17,
    agreedPrice: 1500,
    totalTime: 300,
    actualTime: 300,
    goldWeight: 0.3,
    client: 'Beyer',
    stoneCount: 28,
    status: 'Completed',
    assignedTo: '2'
  },
  {
    id: 'p3',
    sheetType: 'Pave',
    date: '2025-09-01',
    deadline: '2025-09-20',
    projectName: 'Vintage Sapphire Restauration',
    stoneType: 'Saphir',
    material: 'Platin',
    style: 'Castle',
    pricePerStone: 25,
    agreedPrice: 3200,
    totalTime: 1500,
    actualTime: 1500,
    client: 'Lohri',
    stoneCount: 50,
    status: 'Completed',
    assignedTo: '1'
  },
  // FASSUNG DATA
  {
    id: 'f1',
    sheetType: 'Fassung',
    date: '2025-10-28',
    deadline: '2025-11-10',
    projectName: 'Pomona Ring bold',
    shape: 'Tropfen',
    material: 'WG + GG + Roségold',
    style: 'runde Griffe',
    totalTime: 120,
    actualTime: 0,
    pricePerStone: 70,
    agreedPrice: 1500,
    goldWeight: 0.1,
    client: 'Ann Perica',
    status: 'Pending',
    assignedTo: '3'
  },
  // ALLIANCE DATA
  {
    id: 'a1',
    sheetType: 'Alliance',
    date: '2025-10-23',
    deadline: '2025-11-15',
    projectName: 'Alliance Champagnerfarbige Diamanten',
    stoneSize: 4.1,
    stoneType: 'Korund + farbige Diamanten',
    material: 'Rotgold',
    style: 'Fishtail',
    shape: 'eckig',
    totalTime: 778,
    actualTime: 100,
    pricePerStone: 59,
    agreedPrice: 950,
    goldWeight: 5.2,
    client: 'Beyer',
    stoneCount: 16,
    status: 'In Progress',
    assignedTo: '1'
  },
   {
    id: 'a2',
    sheetType: 'Alliance',
    date: '2025-11-01',
    deadline: '2025-11-20',
    projectName: 'Turmalin-Tsavo Ring',
    stoneSize: 2,
    stoneType: 'empfindliche Steine',
    material: 'WG + GG + Roségold',
    style: 'Arkaden',
    shape: 'rund',
    totalTime: 288,
    actualTime: 0,
    pricePerStone: 24,
    agreedPrice: 800,
    goldWeight: 0.5,
    client: 'Beyer',
    stoneCount: 20,
    status: 'Pending',
    assignedTo: '2'
  },
  {
    id: 'a3',
    sheetType: 'Alliance',
    date: '2025-07-10',
    deadline: '2025-07-25',
    projectName: 'Summer Collection Set',
    stoneSize: 3,
    stoneType: 'Diamonds',
    material: 'Gold',
    totalTime: 600,
    actualTime: 600,
    pricePerStone: 50,
    agreedPrice: 4500,
    client: 'Meister',
    stoneCount: 30,
    status: 'Completed',
    assignedTo: '3'
  }
];

let runtimeData = [...mockData];

export const getSheetData = async (sheetName: string): Promise<Project[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  if (sheetName === 'All') return runtimeData;
  
  const typeMap: Record<string, string> = {
    'Alliance_Form': 'Alliance',
    'Fassung_Form': 'Fassung',
    'Pave_Form': 'Pave'
  };
  
  const targetType = typeMap[sheetName] || sheetName;
  return runtimeData.filter(p => p.sheetType === targetType);
};

export const addRow = async (sheetName: string, data: any): Promise<{ status: string; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const typeMap: Record<string, 'Alliance' | 'Fassung' | 'Pave'> = {
    'Alliance_Form': 'Alliance',
    'Fassung_Form': 'Fassung',
    'Pave_Form': 'Pave'
  };

  const newProject: Project = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    sheetType: typeMap[sheetName] || 'Alliance',
    date: data.date || new Date().toISOString().split('T')[0],
    status: 'Pending'
  };

  runtimeData.unshift(newProject);
  return { status: 'success', message: 'Row added successfully' };
};

export const updateRow = async (project: Project): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  runtimeData = runtimeData.map(p => p.id === project.id ? project : p);
};
