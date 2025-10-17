// src/components/FormAlliance.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow } from '../services/sheetsAPI';
import { v4 as uuidv4 } from 'uuid';

// Llistats predefinits
const clientsList = ['Beyer','Peclard','Lohri','Ann Perica','Messerer','Suenos','Meister'];
const stoneTypes = ['weiße Diamanten','Korund + farbige Diamanten','empfindliche Steine'];
const materials = ['WG + GG + Roségold','Rotgold','Platin'];
const styles = ['Fadenpavé','Arkaden','Fishtail','Fishtail gegenschnitt','Abgedeckt','Castel','Side by side','Kanalfassung'];
const shapes = ['eckig','rund'];

const FormAlliance = () => {
  const { t } = useTranslation();

  // Estat del formulari
  const [formData, setFormData] = useState({
    stoneSize:'', stoneType:'', material:'', style:'', shape:'',
    timePerStone:'', pricePerStone:'', goldBack:'', clientName:''
  });
  const [clients, setClients] = useState(clientsList);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // Funció per llegir dades de Google Sheets
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbz5lbz7o3wS0_-C-mIIK-khOivA6F0pmRUUc70xL_z4e3fMrakqnlbTC7ZCfCP1GMwc/exec?sheet=Alliance');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error carregant dades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actualitza camps del formulari
  const handleChange = e => setFormData({...formData,[e.target.name]: e.target.value});

  // Afegeix un client nou si no existeix
  const handleAddClient = () => {
    if(formData.clientName && !clients.includes(formData.clientName)){
      setClients([...clients, formData.clientName]);
    }
  };

  // Enviar formulari
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.clientName) return;
    handleAddClient();

    const dataToSend = { ...formData, id: uuidv4(), sheet:'Alliance' };

    try {
      const res = await addRow('Alliance', dataToSend);
      console.log('Resposta del Web App:', res);

      if (res.status === 'success') {
        setSubmitted(true);
        setFormData({
          stoneSize:'', stoneType:'', material:'', style:'', shape:'',
          timePerStone:'', pricePerStone:'', goldBack:'', clientName:''
        });
        // refrescar dades de taula
        fetchData();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Error enviant dades:', err);
    }
  };

  return (
    <motion.div className="bg-white/80 p-6 rounded-xl shadow max-w-4xl mx-auto">
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

      {/* Feedback */}
      {submitted && <div className="mt-2 text-green-600 font-semibold">{t('projectSaved')}</div>}

      {/* Taula de dades */}
      <h3 className="text-xl font-semibold mb-2">{t('allProjects')}</h3>
      {loading ? (
        <p>{t('loading') || 'Carregant dades...'}</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Steingröße (mm)</th>
              <th className="border px-2 py-1">Steinart</th>
              <th className="border px-2 py-1">Material</th>
              <th className="border px-2 py-1">Stil</th>
              <th className="border px-2 py-1">Form</th>
              <th className="border px-2 py-1">Zeit pro Stein (Minuten)</th>
              <th className="border px-2 py-1">Preis pro Stein (CHF)</th>
              <th className="border px-2 py-1">Gold zurück (Gramm)</th>
              <th className="border px-2 py-1">Kunde</th>
              <th className="border px-2 py-1">Creació</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{row['ID']}</td>
                <td className="border px-2 py-1">{row['Steingröße (mm)']}</td>
                <td className="border px-2 py-1">{row['Steinart']}</td>
                <td className="border px-2 py-1">{row['Material']}</td>
                <td className="border px-2 py-1">{row['Stil']}</td>
                <td className="border px-2 py-1">{row['Form']}</td>
                <td className="border px-2 py-1">{row['Zeit pro Stein (Minuten)']}</td>
                <td className="border px-2 py-1">{row['Preis pro Stein (CHF)']}</td>
                <td className="border px-2 py-1">{row['Gold zurück (Gramm)']}</td>
                <td className="border px-2 py-1">{row['Kunde']}</td>
                <td className="border px-2 py-1">{row['Creació']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
};

export default FormAlliance;
