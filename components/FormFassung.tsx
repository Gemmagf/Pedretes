import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow, getSheetData } from '../services/sheetsAPI';
import ProjectCard from './ProjectCard';
import { Project } from '../types';

const clientsList = ['Beyer','Ann Perica','Messerer','Suenos'];
const materials = ['WG + GG + Roségold','Rotgold','Platin'];
const styles = ['runde Griffe','Geschlossen','Zargenfassung'];
const shapes = ['Tropfen','Halbmond','Sugarloaf','Rund','Oval'];

const FormFassung = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    projectName: '',
    shape: '',
    material: '',
    style: '',
    totalTime: '',
    pricePerStone: '',
    goldWeight: '',
    client: '',
  });
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    const res = await getSheetData('Fassung_Form');
    setData(res);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRow('Fassung_Form', {
      ...formData,
      totalTime: Number(formData.totalTime),
      pricePerStone: Number(formData.pricePerStone),
      goldWeight: Number(formData.goldWeight),
    });
    setFormData({ projectName: '', shape: '', material: '', style: '', totalTime: '', pricePerStone: '', goldWeight: '', client: '' });
    await refreshData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
      >
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-serif font-bold text-blue-900">{t('fassungFormTitle')}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectName')}</label>
            <input name="projectName" value={formData.projectName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required />
          </div>

          {[
            { name: 'client', label: t('client'), type: 'select', opts: clientsList },
            { name: 'shape', label: t('shape'), type: 'select', opts: shapes },
            { name: 'material', label: t('material'), type: 'select', opts: materials },
            { name: 'style', label: t('style'), type: 'select', opts: styles },
            { name: 'totalTime', label: t('totalTime'), type: 'number' },
            { name: 'pricePerStone', label: t('pricePerStone'), type: 'number' },
            { name: 'goldWeight', label: t('goldBack'), type: 'number', step: '0.1' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 outline-none" required>
                  <option value="">Select...</option>
                  {field.opts?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} step={field.step} name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required />
              )}
            </div>
          ))}

          <div className="col-span-full flex justify-end mt-4">
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium shadow-md transition-colors">
               {t('submit')}
             </button>
          </div>
        </form>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-bold text-gray-800 border-b pb-2">{t('allProjects')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div>{t('loading')}</div> : data.map(p => <ProjectCard key={p.id} project={p} color="#2563eb" />)}
        </div>
      </div>
    </div>
  );
};

export default FormFassung;