import React from 'react';
import { Project } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Calendar, Clock, Tag, FileDown } from 'lucide-react';
import { exportProjectQuote } from '../utils/pdfExport';

interface ProjectCardProps {
  project: Project;
  color?: string;
  key?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, color }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
      style={{ borderLeft: `4px solid ${color || '#fbbf24'}` }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{project.sheetType}</span>
            <h3 className="text-lg font-serif font-semibold text-gray-800 leading-tight truncate">{project.projectName}</h3>
            <p className="text-sm text-gray-500">{project.client}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(project.status)}`}>
            {t(project.status?.toLowerCase().replace(' ', '_') || 'pending')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
          {project.totalTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{Math.round(project.totalTime)} min</span>
            </div>
          )}

          {(project.agreedPrice || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-medium text-sm">CHF</span>
              <span>{project.agreedPrice?.toLocaleString('de-CH')}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{new Date(project.date).toLocaleDateString('de-CH')}</span>
          </div>

          {project.stoneCount && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>{project.stoneCount} Stk.</span>
            </div>
          )}
        </div>

        {/* Export button */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => exportProjectQuote(project)}
            className="flex items-center gap-2 text-xs font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors w-full justify-center border border-amber-200 hover:border-amber-400"
          >
            <FileDown className="w-3.5 h-3.5" />
            Offerte exportieren (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
