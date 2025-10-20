import React, { createContext, useState, useContext } from "react";

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

    // Dashboard extras
    dashboardTitle: "Dashboard der Werkstatt",
    dashboardSubtitle: "Alles auf einen Blick: Projekte, Arbeitslast und Optimierungen",
    ofTotal: "von {{total}} insgesamt",
    completedRevenue: "Abgeschlossene Einnahmen",
    basedOnCompleted: "Basierend auf abgeschlossenen Projekten",
    overloadWarning: "Überlastung! Reduziere um {{percent}}% zur Optimierung",
    pendingProjects: "Ausstehende Projekte: {{pending}}",
    totalProjects: "Gesamtprojekte: {{total}}",
    prototypeActive: "Aktiver Prototyp - Alles simuliert",
    allProjects: "Alle Projekte",
    historicalData: "(Historische Daten sichtbar)",
    noProjects: "Keine Projekte in dieser Kategorie. Erstelle eines im Formular!",
    statusPending: "Ausstehend",
    statusInProgress: "In Bearbeitung",
    statusCompleted: "Abgeschlossen",
    statusUnknown: "Unbekannt",
    style: "Stil",
    shape: "Form",
    timePerStone: "Zeit pro Stein (Minuten)",
    pricePerStone: "Preis pro Stein (CHF)",
    goldBack: "Gold zurück (Gramm)",
    loading: "Lade Daten...",
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

    // Dashboard extras
    dashboardTitle: "Workshop Dashboard",
    dashboardSubtitle: "Everything visible: projects, workload and optimizations",
    ofTotal: "of {{total}} total",
    completedRevenue: "Completed Revenue",
    basedOnCompleted: "Based on completed projects",
    overloadWarning: "Overload! Reduce by {{percent}}% to optimize",
    pendingProjects: "Pending projects: {{pending}}",
    totalProjects: "Total projects: {{total}}",
    prototypeActive: "Active Prototype - All simulated",
    allProjects: "All Projects",
    historicalData: "(Historical data visible)",
    noProjects: "No projects in this category. Create one in the forms!",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusUnknown: "Unknown",
    style: "Style",
    shape: "Shape",
    timePerStone: "Time per Stone (minutes)",
    pricePerStone: "Price per Stone (CHF)",
    goldBack: "Gold Back (grams)",
    loading: "Loading data...",
  },

  cat: {
    dashboard: "Dashboard del Taller",
    newProject: "Nou Projecte",
    projectsInProgress: "Projectes en Marxa",
    totalCompletedRevenue: "Ingressos Completats",
    weeklyWorkload: "Càrrega Setmanal",
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

    // Dashboard extras
    dashboardTitle: "Dashboard del Taller",
    dashboardSubtitle: "Tot visible: projectes, càrrega i optimitzacions",
    ofTotal: "de {{total}} total",
    completedRevenue: "Ingressos Completats",
    basedOnCompleted: "Basat en projectes completats",
    overloadWarning: "Sobrecàrrega! Redueix {{percent}}% per optimitzar",
    pendingProjects: "Projectes pendents: {{pending}}",
    totalProjects: "Total projectes: {{total}}",
    prototypeActive: "Prototip actiu - Tot simulat",
    allProjects: "Tots els projectes",
    historicalData: "(Dades històriques visibles)",
    noProjects: "No hi ha projectes en aquesta categoria. Crea’n un al formulari!",
    statusPending: "Pendents",
    statusInProgress: "En Marxa",
    statusCompleted: "Completat",
    statusUnknown: "Desconegut",
    style: "Estil",
    shape: "Forma",
    timePerStone: "Temps per gemma (minuts)",
    pricePerStone: "Preu per gemma (CHF)",
    goldBack: "Or recuperat (grams)",
    loading: "Carregant dades...",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("de");

  const t = (key, vars = {}) => {
    let text = translations[language]?.[key] || key;
    Object.keys(vars).forEach((v) => {
      text = text.replace(`{{${v}}}`, vars[v]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
