import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project, ProjectStatus, ProjectType } from '../types';
import { useData } from '../context/DataContext';

/**
 * Project data for the active backend. Re-fetches whenever the store reports a change,
 * so the dashboard, forms and analytics always agree.
 */
export function useProjects(type?: ProjectType) {
  const { store } = useData();
  const [all, setAll] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => store.listProjects().then(data => { if (active) { setAll(data); setLoading(false); } });
    setLoading(true);
    load();
    const unsubscribe = store.subscribe(load);
    return () => { active = false; unsubscribe(); };
  }, [store]);

  const projects = useMemo(() => (type ? all.filter(p => p.sheetType === type) : all), [all, type]);

  const applyLocal = useCallback((updated: Project) => {
    setAll(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
  }, []);

  const add = useCallback((p: Omit<Project, 'id'>) => store.addProject(p), [store]);

  const update = useCallback(async (p: Project) => {
    applyLocal(p); // optimistic
    return store.updateProject(p);
  }, [store, applyLocal]);

  const remove = useCallback(async (id: string) => {
    setAll(prev => prev.filter(p => p.id !== id));
    return store.deleteProject(id);
  }, [store]);

  const setStatus = useCallback((p: Project, status: ProjectStatus) => update({ ...p, status }), [update]);

  const startTimer = useCallback((p: Project) =>
    update({ ...p, timerStartedAt: new Date().toISOString(), status: p.status === 'Pending' ? 'In Progress' : p.status }), [update]);

  const stopTimer = useCallback((p: Project) => {
    if (!p.timerStartedAt) return Promise.resolve(p);
    const elapsedMin = (Date.now() - new Date(p.timerStartedAt).getTime()) / 60000;
    const actualTime = Math.round(((p.actualTime || 0) + elapsedMin) * 10) / 10;
    return update({ ...p, actualTime, timerStartedAt: undefined });
  }, [update]);

  return { projects, all, loading, add, update, remove, setStatus, startTimer, stopTimer };
}
