import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow, getSheetData } from '../services/sheetsAPI';
import { v4 as uuidv4 } from 'uuid';
import ProjectCard from './ProjectCard';

const FormFassung = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    description: '',
    dueDate: '',
    material: '',
    dimensions: '',
    color: '',
    timePerStone: '',
    pricePerStone: '',
    optimizePrice: false
  });
  const [clients, setClients] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // --- Llegir dades de Google Sheets ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await getSheetData('Fassung_Form');

      // Assignar colors i normalitzar dates
      const normalizedData = json.map((p) => {
        const name = p["Projekte Name"] || p.ProjectName || "NoName";
        const colorHash = Math.abs([...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 360;
        const color = `hsl(${colorHash}, 70%, 60%)`;
        return {
          ...p,
          color,
          Date: p.Date ? new Date(p.Date) : null,
          Creació: p['Marca de temps'] ? new Date(p['Marca de temps']) : null
        };
      });

      setData(normalizedData);
      setClients([...new Set(normalizedData.map(d => d.clientName).filter(Boolean))]);
    } catch (err) {
      console.error('Error carregant dades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Formulari ---
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddClient = () => {
    if (formData.clientName && !clients.includes(formData.clientName)) {
      setClients([...clients, formData.clientName]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.clientName) return;
    handleAddClient();

    const dataToSend = { ...formData, id: uuidv4(), sheet: 'Fassung_Form' };

    try {
      const res = await addRow('Fassung_Form', dataToSend);
      if (res.status === 'success') {
        setSubmitted(true);
        setFormData({
          projectName: '', clientName: '', description: '', dueDate: '',
          material: '', dimensions: '', color: '', timePerStone: '', pricePerStone: '', optimizePrice: false
        });
        fetchData();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Error enviant dades:', err);
    }
  };

  return (
    <motion.div className="bg-white/80 p-6 rounded-xl shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{t('fassungFormTitle')}</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label>{t('projectName')}</label>
          <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>{t('clientName')}</label>
          <select name="clientName" value={formData.clientName} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label>{t('description')}</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('dueDate')}</label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('material')}</label>
          <input type="text" name="material" value={formData.material} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('dimensions')}</label>
          <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('color')}</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('timePerStone')} (Minuten)</label>
          <input type="number" name="timePerStone" value={formData.timePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>{t('pricePerStone')} (CHF)</label>
          <input type="number" name="pricePerStone" value={formData.pricePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="optimizePrice" checked={formData.optimizePrice} onChange={handleChange} />
          <label>{t('optimizePrice')}</label>
        </div>

        <button type="submit" className="mt-3 px-4 py-2 bg-amber-300 rounded">{t('createProject')}</button>
      </form>

      {submitted && <div className="mt-2 text-green-600 font-semibold">{t('projectSaved')}</div>}

      {/* Project cards */}
      <h3 className="text-xl font-semibold mb-2">{t('allProjects')}</h3>
      {loading ? <p>{t('loading')}</p> :
        data.length === 0 ? <p>{t('noProjects')}</p> :
        <div className="grid gap-4">{data.map((project, idx) => <ProjectCard key={idx} project={project} color={project.color} />)}</div>}
    </motion.div>
  );
};

export default FormFassung;