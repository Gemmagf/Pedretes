import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow, getSheetData } from '../services/sheetsAPI';
import ProjectCard from './ProjectCard';
import { Project } from '../types';

const clientsList = ['Beyer','Ann Perica','Messerer'];
const materials = ['WG + GG + Roségold','Rotgold','Platin'];
const stoneTypes = ['weiße Diamanten','Korund + farbige Diamanten'];
const styles = ['wildes Pavé, Honeycomb','Fadenpavé','Castle'];
const layouts = ['nicht vorhanden', 'vorhanden'];
const fixations = ['einfache Fixierung', 'doppelte Fixierung'];

const FormPave = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    projectName: '',
    stoneType: '',
    material: '',
    style: '',
    layout: '',
    fixation: '',
    pricePerStone: '',
    totalTime: '',
    goldWeight: '',
    client: '',
    stoneCount: '',
    agreedPrice: '',
    deadline: ''
  });

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
    const res = await getSheetData('Pave_Form');
    setData(res);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSimulate = () => {
    const baseTime = Number(formData.totalTime) || 0;
    const hourlyRate = 120;
    let price = (baseTime / 60) * hourlyRate * simulation.difficultyMargin;
    price += Number(simulation.urgencyFee);

    const today = new Date();
    const daysToAdd = Math.ceil(baseTime / 60 / 8);
    const suggested = new Date(today.setDate(today.getDate() + daysToAdd + 2));

    setSimulation(prev => ({
      ...prev,
      calculatedPrice: Math.round(price),
      suggestedDate: suggested.toISOString().split('T')[0]
    }));

    setFormData(prev => ({
      ...prev,
      agreedPrice: Math.round(price).toString(),
      deadline: suggested.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await addRow('Pave_Form', {
      ...formData,
      stoneCount: Number(formData.stoneCount),
      totalTime: Number(formData.totalTime),
      pricePerStone: Number(formData.pricePerStone),
      goldWeight: Number(formData.goldWeight),
    });
    setFormData({
      projectName: '', stoneType: '', material: '', style: '', layout: '', fixation: '',
      pricePerStone: '', totalTime: '', goldWeight: '', client: '', stoneCount: '', agreedPrice: '', deadline: ''
    });
    setSimulation({ difficultyMargin: 1.0, urgencyFee: 0, calculatedPrice: 0, suggestedDate: '' });
    await refreshData();
    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <h2 className="text-xl font-serif font-bold text-purple-900">{t('paveFormTitle')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectName')}</label>
            <input name="projectName" value={formData.projectName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required />
          </div>

          {[
            { name: 'client', label: t('client'), type: 'select', opts: clientsList },
            { name: 'stoneType', label: t('stoneType'), type: 'select', opts: stoneTypes },
            { name: 'material', label: t('material'), type: 'select', opts: materials },
            { name: 'style', label: t('style'), type: 'select', opts: styles },
            { name: 'layout', label: t('layout'), type: 'select', opts: layouts },
            { name: 'fixation', label: t('fixation'), type: 'select', opts: fixations },
            { name: 'stoneCount', label: t('stoneCount'), type: 'number' },
            { name: 'totalTime', label: t('totalTime'), type: 'number' },
            { name: 'pricePerStone', label: t('pricePerStone'), type: 'number' },
            { name: 'goldWeight', label: t('goldBack'), type: 'number', step: '0.1' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-400 outline-none" required>
                  <option value="">Select...</option>
                  {field.opts?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} step={field.step} name={field.name} value={(formData as any)[field.name]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required />
              )}
            </div>
          ))}

          {/* Simulador */}
          <div className="col-span-full p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
            <h3 className="text-xs font-bold uppercase text-purple-900">{t('proposalSimulation')}</h3>
            <p className="text-xs text-gray-500">AI-assisted scheduling and pricing estimator.</p>

            <label className="text-xs font-bold text-gray-600">Difficulty Margin</label>
            <input type="range" min="1" max="2" step="0.1" value={simulation.difficultyMargin} onChange={e => setSimulation({...simulation, difficultyMargin: parseFloat(e.target.value)})} className="w-full h-2 mt-1 accent-purple-600" />

            <label className="text-xs font-bold text-gray-600">Urgency Fee (CHF)</label>
            <input type="number" value={simulation.urgencyFee} onChange={e => setSimulation({...simulation, urgencyFee: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-lg mt-1" />

            <button type="button" onClick={handleSimulate} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold mt-2">Calculate</button>

            {simulation.calculatedPrice > 0 && (
              <div className="space-y-1 text-xs text-purple-700">
                <div>Suggested Price: {simulation.calculatedPrice} CHF</div>
                <div>Suggested Date: {simulation.suggestedDate}</div>
              </div>
            )}
          </div>

          <div className="col-span-full flex justify-end mt-4">
             <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-medium shadow-md transition-colors" disabled={submitting}>{submitting ? t('loading') : t('submit')}</button>
          </div>

        </form>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-bold text-gray-800 border-b pb-2">{t('allProjects')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div>{t('loading')}</div> : data.map(p => <ProjectCard key={p.id} project={p} color="#9333ea" />)}
        </div>
      </div>
    </div>
  );
};

export default FormPave;