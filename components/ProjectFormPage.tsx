import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import type { Project, ProjectType } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useProjects } from '../hooks/useProjects';
import { CLIENTS } from '../utils/constants';
import { EMPTY_FORM, PROJECT_TYPE_CONFIG, TYPE_LABEL, type FieldDef, type FormValues } from '../utils/projectTypes';
import { Button, Card, EmptyState, Field, LoadingBlock } from './ui';
import SimulatorPanel from './SimulatorPanel';
import ProjectCard from './ProjectCard';

const RECENT_LIMIT = 9;

/** One page for all three order types; behaviour is driven by PROJECT_TYPE_CONFIG. */
const ProjectFormPage: React.FC<{ type: ProjectType }> = ({ type }) => {
  const config = PROJECT_TYPE_CONFIG[type];
  const { t } = useTranslation();
  const { users, userById } = useUsers();
  const { toast } = useToast();
  const { workshopName } = useData();
  const { projects: ofType, all, loading, add } = useProjects(type);

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const set = (name: keyof FormValues, v: string) => setValues(prev => ({ ...prev, [name]: v }));
  const num = (s: string) => (s === '' ? undefined : Number(s));

  const clientOptions = useMemo(() => {
    const known = new Set<string>(CLIENTS);
    for (const p of all) if (p.client) known.add(p.client);
    return [...known].sort((a, b) => a.localeCompare(b));
  }, [all]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.projectName.trim() || !values.client.trim()) { toast(t('fillRequired'), 'error'); return; }
    setSubmitting(true);
    const minutes = config.estimateMinutes(values);
    const project: Omit<Project, 'id'> = {
      projectName: values.projectName.trim(),
      client: values.client.trim(),
      sheetType: type,
      status: 'Pending',
      date: new Date().toISOString(),
      deadline: values.deadline || undefined,
      assignedTo: values.assignedTo || undefined,
      stoneType: values.stoneType || undefined,
      material: values.material || undefined,
      style: values.style || undefined,
      shape: values.shape || undefined,
      layout: values.layout || undefined,
      fixation: values.fixation || undefined,
      stoneCount: num(values.stoneCount),
      stoneSize: num(values.stoneSize),
      timePerStone: num(values.timePerStone),
      pricePerStone: num(values.pricePerStone),
      goldWeight: num(values.goldWeight),
      totalTime: minutes > 0 ? minutes : undefined,
      actualTime: 0,
      agreedPrice: num(values.agreedPrice),
    };
    const saved = await add(project);
    setSubmitting(false);
    if (!saved) { toast(t('errorGeneric'), 'error'); return; }
    toast(t('projectSaved'));
    setValues(EMPTY_FORM);
  };

  const renderField = (f: FieldDef) => {
    if (f.name === 'client') {
      return (
        <Field key={f.name} label={t(f.labelKey)}>
          <input list="client-options" className="input" value={values.client} onChange={e => set('client', e.target.value)} placeholder={t('selectPlaceholder')} required />
          <datalist id="client-options">{clientOptions.map(c => <option key={c} value={c} />)}</datalist>
        </Field>
      );
    }
    if (f.name === 'assignedTo') {
      return (
        <Field key={f.name} label={t(f.labelKey)}>
          <select className="input" value={values.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
            <option value="">{t('unassigned')}</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      );
    }
    if (f.kind === 'text') {
      const listId = `${type}-${f.name}-options`;
      return (
        <Field key={f.name} label={t(f.labelKey)}>
          <input list={listId} className="input" value={values[f.name]} onChange={e => set(f.name, e.target.value)} placeholder={t('selectPlaceholder')} />
          <datalist id={listId}>{f.options?.map(o => <option key={o} value={o} />)}</datalist>
        </Field>
      );
    }
    if (f.kind === 'select') {
      return (
        <Field key={f.name} label={t(f.labelKey)}>
          <select className="input" value={values[f.name]} onChange={e => set(f.name, e.target.value)}>
            <option value="">{t('selectPlaceholder')}</option>
            {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      );
    }
    return (
      <Field key={f.name} label={t(f.labelKey)}>
        <input type={f.kind} step={f.step} min={f.min} className="input" value={values[f.name]} onChange={e => set(f.name, e.target.value)} />
      </Field>
    );
  };

  const recent = showAll ? ofType : ofType.slice(0, RECENT_LIMIT);

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2">
          <Card title={t('details')} icon={<ClipboardList className="h-5 w-5" />} kicker={`${t('newOrder')} · ${TYPE_LABEL[type]}`}>
            <form id={`form-${type}`} onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={t('projectName')} className="md:col-span-2" hint={t('requiredHint')}>
                <input className="input" value={values.projectName} onChange={e => set('projectName', e.target.value)} required autoFocus />
              </Field>
              {config.fields.map(renderField)}

              <div className="md:col-span-2 mt-2 flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50/50 p-4 sm:flex-row sm:items-end">
                <Field label={t('finalPrice')} className="flex-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-sm font-semibold text-copper-600">CHF</span>
                    <input type="number" min={0} className="input pl-14 font-serif text-xl font-semibold" value={values.agreedPrice} onChange={e => set('agreedPrice', e.target.value)} placeholder="0" />
                  </div>
                </Field>
                <Button type="submit" size="lg" loading={submitting} icon={<Plus className="h-4 w-4" />} className="sm:w-auto">
                  {submitting ? t('submitting') : t('submit')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SimulatorPanel config={config} values={values} users={users} projects={all}
            onApply={patch => { setValues(prev => ({ ...prev, ...patch })); }} />
        </motion.div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink-900">{t('recentProjects', { type: TYPE_LABEL[type] })}</h2>
          <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">{ofType.length}</span>
          <div className="h-px flex-1 bg-cream-200" />
          {ofType.length > RECENT_LIMIT && (
            <button onClick={() => setShowAll(v => !v)} className="text-xs font-semibold text-copper-600 hover:underline">{showAll ? t('close') : t('allProjects')}</button>
          )}
        </div>
        {loading ? <LoadingBlock /> : ofType.length === 0 ? (
          <EmptyState icon={<ClipboardList className="h-6 w-6" />} title={t('noProjects')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recent.map(p => <ProjectCard key={p.id} project={p} assignedName={userById(p.assignedTo)?.name} workshopName={workshopName} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectFormPage;
