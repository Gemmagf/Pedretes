// src/components/FormAlliance.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow, getSheetData } from '../services/sheetsAPI';
import { v4 as uuidv4 } from 'uuid';
import ProjectCard from './ProjectCard';

// Llistats predefinits
const clientsList = ['Beyer','Peclard','Lohri','Ann Perica','Messerer','Suenos','Meister'];
const stoneTypes = ['weiße Diamanten','Korund + farbige Diamanten','empfindliche Steine'];
const materials = ['WG + GG + Roségold','Rotgold','Platin'];
const styles = ['Fadenpavé','Arkaden','Fishtail','Fishtail gegenschnitt','Abgedeckt','Castel','Side by side','Kanalfassung'];
const shapes = ['eckig','rund'];

const FormAlliance = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    stoneSize:'', stoneType:'', material:'', style:'', shape:'',
    timePerStone:'', pricePerStone:'', goldBack:'', clientName:''
  });
  const [clients, setClients] = useState(clientsList);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // --- Funció per llegir dades de Google Sheets ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await getSheetData('Alliance_Form');

      // Normalitzar dates i assignar colors
      const normalizedData = json.map((p) => {
        const name = p["Projekte Name"] || p.ProjectName || p.Nom || "NoName";
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
  const handleChange = e => setFormData({...formData,[e.target.name]:e.target.value});

  const handleAddClient = () => {
    if(formData.clientName && !clients.includes(formData.clientName)){
      setClients([...clients, formData.clientName]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.clientName) return;
    handleAddClient();

    const dataToSend = { ...formData, id: uuidv4(), sheet:'Alliance_Form' };

    try {
      const res = await addRow('Alliance_Form', dataToSend);
      console.log('Resposta del Web App:', res);

      if (res.status === 'success') {
        setSubmitted(true);
        setFormData({
          stoneSize:'', stoneType:'', material:'', style:'', shape:'',
          timePerStone:'', pricePerStone:'', goldBack:'', clientName:''
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
      <h2 className="text-2xl font-semibold mb-4">{t('allianceFormTitle')}</h2>

      {/* Formulari */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label>Steingröße (mm)</label>
          <input type="number" name="stoneSize" value={formData.stoneSize} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>Steinart</label>
          <select name="stoneType" value={formData.stoneType} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {stoneTypes.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>Material</label>
          <select name="material" value={formData.material} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {materials.map(m=> <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label>Stil</label>
          <select name="style" value={formData.style} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {styles.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>Form</label>
          <select name="shape" value={formData.shape} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {shapes.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>Zeit pro Stein (Minuten)</label>
          <input type="number" name="timePerStone" value={formData.timePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>Preis pro Stein (CHF)</label>
          <input type="number" name="pricePerStone" value={formData.pricePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>Gold zurück (Gramm)</label>
          <input type="number" name="goldBack" value={formData.goldBack} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>Kunde</label>
          <select name="clientName" value={formData.clientName} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {clients.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" className="mt-3 px-4 py-2 bg-amber-300 rounded">{t('createProject')}</button>
      </form>

      {submitted && <div className="mt-2 text-green-600 font-semibold">{t('projectSaved')}</div>}

      {/* Project cards */}
      <h3 className="text-xl font-semibold mb-2">{t('allProjects')}</h3>
      {loading ? (
        <p>{t('loading')}</p>
      ) : data.length === 0 ? (
        <p>{t('noProjects')}</p>
      ) : (
        <div className="grid gap-4">
          {data.map((project, idx) => (
            <ProjectCard key={idx} project={project} color={project.color} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FormAlliance;