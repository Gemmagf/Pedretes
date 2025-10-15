import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FormAlliance from './components/FormAlliance';
import FormFassung from './components/FormFassung';
import FormPave from './components/FormPave';
import UserManagement from './components/UserManagement';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { UsersProvider } from './context/UsersContext';
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
          <h1 className="text-2xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            {t('dashboard')}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-3 bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alliance" element={<FormAlliance />} />
          <Route path="/fassung" element={<FormFassung />} />
          <Route path="/pave" element={<FormPave />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
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
