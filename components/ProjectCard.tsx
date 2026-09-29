import React from 'react';
import { CalendarDays, Clock, Gem, FileDown, User as UserIcon } from 'lucide-react';
import type { Project } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { exportProjectQuote } from '../utils/pdfExport';
import { fmtDate, fmtMinutes, fmtNumber } from '../utils/format';
import { TYPE_LABEL } from '../utils/projectTypes';
import { StatusBadge } from './ui';

const TYPE_ACCENT: Record<Project['sheetType'], string> = { Alliance: 'bg-copper-500', Fassung: 'bg-gold-400', Pave: 'bg-rosegold-500' };

const ProjectCard: React.FC<{ project: Project; assignedName?: string; workshopName?: string; onClick?: () => void }> = ({ project, assignedName, workshopName, onClick }) => {
  const { t, locale } = useTranslation();
  const meta = [
    project.totalTime ? { icon: <Clock className="h-3.5 w-3.5" />, text: fmtMinutes(project.actualTime && project.actualTime > 0 ? project.actualTime : project.totalTime) } : null,
    project.stoneCount ? { icon: <Gem className="h-3.5 w-3.5" />, text: `${project.stoneCount} ${project.stoneType ?? ''}`.trim() } : null,
    { icon: <CalendarDays className="h-3.5 w-3.5" />, text: project.deadline ? fmtDate(project.deadline, locale, { day: '2-digit', month: 'short' }) : fmtDate(project.date, locale, { day: '2-digit', month: 'short' }) },
    assignedName ? { icon: <UserIcon className="h-3.5 w-3.5" />, text: assignedName } : null,
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden p-4">
      <span className={`absolute inset-y-0 left-0 w-1 ${TYPE_ACCENT[project.sheetType]}`} />
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0">
          <p className="kicker">{TYPE_LABEL[project.sheetType]}</p>
          <h3 className="mt-0.5 truncate font-serif text-base font-semibold text-ink-900">{project.projectName}</h3>
          <p className="truncate text-sm text-ink-500">{project.client}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
        {meta.map((m, i) => <span key={i} className="inline-flex items-center gap-1">{m.icon}{m.text}</span>)}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <span className="font-serif text-lg font-semibold text-copper-600">{project.agreedPrice ? `${fmtNumber(project.agreedPrice)} CHF` : '—'}</span>
        <div className="flex gap-1">
          {onClick && <button onClick={onClick} className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-cream-100 hover:text-ink-900">{t('edit')}</button>}
          <button onClick={() => exportProjectQuote(project, workshopName)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-copper-600 hover:bg-gold-50" title={t('pdfQuote')}>
            <FileDown className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
