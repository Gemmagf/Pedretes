// sheetsAPI.ts
import axios from 'axios';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzmfymZKEtSRgB9QisNBOIHvzeA8VhD1fL7Xwcm5augumyIBKAeWdoMyqIFjS0unEY64Q/exec';

// --- MAPPINGS DE LES FULLES ---
const sheetMappings = {
  "Pave_Form": {
    stoneType: "Steinart",
    material: "Material",
    pavéTyp: "Stil (Pavé-Typ)",
    layout: "Layout",
    fixierung: "Fixierung",
    pricePerStone: "Preis pro Stein (chf), Zahl eingeben",
    timePerStone: "total Zeit (Minuten), Zahl eingeben in minuten",
    goldBack: "Gold zurück (Gramm), Zahl eingeben in gramm",
    clientName: "Kunde",
    date: "Date",
    numStones: "Anzahl Steine",
    status: "Status",
    projectName: "Projekte Name",
  },
  "Alliance_Form": {
    stoneType: "Steingröße (mm), Zahl eingeben in mm",
    stoneArt: "Steinart",
    material: "Material",
    style: "Stil",
    shape: "Form",
    timePerStone: "total Zeit (Minuten) Zahl eingeben in minuten",
    pricePerStone: "Preis pro Stein (CHF) Zahl eingeben",
    goldBack: "Gold zurück (Gramm) Zahl eingeben in gramm",
    clientName: "Kunde",
    date: "Date",
    numStones: "Anzahl Steine",
    status: "Status",
    projectName: "Projekte Name",
  },
  "Fassung_Form": {
    stoneForm: "Steinform",
    material: "Material",
    style: "Stil",
    timePerStone: "total Zeit (Minuten), Zahl eingeben in minuten",
    pricePerStone: "Preis pro Stein (chf), Zahl eingeben in chf",
    goldBack: "Gold zurück (Gramm), Zahl eingeben in gramm",
    clientName: "Kunde",
    date: "Date",
    numStones: "Anzahl Steine",
    stoneType: "Steinart",
    status: "Status",
    projectName: "Projekte Name",
  },
};

export interface Project {
  id?: string;
  sheet?: keyof typeof sheetMappings;
  [key: string]: any;
}

// --- UTIL: Map de dades locals a fulla ---
const mapToSheetFields = (sheet: keyof typeof sheetMappings, data: Project) => {
  const mapping = sheetMappings[sheet];
  const mapped: Record<string, any> = { sheet }; // sempre incloure sheet
  for (const key in mapping) {
    if (data[key] !== undefined) mapped[key] = data[key];
  }
  if (data.id) mapped.id = data.id; // mantenir ID si existeix
  return mapped;
};

// --- GET DATA ---
export const getSheetData = async (sheet: keyof typeof sheetMappings): Promise<Project[]> => {
  try {
    const resp = await axios.get(BASE_URL, { params: { sheet } });
    const data: any[] = resp.data || [];

    const mapping = sheetMappings[sheet];
    const inverseMapping: Record<string, string> = {};
    for (const key in mapping) {
      inverseMapping[mapping[key]] = key;
    }

    return data.map(row => {
      const mappedRow: Project = { sheet };
      for (const col in row) {
        const localKey = inverseMapping[col];
        if (localKey) mappedRow[localKey] = row[col];
      }
      if (row.ID) mappedRow.id = row.ID;
      return mappedRow;
    });
  } catch (err) {
    console.error('Error fetching sheet data:', err);
    return [];
  }
};

// --- ADD ROW ---
export const addRow = async (sheet: keyof typeof sheetMappings, rowData: Project) => {
  try {
    const payload = mapToSheetFields(sheet, rowData);
    const resp = await axios.post(BASE_URL, payload);
    return resp.data;
  } catch (err) {
    console.error('Error adding row:', err);
    throw err;
  }
};

// --- UPDATE ROW ---
export const updateRow = async (sheet: keyof typeof sheetMappings, rowData: Project) => {
  if (!rowData.id) throw new Error('ID is required for update');
  try {
    const payload = mapToSheetFields(sheet, rowData);
    const resp = await axios.post(BASE_URL, payload);
    return resp.data;
  } catch (err) {
    console.error('Error updating row:', err);
    throw err;
  }
};