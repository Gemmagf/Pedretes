import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FormAlliance from './components/FormAlliance';
import FormFassung from './components/FormFassung';
import FormPave from './components/FormPave';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { Settings } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="ml-4 border rounded-xl px-3 py-1"
    >
      <option value="de">Deutsch</option>
      <option value="en">English</option>
      <option value="cat">Català</option>
    </select>
  );
};

const AppContent = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <Navigation />
      <main className="ml-64 p-4 sm:p-8">
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <motion.div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {t('dashboard')}
            </h1>
          </motion.div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-3 bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </motion.button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alliance" element={<FormAlliance />} />
          <Route path="/fassung" element={<FormFassung />} />
          <Route path="/pave" element={<FormPave />} />
        </Routes>
      </main>
      {showSettings && (
        <motion.div className="fixed top-4 right-4 bg-white rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-200 w-64 sm:w-80 z-50">
          <button onClick={() => setShowSettings(false)} className="w-full py-2 bg-gray-100 rounded-xl">{t('close')}</button>
        </motion.div>
      )}
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <Router>
      <AppContent />
    </Router>
  </LanguageProvider>
);

export default App;
