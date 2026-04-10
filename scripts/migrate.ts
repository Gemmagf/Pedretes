import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://sinomclhlaqwahtidetp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbm9tY2xobGFxd2FodGlkZXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzUyMjYsImV4cCI6MjA5MTQxMTIyNn0.uO8o-YCs_CYh9ezR4GxamScEdHQSgjwMmhppBWLKQB4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parses "DD/MM/YYYY" or "DD/MM/YYYY HH:MM:SS" → "YYYY-MM-DD"
const parseDate = (raw: string): string | null => {
  if (!raw?.trim()) return null;
  const part = raw.trim().split(' ')[0]; // take date part only
  const [d, m, y] = part.split('/');
  if (!d || !m || !y) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const parseNum = (raw: string): number | null => {
  const n = parseFloat(raw?.replace(',', '.') || '');
  return isNaN(n) ? null : n;
};

const parseStatus = (raw: string): 'Pending' | 'In Progress' | 'Completed' => {
  const s = raw?.trim().toLowerCase();
  if (s === 'completed') return 'Completed';
  if (s === 'in progress') return 'In Progress';
  return 'Pending';
};

// Simple CSV parser that handles quoted fields with commas inside
const parseCSV = (content: string): string[][] => {
  const lines = content.trim().split('\n');
  return lines.map(line => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  });
};

// --- PAVE ---
const migratePave = async (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  const [, ...data] = rows; // skip header

  const projects = data.map((r, i) => {
    const name = r[1]?.trim() || `Pavé Project ${i + 1}`;
    return {
      project_name: name,
      stone_type: r[2] || null,
      material: r[3] || null,
      style: r[4] || null,
      layout: r[5] || null,
      fixation: r[6] || null,
      price_per_stone: parseNum(r[7]),
      total_time: parseNum(r[8]),
      gold_weight: parseNum(r[9]),
      client: r[10] || null,
      date: parseDate(r[11]) || parseDate(r[0]) || new Date().toISOString().split('T')[0],
      stone_count: parseNum(r[12]) ? Math.round(parseNum(r[12])!) : null,
      status: parseStatus(r[13]),
      project_type: 'Pave',
      actual_time: 0,
    };
  }).filter(p => p.project_name);

  console.log(`Inserting ${projects.length} Pavé projects...`);
  const { error } = await supabase.from('projects').insert(projects);
  if (error) console.error('Pave error:', error.message);
  else console.log('✓ Pavé done');
};

// --- ALLIANCE ---
const migrateAlliance = async (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  const [header, ...data] = rows;
  console.log('Alliance headers:', header);

  // Columns (adapt if needed after seeing header):
  // Marca de temps | Projekte Name | Steingröße | Steinart | Material | Stil | Form | total Zeit | Preis pro Stein | Gold zurück | Kunde | Date | Anzahl Steine | Status
  const projects = data.map((r, i) => ({
    project_name: r[1]?.trim() || `Alliance Project ${i + 1}`,
    stone_size: parseNum(r[2]),
    stone_type: r[3] || null,
    material: r[4] || null,
    style: r[5]?.replace(/\n/g, '').trim() || null,
    shape: r[6]?.replace(/\n/g, '').trim() || null,
    total_time: parseNum(r[7]),
    price_per_stone: parseNum(r[8]),
    gold_weight: parseNum(r[9]),
    client: r[10] || null,
    date: parseDate(r[11]) || parseDate(r[0]) || new Date().toISOString().split('T')[0],
    stone_count: parseNum(r[12]) ? Math.round(parseNum(r[12])!) : null,
    status: parseStatus(r[13]),
    project_type: 'Alliance',
    actual_time: 0,
  })).filter(p => p.project_name);

  console.log(`Inserting ${projects.length} Alliance projects...`);
  const { error } = await supabase.from('projects').insert(projects);
  if (error) console.error('Alliance error:', error.message);
  else console.log('✓ Alliance done');
};

// --- FASSUNG ---
const migrateFassung = async (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  const [header, ...data] = rows;
  console.log('Fassung headers:', header);

  // Columns: Marca de temps | Projekte Name | Steinform | Material | Stil | total Zeit | Preis pro Stein | Gold zurück | Kunde | Date | Anzahl Steine | Steinart | Status
  const projects = data.map((r, i) => ({
    project_name: r[1]?.trim() || `Fassung Project ${i + 1}`,
    shape: r[2] || null,
    material: r[3] || null,
    style: r[4] || null,
    total_time: parseNum(r[5]),
    price_per_stone: parseNum(r[6]),
    gold_weight: parseNum(r[7]),
    client: r[8] || null,
    date: parseDate(r[9]) || parseDate(r[0]) || new Date().toISOString().split('T')[0],
    stone_count: parseNum(r[10]) ? Math.round(parseNum(r[10])!) : null,
    stone_type: r[11] || null,
    status: parseStatus(r[12]),
    project_type: 'Fassung',
    actual_time: 0,
  })).filter(p => p.project_name);

  console.log(`Inserting ${projects.length} Fassung projects...`);
  const { error } = await supabase.from('projects').insert(projects);
  if (error) console.error('Fassung error:', error.message);
  else console.log('✓ Fassung done');
};

// --- MAIN ---
const run = async () => {
  const downloadsDir = path.join(process.env.HOME || '', 'Downloads');

  const paveFile = path.join(downloadsDir, 'Formular Sareta - Pave_Form.csv');
  const allianceFile = path.join(downloadsDir, 'Formular Sareta - Alliance_Form.csv');
  const fassungFile = path.join(downloadsDir, 'Formular Sareta - Fassung_Form.csv');

  if (fs.existsSync(paveFile)) await migratePave(paveFile);
  else console.log('⚠ No Pave CSV found');

  if (fs.existsSync(allianceFile)) await migrateAlliance(allianceFile);
  else console.log('⚠ No Alliance CSV found (descarrega\'l de Google Sheets)');

  if (fs.existsSync(fassungFile)) await migrateFassung(fassungFile);
  else console.log('⚠ No Fassung CSV found (descarrega\'l de Google Sheets)');
};

run();
