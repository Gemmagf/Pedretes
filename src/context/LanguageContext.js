import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  de: {
    dashboard: "Dashboard der Werkstatt",
    newProject: "Neues Projekt",
    projectsInProgress: "Laufende Projekte",
    totalCompletedRevenue: "Abgeschlossene Einnahmen",
    weeklyWorkload: "Wochenlast",
    totalCompleted: "Abgeschlossen Gesamt",
    createProject: "Projekt erstellen",
    pending: "Ausstehend",
    in_progress: "In Bearbeitung",
    completed: "Abgeschlossen",
    allianceFormTitle: "Neues Alliance-Projekt",
    fassungFormTitle: "Neues Fassung-Projekt",
    paveFormTitle: "Neues Pavé-Projekt",
    projectSaved: "Projekt gespeichert!",
    close: "Schließen",
    projectName: "Projektname",
    clientName: "Kunde",
    description: "Beschreibung",
    dueDate: "Fälligkeitsdatum",
    material: "Material",
    dimensions: "Dimensionen",
    gemsQuantity: "Anzahl Edelsteine",
    color: "Hauptfarbe",
    optimizePrice: "Preis optimieren",
  },
  en: {
    dashboard: "Workshop Dashboard",
    newProject: "New Project",
    projectsInProgress: "Projects in Progress",
    totalCompletedRevenue: "Total Completed Revenue",
    weeklyWorkload: "Weekly Workload",
    totalCompleted: "Completed Total",
    createProject: "Create Project",
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    allianceFormTitle: "New Alliance Project",
    fassungFormTitle: "New Fassung Project",
    paveFormTitle: "New Pavé Project",
    projectSaved: "Project saved!",
    close: "Close",
    projectName: "Project Name",
    clientName: "Client",
    description: "Description",
    dueDate: "Due Date",
    material: "Material",
    dimensions: "Dimensions",
    gemsQuantity: "Gems Quantity",
    color: "Main Color",
    optimizePrice: "Optimize Price",
  },
  cat: {
    dashboard: "Dashboard del Taller",
    newProject: "Nou Projecte",
    projectsInProgress: "Projectes en Marxa",
    totalCompletedRevenue: "Ingressos Completats",
    weeklyWorkload: "Carga Setmanal",
    totalCompleted: "Completats Total",
    createProject: "Crear Projecte",
    pending: "Pendents",
    in_progress: "En Marxa",
    completed: "Completat",
    allianceFormTitle: "Nou Projecte Alliance",
    fassungFormTitle: "Nou Projecte Fassung",
    paveFormTitle: "Nou Projecte Pavé",
    projectSaved: "Projecte guardat!",
    close: "Tancar",
    projectName: "Nom del Projecte",
    clientName: "Client",
    description: "Descripció",
    dueDate: "Data de lliurament",
    material: "Material",
    dimensions: "Dimensions",
    gemsQuantity: "Quantitat de gemmes",
    color: "Color Principal",
    optimizePrice: "Optimitzar Preu",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de');

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
