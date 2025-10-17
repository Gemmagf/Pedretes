import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { addRow, getRows } from '../services/sheetsAPI';
import { v4 as uuidv4 } from 'uuid';

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

  const [sheetData, setSheetData] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRows('Alliance');
        setSheetData(data);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
      } finally {
        setLoadingSheet(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = e => setFormData({...formData,[e.target.name]: e.target.value});
  const handleAddClient = () => {
    if(formData.clientName && !clients.includes(formData.clientName)){
      setClients([...clients, formData.clientName]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.clientName) return;
    handleAddClient();

    const dataToSend = { ...formData, id: uuidv4() };
    console.log('Sending to Google Sheets:', dataToSend);

    try {
      // Send new row
      const res = await addRow('Alliance', dataToSend);

      if (res.status === 'success') {
        setSubmitted(true);
        setFormData({
          stoneSize:'', stoneType:'', material:'', style:'', shape:'',
          timePerStone:'', pricePerStone:'', goldBack:'', clientName:''
        });

        // ✅ Fetch latest data after sending
        setLoadingSheet(true);
        const updatedData = await getRows('Alliance');
        setSheetData(updatedData);
        setLoadingSheet(false);

        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Error sending data:', err);
      setLoadingSheet(false);
    }
  };


  return (
    <motion.div className="bg-white/80 p-6 rounded-xl shadow max-w-3xl mx-auto">
      {/* === FORM === */}
      <h2 className="text-2xl font-semibold mb-4">{t('allianceFormTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>{t('dimensions')} (mm)</label>
          <input type="number" name="stoneSize" value={formData.stoneSize} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>{t('gems')}</label>
          <select name="stoneType" value={formData.stoneType} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {stoneTypes.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>{t('materials')}</label>
          <select name="material" value={formData.material} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {materials.map(m=> <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label>{t('style')}</label>
          <select name="style" value={formData.style} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {styles.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>{t('shape')}</label>
          <select name="shape" value={formData.shape} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {shapes.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>{t('timePerStone')}</label>
          <input type="number" name="timePerStone" value={formData.timePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>{t('pricePerStone')}</label>
          <input type="number" name="pricePerStone" value={formData.pricePerStone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>{t('goldBack')}</label>
          <input type="number" name="goldBack" value={formData.goldBack} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>

        <div>
          <label>{t('clientName')}</label>
          <select name="clientName" value={formData.clientName} onChange={handleChange} className="w-full border rounded px-2 py-1" required>
            <option value="">--Select--</option>
            {clients.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" className="mt-3 px-4 py-2 bg-amber-300 rounded">{t('createProject')}</button>
      </form>

      {submitted && <div className="mt-2 text-green-600 font-semibold">{t('projectSaved')}</div>}

      {/* === TABLE BELOW FORM === */}
      <div className="mt-6 overflow-auto">
        <h3 className="text-xl font-semibold mb-2">{t('allProjects')}</h3>
        {loadingSheet ? (
          <p>{t('loading')}</p>
        ) : sheetData.length === 0 ? (
          <p>{t('noProjects')}</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                {Object.keys(sheetData[0]).map(key => (
                  <th key={key} className="border px-2 py-1 bg-gray-100">{t(key) || key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map(key => (
                    <td key={key} className="border px-2 py-1">{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default FormAlliance;
