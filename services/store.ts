import type { Project, User } from '../types';

export interface DataSnapshot {
  version: 1;
  exportedAt?: string;
  projects: Project[];
  users: User[];
}

export type StoreKind = 'supabase' | 'local' | 'demo';

/** Unified data access. Every backend (Supabase, browser storage, demo memory) implements this. */
export interface Store {
  readonly kind: StoreKind;
  listProjects(): Promise<Project[]>;
  addProject(p: Omit<Project, 'id'>): Promise<Project | null>;
  updateProject(p: Project): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
  listUsers(): Promise<User[]>;
  addUser(name: string): Promise<User | null>;
  updateUser(id: string, patch: Partial<User>): Promise<User | null>;
  /** Notifies when data changed so every view can refresh. */
  subscribe(listener: () => void): () => void;
  /** Only for browser-backed stores. */
  exportSnapshot?(): DataSnapshot;
  importSnapshot?(snapshot: DataSnapshot): void;
  reset?(): void;
}

export class Emitter {
  private listeners = new Set<() => void>();
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  emit() { for (const l of [...this.listeners]) l(); }
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const stripUi = (p: Project): Project => {
  const { color: _color, ...rest } = p;
  return rest;
};

/**
 * In-memory store, optionally persisted to localStorage.
 * Used for the local account (persisted) and the demo (ephemeral).
 */
export function createMemoryStore(opts: {
  kind: 'local' | 'demo';
  seed: () => { projects: Project[]; users: User[] };
  persistKey?: string;
}): Store {
  const emitter = new Emitter();
  let data: { projects: Project[]; users: User[] } | null = null;

  const load = () => {
    if (data) return data;
    if (opts.persistKey) {
      try {
        const raw = localStorage.getItem(opts.persistKey);
        if (raw) {
          const parsed = JSON.parse(raw) as DataSnapshot;
          if (Array.isArray(parsed.projects) && Array.isArray(parsed.users)) {
            data = { projects: parsed.projects, users: parsed.users };
            return data;
          }
        }
      } catch { /* corrupted storage → reseed */ }
    }
    data = opts.seed();
    persist();
    return data;
  };

  const persist = () => {
    if (!opts.persistKey || !data) return;
    try {
      const snapshot: DataSnapshot = { version: 1, projects: data.projects.map(stripUi), users: data.users };
      localStorage.setItem(opts.persistKey, JSON.stringify(snapshot));
    } catch { /* quota or private mode */ }
  };

  const commit = () => { persist(); emitter.emit(); };

  return {
    kind: opts.kind,
    async listProjects() { return load().projects.map(p => ({ ...p })); },
    async addProject(p) {
      const project: Project = { ...stripUi(p as Project), id: newId(opts.kind) };
      load().projects = [project, ...load().projects];
      commit();
      return project;
    },
    async updateProject(p) {
      const d = load();
      const idx = d.projects.findIndex(x => x.id === p.id);
      if (idx === -1) return null;
      d.projects[idx] = stripUi(p);
      commit();
      return { ...d.projects[idx] };
    },
    async deleteProject(id) {
      const d = load();
      const before = d.projects.length;
      d.projects = d.projects.filter(p => p.id !== id);
      if (d.projects.length === before) return false;
      commit();
      return true;
    },
    async listUsers() { return load().users.map(u => ({ ...u })); },
    async addUser(name) {
      const user: User = { id: newId('user'), name, baseHours: 40, extraHours: 0, workingDays: [1, 2, 3, 4, 5], daysOff: [] };
      load().users = [...load().users, user];
      commit();
      return user;
    },
    async updateUser(id, patch) {
      const d = load();
      const idx = d.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      d.users[idx] = { ...d.users[idx], ...patch };
      commit();
      return { ...d.users[idx] };
    },
    subscribe: l => emitter.subscribe(l),
    exportSnapshot() {
      const d = load();
      return { version: 1, exportedAt: new Date().toISOString(), projects: d.projects.map(stripUi), users: d.users };
    },
    importSnapshot(snapshot) {
      if (!Array.isArray(snapshot.projects) || !Array.isArray(snapshot.users)) throw new Error('Invalid snapshot');
      data = { projects: snapshot.projects, users: snapshot.users };
      commit();
    },
    reset() {
      data = opts.seed();
      commit();
    },
  };
}
