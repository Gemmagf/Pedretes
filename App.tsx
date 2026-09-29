import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppShell from './components/AppShell';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { Spinner } from './components/ui';
import { LanguageProvider } from './context/LanguageContext';
import { UsersProvider } from './context/UsersContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-cream-50"><Spinner className="h-10 w-10 border-gold-500" /></div>;
  }

  if (isDemoMode || user) {
    return (
      <DataProvider>
        <UsersProvider>
          <Router>
            <AppShell />
          </Router>
        </UsersProvider>
      </DataProvider>
    );
  }

  if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  return <LandingPage onLogin={() => setShowLogin(true)} />;
};

const App: React.FC = () => (
  <LanguageProvider>
    <ToastProvider>
      <AuthProvider>
        <DemoProvider>
          <AppContent />
        </DemoProvider>
      </AuthProvider>
    </ToastProvider>
  </LanguageProvider>
);

export default App;
