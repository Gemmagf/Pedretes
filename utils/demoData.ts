import { Project, User } from '../types';

export type CraftType = 'jewelry' | 'watchmaking' | 'ceramics' | 'leather' | 'textiles' | 'other';
export type TeamSize = 'solo' | 'small' | 'medium' | 'large';
export type MainChallenge = 'time' | 'clients' | 'costs' | 'all';

export interface DemoAnswers {
  craft: CraftType;
  teamSize: TeamSize;
  challenge: MainChallenge;
  workshopName: string;
}

const CRAFT_CONFIG: Record<CraftType, {
  label: string;
  types: ['Alliance' | 'Fassung' | 'Pave', 'Alliance' | 'Fassung' | 'Pave', 'Alliance' | 'Fassung' | 'Pave'];
  typeLabels: [string, string, string];
  projectNames: string[];
  clients: string[];
}> = {
  jewelry: {
    label: 'Schmuckatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Alliance', 'Fassung', 'Pavé'],
    projectNames: [
      'Verlobungsring Brillant', 'Ehering klassisch', 'Pavé-Ring 6er', 'Collier Solitär',
      'Armband Gold 750', 'Ohrringe Tropfen', 'Brosche Vintage', 'Ring Smaragd',
      'Alliance 2mm', 'Fassung Rundschliff', 'Pavé Halbmemoire', 'Anhänger Herz',
    ],
    clients: ['Müller AG', 'Schmid & Partner', 'Familie Brunner', 'Weber GmbH', 'Hofmann KG', 'Meier Zürich'],
  },
  watchmaking: {
    label: 'Uhrenatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Restauration', 'Revision', 'Gravur'],
    projectNames: [
      'Taschenuhr Restauration', 'Automatik Vollrevision', 'Zifferblatt Gravur',
      'Gehäuse Politur', 'Armband Anfertigung', 'Werk Überholen',
      'Vintage Rolex Revision', 'Glasersatz Saphir', 'Drücker Reparatur', 'Krone Ersetzen',
    ],
    clients: ['Antiquitäten Huber', 'Sammler Bauer', 'Museum Luzern', 'Fischer Erben', 'Keller Auktionen'],
  },
  ceramics: {
    label: 'Keramikatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Serie', 'Einzelstück', 'Installation'],
    projectNames: [
      'Kaffeeservice 6-tlg.', 'Vase Handgedreht', 'Schüssel-Set Nordic',
      'Tischservice 12-tlg.', 'Wandinstallation Blau', 'Teekanne Unikat',
      'Blumenübertopf', 'Skulptur Abstrakt', 'Tassen-Serie 24St.', 'Platzteller Restaurant',
    ],
    clients: ['Restaurant Seegarten', 'Hotel Drei Könige', 'Galerie Moderne', 'Interior Design AG', 'Boutique Zürich'],
  },
  leather: {
    label: 'Lederatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Tasche', 'Gürtel', 'Accessoire'],
    projectNames: [
      'Handtasche Milano', 'Ledergürtel klassisch', 'Portemonnaie Slim',
      'Aktenmappe Executive', 'Rucksack Vintage', 'Schlüsselanhänger Set',
      'Brieftasche XL', 'Shopper Damen', 'Hundeleine Leder', 'Notizbuchchulle',
    ],
    clients: ['Mode Boutique AG', 'Galeries Du Nord', 'Geschäfte Bahnhofstr.', 'Online-Shop CH', 'Atelier Privat'],
  },
  textiles: {
    label: 'Textilatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Haute Couture', 'Prêt-à-porter', 'Accessoire'],
    projectNames: [
      'Abendkleid Seide', 'Hochzeitskleid Maß', 'Kostüm Bühnenbild',
      'Hemd maßgeschneidert', 'Vorhang Leinen', 'Tischdecke Leinenstickerei',
      'Jacke Tweed', 'Kleid Sommerkollektion', 'Schal Kaschmir', 'Blazer Wolle',
    ],
    clients: ['Opernhaus Zürich', 'Atelier Couture', 'Bühnenbild GmbH', 'Modehaus AG', 'Privatkunden'],
  },
  other: {
    label: 'Handwerksatelier',
    types: ['Alliance', 'Fassung', 'Pave'],
    typeLabels: ['Typ A', 'Typ B', 'Typ C'],
    projectNames: [
      'Auftrag Premium', 'Projekt Spezial', 'Arbeit Klein',
      'Grossauftrag Serie', 'Reparatur Express', 'Unikat Anfertigung',
      'Kundenarbeit Standard', 'Werkstück Komplex', 'Auftrag Dringend', 'Projekt Langzeit',
    ],
    clients: ['Kunde Müller', 'Firma Schmidt', 'Atelier Huber', 'Privat Meyer', 'Unternehmen AG'],
  },
};

