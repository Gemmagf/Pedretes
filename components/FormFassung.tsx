import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { useUsers } from '../context/UsersContext';
import { addRow, getSheetData } from '../services/sheetsAPI';
import ProjectCard from './ProjectCard';
import { Project } from '../types';
import { Calculator, Calendar, TrendingUp, DollarSign } from 'lucide-react';

const clientsList = ['Beyer','Peclard','Lohri','Ann Perica','Messerer','Suenos','Meister'];
const stoneTypes = ['weiße Diamanten','Korund + farbige Diamanten','empfindliche Steine'];
const materials = ['WG + GG + Roségold','Rotgold','Platin'];
const styles = ['Fadenpavé','Arkaden','Fishtail','Fishtail gegenschnitt','Abgedeckt','Castel','Side by side','Kanalfassung'];
const shapes = ['eckig','rund'];

const FormFassung = () => {
  const { t } = useTranslation();
  const { users } = useUsers();
  const userOptions = users.length > 0 ? users : [{ id: 'Jordi', name: 'Jordi' }, { id: 'Maria', name: 'Maria' }, { id: 'Hans', name: 'Hans' }];

  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    assignedTo: '',
    stoneType: '',
    material: '',
    style: '',
    shape: '',
    stoneCount: '',
    stoneSize: '',
    timePerStone: '',
    pricePerStone: '',
    goldWeight: '',
    deadline: '',
    agreedPrice: ''
  });

 // Simulation State
  const [simulation, setSimulation] = useState({
    difficultyMargin: 1.0,
    urgencyFee: 0,
    calculatedPrice: 0,
    suggestedDate: ''
  });

  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    const res = await getSheetData('Alliance_Form');
    setData(res);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Smart Calculator Logic ---
  const handleSimulate = () => {
    const baseTime = (Number(formData.timePerStone) || 0) * (Number(formData.stoneCount) || 0);
    const hourlyRate = 120; // Internal Mock Rate
    
    // Price Calc
    let price = ((baseTime / 60) * hourlyRate) * simulation.difficultyMargin;
    price += Number(simulation.urgencyFee);
    
    // Date Logic: Find first user with < 35h assigned this week (Mock logic)
    const today = new Date();
    const daysToAdd = Math.ceil((baseTime / 60) / 8); // 8h workday
    const suggested = new Date(today.setDate(today.getDate() + daysToAdd + 2)); // +2 days buffer

    setSimulation(prev => ({
      ...prev,
      calculatedPrice: Math.round(price),
      suggestedDate: suggested.toISOString().split('T')[0]
    }));
    
    // Auto-fill suggested values
    setFormData(prev => ({
      ...prev,
      agreedPrice: Math.round(price).toString(),
      deadline: suggested.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await addRow('Alliance_Form', {
      ...formData,
      stoneSize: Number(formData.stoneSize),
      timePerStone: Number(formData.timePerStone),
      pricePerStone: Number(formData.pricePerStone),
      goldWeight: Number(formData.goldWeight),
      stoneCount: Number(formData.stoneCount),
      totalTime: Number(formData.timePerStone) * Number(formData.stoneCount),
      agreedPrice: Number(formData.agreedPrice),
      actualTime: 0
    });
    setFormData({
      projectName: '', client: '', assignedTo: '', stoneType: '', material: '', style: '',
      shape: '', stoneCount: '', stoneSize: '', timePerStone: '', pricePerStone: '', goldWeight: '', deadline: '', agreedPrice: ''
    });
    setSimulation({ difficultyMargin: 1.0, urgencyFee: 0, calculatedPrice: 0, suggestedDate: '' });
    await refreshData();
    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden"
        >
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-jewelry-copper">{t('allianceFormTitle')}</h2>
            <div className="w-2 h-2 rounded-full bg-jewelry-gold"></div>
          </div>
          
          <form id="projectForm" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectName')}</label>
              <input name="projectName" value={formData.projectName} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition" required />
            </div>

            {[
              { name: 'client', label: t('client'), type: 'select', opts: clientsList },
              { name: 'assignedTo', label: t('assignedTo'), type: 'select', opts: userOptions.map(u => ({ val: u.id, text: u.name })) },
              { name: 'stoneType', label: t('stoneType'), type: 'select', opts: stoneTypes },
              { name: 'material', label: t('material'), type: 'select', opts: materials },
              { name: 'style', label: t('style'), type: 'select', opts: styles },
              { name: 'shape', label: t('shape'), type: 'select', opts: shapes },
              { name: 'stoneCount', label: t('stoneCount'), type: 'number' },
              { name: 'stoneSize', label: t('stoneSize'), type: 'number', step: '0.1' },
              { name: 'timePerStone', label: t('timePerStone'), type: 'number' },
              { name: 'pricePerStone', label: t('pricePerStone'), type: 'number' },
              { name: 'goldWeight', label: t('goldBack'), type: 'number', step: '0.1' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition cursor-pointer">
                    <option value="">Select...</option>
                    {field.opts?.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.val} value={o.val}>{o.text}</option>)}
                  </select>
                ) : (
                  <input type={field.type} step={field.step} name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none transition" />
                )}
              </div>
            ))}
          </form>
        </motion.div>

        {/* Simulator & Proposal Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-amber-100/30"
        >
          <div className="p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center gap-2 text-jewelry-copper mb-1">
              <Calculator className="w-5 h-5" />
              <h3 className="font-serif font-bold uppercase tracking-wide text-sm">{t('proposalSimulation')}</h3>
            </div>
            <p className="text-gray-500 text-xs">AI-assisted scheduling and pricing estimator.</p>
          </div>

          <div className="p-6 space-y-6 flex-1 bg-white">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase text-gray-600 font-bold">{t('difficultyMargin')}</label>
                <span className="text-xs font-mono font-bold text-jewelry-bronze">x{simulation.difficultyMargin}</span>
              </div>
              <input 
                type="range" min="1" max="2" step="0.1" 
                value={simulation.difficultyMargin}
                onChange={e => setSimulation({...simulation, difficultyMargin: parseFloat(e.target.value)})}
                className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-jewelry-gold"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                <span>Standard</span>
                <span>Complex</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-600 font-bold mb-2">{t('urgencyFee')} (CHF)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  value={simulation.urgencyFee}
                  onChange={e => setSimulation({...simulation, urgencyFee: parseInt(e.target.value) || 0})}
                  className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-jewelry-copper outline-none transition"
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSimulate}
              className="w-full py-3 bg-gradient-to-r from-jewelry-gold to-jewelry-copper text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <TrendingUp className="w-4 h-4" />
              {t('calculate')}
            </button>

            {simulation.calculatedPrice > 0 && (
              <div className="space-y-3 pt-2 animate-fade-in-up">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                  <div className="text-xs text-jewelry-bronze uppercase font-bold">{t('suggestedPrice')}</div>
                  <div className="text-xl font-serif text-jewelry-copper font-bold">{simulation.calculatedPrice} <span className="text-sm">CHF</span></div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="text-xs text-blue-800 uppercase font-bold">{t('suggestedDate')}</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {simulation.suggestedDate}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-amber-50/50 border-t border-amber-100">
            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{t('agreedPrice')} (Final)</label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-jewelry-copper font-serif font-bold">CHF</span>
              <input 
                name="agreedPrice"
                value={formData.agreedPrice}
                onChange={handleChange}
                className="w-full pl-12 p-3 bg-white border border-jewelry-gold/30 rounded-lg text-xl font-serif font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-jewelry-gold outline-none"
                placeholder="0.00"
              />
            </div>
            <button 
              form="projectForm"
              type="submit" 
              disabled={submitting} 
              className="w-full bg-jewelry-copper hover:bg-jewelry-bronze text-white py-3 rounded-lg font-bold shadow-lg transition disabled:opacity-50 flex justify-center"
            >
              {submitting ? t('loading') : t('submit')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tots els Projectes */}
      <div className="space-y-4 pt-8">
        <h3 className="text-2xl font-serif font-bold text-jewelry-copper flex items-center gap-3">
          <div className="h-px bg-jewelry-gold/30 flex-1"></div>
          {t('allProjects')}
          <div className="h-px bg-jewelry-gold/30 flex-1"></div>
        </h3>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jewelry-gold"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-400 italic py-10">{t('noProjects')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(p => <ProjectCard key={p.id} project={p} color="#b87333" />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormFassung;