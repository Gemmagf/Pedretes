
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

// URL OF YOUR WEB APP (NEW DEPLOY)
const API_URL = "https://script.google.com/macros/s/AKfycby4-Ev-kQPuQqPBmrhr3rrGzJEioBOBakestRbU2kfFAtyjG0dV0trPjnk_gMYcDW0aeA/exec";

// Map sheet names used by UI → real sheets in Google Sheets
const sheetMap: Record<string, string> = {
  All: "All",
  Alliance_Form: "Alliance",
  Fassung_Form: "Fassung",
  Pave_Form: "Pave"
};

export const getSheetData = async (sheetName: string): Promise<Project[]> => {
  const targetSheet = sheetMap[sheetName] || sheetName;

  try {
    const url = `${API_URL}?sheet=${encodeURIComponent(targetSheet)}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("HTTP error: " + response.status);

    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Bad API response");

    // Update runtimeData only for that sheet type
    runtimeData = runtimeData.filter(p => p.sheetType !== targetSheet);
    const converted = data.map(d => ({
      ...d,
      sheetType: targetSheet
    }));

    runtimeData = [...converted, ...runtimeData];

    return converted;

  } catch (err) {
    console.warn("⚠️ API FAILED → USING MOCK DATA", err);

    if (sheetName === "All") return runtimeData;

    return runtimeData.filter(p => p.sheetType === targetSheet);
  }
};

export const addRow = async (sheetName: string, data: any) => {
  const targetSheet = sheetMap[sheetName] || sheetName;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ sheet: targetSheet, ...data }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await response.json();

    if (res.status !== "success") throw new Error(res.message);

  } catch (err) {
    console.warn("⚠️ ADD FAILED → ADDING TO MOCK", err);
  }

  // ALWAYS update local runtime data so app continues working
  const newProject: Project = {
    ...data,
    id: Math.random().toString(36).slice(2),
    sheetType: targetSheet,
    status: "Pending",
    date: data.date || new Date().toISOString().split("T")[0]
  };

  runtimeData.unshift(newProject);

  return { status: "success", message: "Row added (API or fallback)" };
};

export const updateRow = async (project: Project) => {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ sheet: project.sheetType, ...project }),
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.warn("⚠️ UPDATE FAILED → USING LOCAL ONLY");
  }

  runtimeData = runtimeData.map(p => (p.id === project.id ? project : p));
};