const TEAM_NAMES: Record<TeamSize, string[]> = {
  solo: ['Ich'],
  small: ['Sarah', 'Thomas'],
  medium: ['Sarah', 'Thomas', 'Laura', 'Marco'],
  large: ['Sarah', 'Thomas', 'Laura', 'Marco', 'Anna', 'Felix'],
};

const statuses: Array<'Pending' | 'In Progress' | 'Completed'> = ['Completed', 'Completed', 'Completed', 'In Progress', 'In Progress', 'Pending'];

function rand(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function generateDemoProjects(answers: DemoAnswers): Project[] {
  const cfg = CRAFT_CONFIG[answers.craft];
  const projects: Project[] = [];

  for (let i = 0; i < 28; i++) {
    const sheetType = cfg.types[i % 3];
    const status = statuses[i % statuses.length];
    const totalTime = rand(30, 480);
    const actualTime = status === 'Completed' ? rand(Math.round(totalTime * 0.8), Math.round(totalTime * 1.2))
                     : status === 'In Progress' ? rand(0, Math.round(totalTime * 0.6))
                     : 0;
    const agreedPrice = rand(80, 1200);
    const stoneCount = rand(4, 48);
    const daysOld = rand(5, 300);

    projects.push({
      id: `demo-${i}`,
      projectName: cfg.projectNames[i % cfg.projectNames.length] + (i >= cfg.projectNames.length ? ` ${Math.floor(i / cfg.projectNames.length) + 1}` : ''),
      client: cfg.clients[i % cfg.clients.length],
      sheetType,
      status,
      assignedTo: undefined,
      date: daysAgo(daysOld),
      deadline: status !== 'Completed' ? daysAhead(rand(3, 45)) : undefined,
      stoneCount,
      timePerStone: rand(3, 15),
      totalTime,
      actualTime,
      pricePerStone: rand(5, 40),
      agreedPrice,
      goldWeight: rand(1, 8),
      stoneSize: parseFloat((rand(10, 35) / 10).toFixed(1)),
      stoneType: pickRandom(['Brillant', 'Saphir', 'Rubin', 'Smaragd', 'Topas']),
      material: pickRandom(['Gold 750', 'Gold 585', 'Silber 925', 'Platin']),
      style: pickRandom(['Klassisch', 'Modern', 'Vintage', 'Minimalist']),
    });
  }

  return projects;
}

export function generateDemoUsers(answers: DemoAnswers): User[] {
  const names = TEAM_NAMES[answers.teamSize];
  return names.map((name, i) => ({
    id: `demo-user-${i}`,
    name,
    baseHours: 40,
    extraHours: 0,
    workingDays: [1, 2, 3, 4, 5],
    daysOff: [],
  }));
}

export function getCraftLabel(craft: CraftType): string {
  return CRAFT_CONFIG[craft].label;
}

export function getTypeLabel(craft: CraftType, index: number): string {
  return CRAFT_CONFIG[craft].typeLabels[index] ?? CRAFT_CONFIG[craft].types[index];
}
