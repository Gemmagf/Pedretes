// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ProjectCard from "./ProjectCard";

const BASE_URL = "https://script.google.com/macros/s/AKfycbyp3PfCmhKeK2Qk-5kl5y41793d2Hov5sirpyA3k3Cs9ToyW0U-j62rPlVJ8yLSCjgG/exec";

const getSheetData = async (sheetName) => {
  const res = await fetch(`${BASE_URL}?sheet=${sheetName}`);
  return res.json();
};

const Dashboard = () => {
  const { t, language } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({});

  // --- Load data from Google Sheets ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getSheetData("Alliance"); // pots canviar a Pave_Form o Fassung_Form
        setProjects(data || []);
        calculateStats(data || []);
      } catch (err) {
        console.error("Error loading sheet data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Compute summary stats ---
  const calculateStats = (data) => {
    const total = data.length;
    const completed = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "completat" ||
        p.Status?.toLowerCase() === "completed"
    ).length;
    const pending = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "pendent" ||
        p.Status?.toLowerCase() === "pending"
    ).length;
    const inProgress = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "en marxa" ||
        p.Status?.toLowerCase() === "in_progress"
    ).length;
    const totalRevenue = data.reduce(
      (sum, p) => sum + (parseFloat(p.Preu || p["Preis pro Stein (CHF)"]) || 0),
      0
    );

    setStats({ total, completed, pending, inProgress, totalRevenue });
  };

  // --- Calendar events ---
  const events = projects.map((p) => ({
    title: p["Projekte Name"] || p.Nom || p.ProjectName || "No name",
    start: p.Date || p.StartDate,
    end: p.EndDate || p.Date,
    backgroundColor:
      p.Status?.toLowerCase() === "completat" ||
      p.Status?.toLowerCase() === "completed"
        ? "#9ca3af"
        : p.Status?.toLowerCase() === "en marxa" ||
          p.Status?.toLowerCase() === "in_progress"
        ? "#3b82f6"
        : "#f97316",
  }));

  // --- Filter projects for current month (optional) ---
  // Si vols mostrar-ho tot, només assigna:
  const currentProjects = projects; 

  return (
    <div className="p-6 grid grid-cols-2 gap-6 h-[90vh]">
      {/* --- TOP LEFT: Stats --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-2">🧭 {t("dashboardTitle")}</h2>
        <p className="text-gray-600 mb-4">{t("dashboardSubtitle")}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>
            🧩 {t("totalProjects", { total: stats.total || 0 })}:{" "}
            <span className="font-medium">{stats.total}</span>
          </p>
          <p>
            🔧 {t("in_progress")}:{" "}
            <span className="font-medium">{stats.inProgress}</span>
          </p>
          <p>
            ✅ {t("completed")}:{" "}
            <span className="font-medium">{stats.completed}</span>
          </p>
          <p>
            ⏳ {t("pending")}: <span className="font-medium">{stats.pending}</span>
          </p>
          <p className="col-span-2 border-t pt-2 mt-2 text-sm text-gray-700">
            💰 {t("completedRevenue")}:{" "}
            <span className="font-bold text-green-600">
              {stats.totalRevenue?.toFixed(2)} CHF
            </span>
          </p>
        </div>
      </div>

      {/* --- TOP RIGHT: Calendar --- */}
      <div className="bg-white rounded-2xl shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          height="70vh"
          locale={language}
          datesSet={(arg) => setSelectedDate(arg.start)}
        />
      </div>

      {/* --- BOTTOM LEFT: Project List --- */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">📋 {t("projectsInProgress")}</h3>
        {loading ? (
          <p className="text-gray-500">{t("loading") || "Carregant dades..."}</p>
        ) : currentProjects.length === 0 ? (
          <p className="text-gray-500">{t("noProjects")}</p>
        ) : (
          <div className="grid gap-3">
            {currentProjects.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* --- BOTTOM RIGHT: Revenue / Tips --- */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-2">📈 {t("completedRevenue")}</h3>
        <p className="text-gray-600 mb-4">{t("basedOnCompleted")}</p>
        <div className="text-2xl font-bold text-green-600 mb-2">
          {stats.totalRevenue?.toFixed(2)} CHF
        </div>
        <p className="text-sm text-gray-500 mb-2">{t("optimizationTip")}</p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>⚠️ {t("overloadWarning", { percent: 15 })}</li>
          <li>💡 {t("pendingProjects", { pending: stats.pending || 0 })}</li>
          <li>📊 {t("basedOnHistorical", { count: 12 })}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;