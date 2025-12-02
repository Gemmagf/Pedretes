
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'de' | 'en' | 'cat';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    allianceFormTitle: 'Alliance Projects',
    fassungFormTitle: 'Fassung Projects',
    paveFormTitle: 'Pavé Projects',
    userManagement: 'User Management',
    dashboardTitle: 'Atelier Overview',
    dashboardSubtitle: 'Workflow optimization and financial tracking.',
    totalProjects: 'Total Projects',
    in_progress: 'In Progress',
    completed: 'Completed',
    pending: 'Pending',
    weeklyWorkload: 'Team Workload',
    completedRevenue: 'Revenue',
    projectsInProgress: 'Active Projects List',
    loading: 'Loading data...',
    noProjects: 'No projects in this period.',
    createProject: 'Create Project',
    projectSaved: 'Project saved successfully!',
    allProjects: 'All Projects',
    stoneSize: 'Stone Size (mm)',
    stoneType: 'Stone Type',
    material: 'Material',
    style: 'Style',
    shape: 'Shape',
    timePerStone: 'Time/Stone (min)',
    totalTime: 'Est. Total Time',
    actualTime: 'Actual Time',
    pricePerStone: 'Price/Stone (CHF)',
    goldBack: 'Gold Back (g)',
    client: 'Client',
    date: 'Start Date',
    deadline: 'Deadline',
    stoneCount: 'Stone Count',
    layout: 'Layout',
    fixation: 'Fixation',
    submit: 'Add to Schedule',
    extraHours: 'Extra Hours',
    addUser: 'Add User',
    newUser: 'New User Name',
    status: 'Status',
    projectName: 'Project Name',
    revenue: 'Revenue',
    basedOnCompleted: 'Based on selection',
    filter_week: 'This Week',
    filter_month: 'This Month',
    filter_year: 'This Year',
    filter_all: 'All Time',
    editProject: 'Edit Project',
    agreedPrice: 'Agreed Price (CHF)',
    priceAlert: 'Price Alert: Actual costs exceeding estimate.',
    saveChanges: 'Save Changes',
    proposalSimulation: 'Proposal & Schedule Simulation',
    difficultyMargin: 'Difficulty Margin',
    urgencyFee: 'Urgency Fee',
    suggestedPrice: 'Suggested Price',
    suggestedDate: 'Optimized Delivery',
    calculate: 'Simulate',
    assignedTo: 'Assigned To',
    filterByUser: 'Filter by Jeweler',
    allUsers: 'All Team Members',
    close: 'Close',
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month'
  },
  de: {
    dashboard: 'Übersicht',
    allianceFormTitle: 'Alliance Projekte',
    fassungFormTitle: 'Fassung Projekte',
    paveFormTitle: 'Pavé Projekte',
    userManagement: 'Benutzerverwaltung',
    dashboardTitle: 'Atelier Übersicht',
    dashboardSubtitle: 'Arbeitsablaufoptimierung und Finanztracking.',
    totalProjects: 'Gesamtprojekte',
    in_progress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    weeklyWorkload: 'Teamauslastung',
    completedRevenue: 'Umsatz',
    projectsInProgress: 'Aktive Projektliste',
    loading: 'Daten werden geladen...',
    noProjects: 'Keine Projekte in diesem Zeitraum.',
    createProject: 'Projekt erstellen',
    projectSaved: 'Projekt erfolgreich gespeichert!',
    allProjects: 'Alle Projekte',
    stoneSize: 'Steingröße (mm)',
    stoneType: 'Steinart',
    material: 'Material',
    style: 'Stil',
    shape: 'Form',
    timePerStone: 'Zeit/Stein (min)',
    totalTime: 'Gesch. Gesamtzeit',
    actualTime: 'Tatsächliche Zeit',
    pricePerStone: 'Preis/Stein (CHF)',
    goldBack: 'Gold zurück (g)',
    client: 'Kunde',
    date: 'Startdatum',
    deadline: 'Liefertermin',
    stoneCount: 'Anzahl Steine',
    layout: 'Layout',
    fixation: 'Fixierung',
    submit: 'Zum Zeitplan hinzufügen',
    extraHours: 'Extrastunden',
    addUser: 'Benutzer hinzufügen',
    newUser: 'Neuer Benutzername',
    status: 'Status',
    projectName: 'Projekt Name',
    revenue: 'Einnahmen',
    basedOnCompleted: 'Basierend auf Auswahl',
    filter_week: 'Diese Woche',
    filter_month: 'Diesen Monat',
    filter_year: 'Dieses Jahr',
    filter_all: 'Gesamtzeit',
    editProject: 'Projekt bearbeiten',
    agreedPrice: 'Vereinbarter Preis (CHF)',
    priceAlert: 'Preiswarnung: Kosten übersteigen Schätzung.',
    saveChanges: 'Änderungen speichern',
    proposalSimulation: 'Angebot & Zeitplan Simulation',
    difficultyMargin: 'Schwierigkeitsmarge',
    urgencyFee: 'Dringlichkeitsgebühr',
    suggestedPrice: 'Vorgeschlagener Preis',
    suggestedDate: 'Optimierte Lieferung',
    calculate: 'Simulieren',
    assignedTo: 'Zugewiesen an',
    filterByUser: 'Nach Juwelier filtern',
    allUsers: 'Alle Teammitglieder',
    close: 'Schließen',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat'
  },
  cat: {
    dashboard: 'Taulell de control',
    allianceFormTitle: 'Projectes Alliance',
    fassungFormTitle: 'Projectes Fassung',
    paveFormTitle: 'Projectes Pavé',
    userManagement: 'Gestió d\'Usuaris',
    dashboardTitle: 'Resum del Taller',
    dashboardSubtitle: 'Optimització del flux de treball i seguiment financer.',
    totalProjects: 'Projectes Totals',
    in_progress: 'En curs',
    completed: 'Completat',
    pending: 'Pendent',
    weeklyWorkload: 'Càrrega de l\'Equip',
    completedRevenue: 'Facturació',
    projectsInProgress: 'Llistat de Projectes',
    loading: 'Carregant dades...',
    noProjects: 'Cap projecte en aquest període.',
    createProject: 'Crear Projecte',
    projectSaved: 'Projecte guardat correctament!',
    allProjects: 'Tots els Projectes',
    stoneSize: 'Mida Pedra (mm)',
    stoneType: 'Tipus de Pedra',
    material: 'Material',
    style: 'Estil',
    shape: 'Forma',
    timePerStone: 'Temps/Pedra (min)',
    totalTime: 'Temps Estimat',
    actualTime: 'Temps Real',
    pricePerStone: 'Preu/Pedra (CHF)',
    goldBack: 'Or retornat (g)',
    client: 'Client',
    date: 'Data Inici',
    deadline: 'Data Entrega',
    stoneCount: 'Quantitat Pedres',
    layout: 'Disposició',
    fixation: 'Fixació',
    submit: 'Afegir al Calendari',
    extraHours: 'Hores extra',
    addUser: 'Afegir Usuari',
    newUser: 'Nom del nou usuari',
    status: 'Estat',
    projectName: 'Nom del Projecte',
    revenue: 'Ingressos',
    basedOnCompleted: 'Basat en la selecció',
    filter_week: 'Aquesta Setmana',
    filter_month: 'Aquest Mes',
    filter_year: 'Aquest Any',
    filter_all: 'Tot l\'històric',
    editProject: 'Editar Projecte',
    agreedPrice: 'Preu Acordat (CHF)',
    priceAlert: 'Alerta Preu: El temps real excedeix l\'estimat.',
    saveChanges: 'Guardar Canvis',
    proposalSimulation: 'Simulació de Proposta i Calendari',
    difficultyMargin: 'Marge de Dificultat',
    urgencyFee: 'Taxa d\'Urgència',
    suggestedPrice: 'Preu Suggerit',
    suggestedDate: 'Entrega Optimitzada',
    calculate: 'Simular',
    assignedTo: 'Assignat a',
    filterByUser: 'Filtrar per Joier',
    allUsers: 'Tot l\'Equip',
    close: 'Tancar',
    previousMonth: 'Mes Anterior',
    nextMonth: 'Mes Següent'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('cat');

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};
