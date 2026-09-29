import type { Project, ProjectStatus, ProjectType, User } from '../types';
import { CLIENTS } from './constants';
import { OPTIONS } from './projectTypes';
import { createRandom } from './random';
import { toISODate } from './format';

const NAMES: Record<ProjectType, string[]> = {
  Alliance: ['Alliance 2 mm Brillant', 'Memoire-Ring Halbrund', 'Alliance Fadenpavé 1.5 mm', 'Ehering Kanalfassung', 'Alliance Fishtail 3 mm', 'Memoire Vollreihe', 'Alliance Rotgold eckig', 'Alliance Platin Arkaden'],
  Fassung: ['Solitär 1.2 ct Brillant', 'Saphir oval Halo', 'Anhänger Smaragd Cushion', 'Ohrstecker Diamant rund', 'Rubin Marquise Vintage', 'Verlobungsring Princess', 'Collier Tropfen Pear', 'Ring Micro-Pavé Halo'],
  Pave: ['Pavé-Ring Halbmemoire', 'Pavé Anhänger Kreis', 'Pavé-Schiene Lineal', 'Creolen wildes Pavé', 'Pavé Freiform Brosche', 'Armband Rechteck Pavé', 'Pavé Kanalfassung Ring', 'Pavé Oval Anhänger'],
};

const STATUS_FOR = (daysOld: number, r: ReturnType<typeof createRandom>): ProjectStatus => {
  if (daysOld > 45) return r.chance(0.94) ? 'Completed' : 'In Progress';
  if (daysOld > 10) return r.pick(['Completed', 'Completed', 'Completed', 'In Progress', 'In Progress', 'Pending']);
  return r.pick(['Pending', 'Pending', 'In Progress']);
};

/**
 * Realistic sample data for the local account: a stone-setting atelier in Zürich
 * with two jewellers and ~14 months of history.
 */
export function seedLocalData(): { projects: Project[]; users: User[] } {
  const r = createRandom(20260401);
  const users: User[] = [
    { id: 'user-sara', name: 'Sara', baseHours: 40, extraHours: 0, workingDays: [1, 2, 3, 4, 5], daysOff: [] },
    { id: 'user-valentin', name: 'Valentin', baseHours: 32, extraHours: 0, workingDays: [1, 2, 3, 4], daysOff: [] },
  ];

  const projects: Project[] = [];
  const now = new Date();
  const types: ProjectType[] = ['Alliance', 'Fassung', 'Pave'];

  for (let i = 0; i < 54; i++) {
    const type = types[i % 3];
    const daysOld = i < 6 ? r.int(0, 10) : r.int(0, 420);
    const created = new Date(now); created.setDate(created.getDate() - daysOld); created.setHours(r.int(8, 17), r.int(0, 59), 0, 0);
    const status = STATUS_FOR(daysOld, r);
    const stoneCount = type === 'Fassung' ? r.int(1, 4) : r.int(8, 60);
    const timePerStone = type === 'Alliance' ? r.int(4, 12) : undefined;
    const totalTime = type === 'Alliance' ? stoneCount * timePerStone! : type === 'Fassung' ? r.int(45, 240) : r.int(120, 600);
    const actualTime = status === 'Completed' ? Math.round(totalTime * (0.8 + r.next() * 0.45))
      : status === 'In Progress' ? Math.round(totalTime * r.next() * 0.7) : 0;
    const pricePerStone = type === 'Pave' ? r.int(9, 22) : type === 'Alliance' ? r.int(6, 14) : r.int(40, 160);
    const base = type === 'Pave' ? stoneCount * pricePerStone : (totalTime / 60) * (type === 'Fassung' ? 140 : 120) + stoneCount * pricePerStone * 0.4;
    const agreedPrice = Math.round(base * (0.95 + r.next() * 0.35) / 5) * 5;
    const deadline = new Date(created); deadline.setDate(deadline.getDate() + r.int(7, 35));
    const assignedTo = r.chance(0.6) ? users[0].id : users[1].id;

    const common = {
      id: `local-${i + 1}`,
      projectName: NAMES[type][i % NAMES[type].length] + (i >= 24 ? ` ${Math.floor(i / 24) + 1}` : ''),
      client: r.pick(CLIENTS),
      date: created.toISOString(),
      deadline: toISODate(deadline),
      status,
      sheetType: type,
      assignedTo,
      stoneCount,
      totalTime,
      actualTime,
      pricePerStone,
      agreedPrice,
      goldWeight: Math.round((0.6 + r.next() * 5) * 10) / 10,
    };

    if (type === 'Alliance') {
      projects.push({ ...common, timePerStone, stoneSize: Math.round((1 + r.next() * 1.8) * 10) / 10,
        stoneType: r.pick(OPTIONS.allianceStoneTypes), material: r.pick(OPTIONS.allianceMaterials), style: r.pick(OPTIONS.allianceStyles), shape: r.pick(OPTIONS.allianceShapes) });
    } else if (type === 'Fassung') {
      projects.push({ ...common, stoneSize: Math.round((3 + r.next() * 6) * 10) / 10,
        stoneType: r.pick(OPTIONS.fassungStoneTypes), material: r.pick(OPTIONS.fassungMaterials), style: r.pick(OPTIONS.fassungStyles), shape: r.pick(OPTIONS.fassungShapes) });
    } else {
      projects.push({ ...common, stoneSize: Math.round((0.8 + r.next() * 1.2) * 10) / 10,
        stoneType: r.pick(OPTIONS.allianceStoneTypes), material: r.pick(OPTIONS.allianceMaterials), style: r.pick(OPTIONS.paveStyles), layout: r.pick(OPTIONS.paveLayouts), fixation: r.pick(OPTIONS.paveFixations) });
    }
  }

  projects.sort((a, b) => b.date.localeCompare(a.date));
  return { projects, users };
}
