import React from 'react';
import { Project } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Calendar, Clock, DollarSign, Tag } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  color?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, color }) => {
  const { t } = useTranslation();

  // Helper to determine status color
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
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{project.sheetType}</span>
            <h3 className="text-lg font-serif font-semibold text-gray-800 leading-tight">{project.projectName}</h3>
            <p className="text-sm text-gray-500">{project.client}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
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
          
          {(project.pricePerStone || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>{project.pricePerStone} CHF</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{new Date(project.date).toLocaleDateString()}</span>
          </div>

          {project.stoneCount && (
             <div className="flex items-center gap-1.5">
             <Tag className="w-4 h-4 text-purple-400" />
             <span>{project.stoneCount} stones</span>
           </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;