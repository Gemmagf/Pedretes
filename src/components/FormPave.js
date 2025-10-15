import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';

const FormPave = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    description: '',
    dueDate: '',
    gemsQuantity: '',
    color: '',
    optimizePrice: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectName && formData.clientName) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-semibold mb-6">{t('paveFormTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>{t('projectName')}</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>{t('clientName')}</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>{t('description')}</label>
          <textarea
            className="w-full border rounded-xl px-3 py-2"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>{t('dueDate')}</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>{t('gemsQuantity')}</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            name="gemsQuantity"
            value={formData.gemsQuantity}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>{t('color')}</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="optimizePrice"
            checked={formData.optimizePrice}
            onChange={handleChange}
          />
          <label>{t('optimizePrice')}</label>
        </div>
        <motion.button
          type="submit"
          className="mt-4 px-6 py-2 bg-amber-300 rounded-xl shadow hover:bg-amber-400"
        >
          {t('createProject')}
        </motion.button>
      </form>
      {submitted && <div className="mt-4 text-green-600 font-semibold">{t('projectSaved')}</div>}
    </motion.div>
  );
};

export default FormPave;
