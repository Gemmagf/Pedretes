import type { Project, User } from '../types';
import saretaProjects from '../data/sareta-projects.json';

/**
 * Seed of the local account: the atelier's real order history, imported from the
 * "Formular Sareta" Google Sheet with scripts/import_sheet.py (305 orders since July 2025).
 */
export function seedLocalData(): { projects: Project[]; users: User[] } {
  const users: User[] = [
    { id: 'user-sara', name: 'Sara', baseHours: 40, extraHours: 0, workingDays: [1, 2, 3, 4, 5], daysOff: [] },
    { id: 'user-valentin', name: 'Valentin', baseHours: 32, extraHours: 0, workingDays: [1, 2, 3, 4], daysOff: [] },
  ];
  const projects = (saretaProjects as Project[]).map(p => ({ ...p }));
  return { projects, users };
}
