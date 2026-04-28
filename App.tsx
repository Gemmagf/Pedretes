import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FormAlliance from './components/FormAlliance';
import FormFassung from './components/FormFassung';
import FormPave from './components/FormPave';
import UserManagement from './components/UserManagement';
import Analytics from './components/Analytics';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { UsersProvider } from './context/UsersContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import { Globe, FlaskConical, X } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer"
      >
        <option value="de">Deutsch</option>
        <option value="en">English</option>
        <option value="cat">Català</option>
      </select>
    </div>
  );
};

const DemoBanner = () => {
  const { exitDemo, demoAnswers } = useDemo();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold flex items-center justify-between px-4 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4" />
        <span>Demo-Modus — {demoAnswers?.workshopName || 'Mein Atelier'} · Synthetische Daten</span>
      </div>
      <button
        onClick={exitDemo}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition"
      >
        <X className="w-3.5 h-3.5" />
        Demo beenden
      </button>
    </div>
  );
};

const AppContent = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  const [showLogin, setShowLogin] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jewelry-gold" />
      </div>
    );
  }

  // Demo mode — mostra l'app sense auth
  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DemoBanner />
        <div className="pt-10">
          <Navigation />
          <main className="lg:ml-64 p-4 lg:p-8 transition-all duration-300">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pt-12 lg:pt-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{t('dashboardTitle')}</h1>
                <p className="text-gray-500 mt-1">{t('dashboardSubtitle')}</p>
              </div>
              <LanguageSelector />
            </header>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/alliance" element={<FormAlliance />} />
              <Route path="/fassung" element={<FormFassung />} />
              <Route path="/pave" element={<FormPave />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // No autenticat — Landing o Login
  if (!user) {
    if (showLogin) return <LoginPage />;
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  // Autenticat — app completa
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <main className="lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pt-12 lg:pt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{t('dashboardTitle')}</h1>
            <p className="text-gray-500 mt-1">{t('dashboardSubtitle')}</p>
          </div>
          <LanguageSelector />
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
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
    <AuthProvider>
      <DemoProvider>
        <UsersProvider>
          <Router>
            <AppContent />
          </Router>
        </UsersProvider>
      </DemoProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
