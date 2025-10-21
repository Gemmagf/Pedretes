// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ProjectCard from "./ProjectCard";
import { getSheetData } from "../services/sheetsAPI";

const sheets = ["Pave_Form", "Fassung_Form", "Alliance_Form"];

const Dashboard = () => {
  const { t, language } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({});

  // --- Load all sheets ---
  useEffect(() => {
    const fetchAllSheets = async () => {
      setLoading(true);
      try {
        const dataObj = {};
        for (let sheetName of sheets) {
          const data = await getSheetData(sheetName);
          dataObj[sheetName] = data;
        }
        setAllData(dataObj);

        // Unim totes les dades per calcular stats i calendar
        const merged = Object.values(dataObj).flat();
        setProjects(merged);
        calculateStats(merged);
      } catch (err) {
        console.error("Error loading sheets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSheets();
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
      (sum, p) => sum + (parseFloat(p.Preu || p.pricePerStone) || 0),
      0
    );

    setStats({ total, completed, pending, inProgress, totalRevenue });
  };

  // --- Filter projects according to calendar view ---
  const getCurrentProjects = () => {
    const start = selectedDate;
    let end = new Date(start);

    switch (view) {
      case "dayGridMonth":
        end.setMonth(start.getMonth() + 1);
        break;
      case "timeGridWeek":
        end.setDate(start.getDate() + 7);
        break;
      case "timeGridDay":
        end.setDate(start.getDate() + 1);
        break;
      default:
        end.setMonth(start.getMonth() + 1);
    }

    return projects.filter((p) => {
      const projectDate = new Date(p.Date || p.StartDate);
      return projectDate >= start && projectDate < end;
    });
  };

  const currentProjects = getCurrentProjects();

  // --- Calendar events ---
  const events = projects.map((p) => {
    const start = new Date(p.Date || p.StartDate);
    const end = p.EndDate ? new Date(p.EndDate) : start;
    return {
      title: p["Projekte Name"] || p.Nom || p.ProjectName || "No name",
      start,
      end,
      backgroundColor:
        p.Status?.toLowerCase() === "completat" ||
        p.Status?.toLowerCase() === "completed"
          ? "#9ca3af"
          : p.Status?.toLowerCase() === "en marxa" ||
            p.Status?.toLowerCase() === "in_progress"
          ? "#3b82f6"
          : "#f97316",
    };
  });

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
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
          // Detect view change
          viewDidMount={(arg) => setView(arg.view.type)}
        />
      </div>

      {/* --- BOTTOM LEFT: Project List filtered by calendar --- */}
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
      </div>

      {/* --- FULL DATA TABLES per form --- */}
      <div className="col-span-2">
        {sheets.map((sheetName) => (
          <div key={sheetName} className="mb-6 bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">{sheetName}</h3>
            {loading ? (
              <p>{t("loading")}</p>
            ) : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    {allData[sheetName]?.[0] &&
                      Object.keys(allData[sheetName][0]).map((h) => (
                        <th key={h} className="border px-2 py-1">{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {allData[sheetName]?.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border px-2 py-1">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

