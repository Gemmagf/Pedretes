import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FormAlliance from './components/FormAlliance';
import FormFassung from './components/FormFassung';
import FormPave from './components/FormPave';
import UserManagement from './components/UserManagement';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { UsersProvider } from './context/UsersContext';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer"
      >
        <option value="de">Deutsch</option>
        <option value="en">English</option>
        <option value="cat">Català</option>
      </select>
    </div>
  );
};

const AppContent = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FDFBF7]"> {/* Warm paper-like background */}
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pt-12 lg:pt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              {t('dashboardTitle')}
            </h1>
            <p className="text-gray-500 mt-1">{t('dashboardSubtitle')}</p>
          </div>
          <LanguageSelector />
        </header>

        <div className="animate-fade-in-up">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alliance" element={<FormAlliance />} />
            <Route path="/fassung" element={<FormFassung />} />
            <Route path="/pave" element={<FormPave />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <UsersProvider>
      <Router>
        <AppContent />
      </Router>
    </UsersProvider>
  </LanguageProvider>
);

export default App;