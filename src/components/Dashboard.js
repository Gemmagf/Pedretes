// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ProjectCard from "./ProjectCard";
import { getSheetData } from "../services/sheetsAPI";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const sheets = ["Pave_Form", "Fassung_Form", "Alliance_Form"];
const workDayMinutes = 8 * 60; // 8 hours per day

const Dashboard = () => {
  const { t, language } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({});

  const toNumber = (val) => {
    if (!val) return 0;
    return parseFloat(val.toString().replace(",", ".").replace(/[^\d.-]/g, "")) || 0;
  };

  // --- Load sheets ---
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

        // Merge and assign unique color per project
        const merged = Object.values(dataObj).flat().map((p) => {
          const colorHash = Math.abs(
            [...(p["Projekte Name"] || p.ProjectName || p.Nom || "NoName")].reduce(
              (acc, c) => acc + c.charCodeAt(0),
              0
            )
          ) % 360;
          const color = `hsl(${colorHash}, 70%, 60%)`;
          return { ...p, color };
        });

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

  // --- Calculate stats ---
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

    const totalRevenue = data.reduce((sum, p) => {
      const price = toNumber(
        p["Preis pro Stein (chf), Zahl eingeben"] ||
        p["Preis pro Stein (CHF) Zahl eingeben"] ||
        p.pricePerStone
      );
      const time = toNumber(
        p["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] ||
        p["Zeit pro Stein (Minuten) Zahl eingeben in minuten"] ||
        p.timePerStone
      );
      return sum + price * time;
    }, 0);

    setStats({ total, completed, pending, inProgress, totalRevenue });
  };

  // --- Projects visible in current calendar view ---
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

    const visibleProjects = projects.filter((p) => {
      const projectDate = new Date(p.Date || p.StartDate || new Date());
      return projectDate >= start && projectDate < end;
    });

    const totalAssignedMinutes = visibleProjects.reduce((sum, p) => {
      const minutes = toNumber(
        p["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] || p.timePerStone
      );
      return sum + minutes;
    }, 0);

    return { visibleProjects, totalAssignedMinutes };
  };
  
  
  const { visibleProjects, totalAssignedMinutes } = getCurrentProjects();

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const freeMinutes = daysInMonth * workDayMinutes - totalAssignedMinutes;
  const freeHours = Math.max(0, freeMinutes / 60);

  // --- Calendar events ---
  const events = projects.map((p) => {
    const start = new Date(p.Date || p.StartDate || new Date());
    const minutesPerStone = toNumber(
      p["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] || p.timePerStone
    );
    const durationDays = Math.max(1, Math.ceil(minutesPerStone / workDayMinutes));
    return {
      title: p["Projekte Name"] || p.ProjectName || p.Nom || "No name",
      start,
      end: new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000),
      backgroundColor: p.color,
      borderColor: p.color,
      allDay: true,
    };
  });

  // --- Pie chart ---
  const pieData = {
    labels: [t("completed"), t("in_progress"), t("pending")],
    datasets: [
      {
        data: [stats.completed, stats.inProgress, stats.pending],
        backgroundColor: ["#4ade80", "#facc15", "#9ca3af"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#374151", font: { size: 14 } } },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} ${t("projectsInProgress")}`,
        },
      },
    },
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* --- TOP LEFT: Stats + Pie --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-2">🧭 {t("dashboardTitle")}</h2>
        <p className="text-gray-600 mb-4">{t("dashboardSubtitle")}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>🧩 {t("totalProjects", { total: visibleProjects.length })}: <span className="font-medium">{visibleProjects.length}</span></p>
          <p>🔧 {t("in_progress")}: <span className="font-medium">{stats.inProgress}</span></p>
          <p>✅ {t("completed")}: <span className="font-medium">{stats.completed}</span></p>
          <p>⏳ {t("pending")}: <span className="font-medium">{stats.pending}</span></p>
          <p>🕒 {t("weeklyWorkload")}: <span className="font-medium">{freeHours.toFixed(1)} h</span></p>
          <p className="col-span-2 border-t pt-2 mt-2 text-sm text-gray-700">
            💰 {t("completedRevenue")}: <span className="font-bold text-green-600">{stats.totalRevenue?.toFixed(2)} CHF</span>
          </p>
        </div>

        {/* --- Pie chart --- */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">📊 {t("dashboard")}</h4>
          <Pie data={pieData} options={pieOptions} />
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
          viewDidMount={(arg) => setView(arg.view.type)}
        />
      </div>

      {/* --- BOTTOM LEFT: Project cards --- */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-[70vh]">
        <h3 className="text-lg font-semibold mb-2">📋 {t("projectsInProgress")}</h3>
        {loading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : visibleProjects.length === 0 ? (
          <p className="text-gray-500">{t("noProjects")}</p>
        ) : (
          <div className="grid gap-3">
            {visibleProjects.map((project, i) => (
              <ProjectCard key={i} project={project} color={project.color} />
            ))}
          </div>
        )}
      </div>

      {/* --- BOTTOM RIGHT: Revenue --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-2">📈 {t("completedRevenue")}</h3>
        <p className="text-gray-600 mb-4">{t("basedOnCompleted")}</p>
        <div className="text-2xl font-bold text-green-600 mb-2">
          {stats.totalRevenue?.toFixed(2)} CHF
        </div>
      </div>

      {/* --- FULL DATA TABLES --- */}
      <div className="col-span-2">
        {sheets.map((sheetName) => (
          <div key={sheetName} className="mb-6 bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">{sheetName}</h3>
            {loading ? (
              <p>{t("loading")}</p>
            ) : (
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr>
                    {allData[sheetName]?.[0] &&
                      Object.keys(allData[sheetName][0]).map((h) => (
                        <th key={h} className="border px-2 py-1 bg-gray-100">{h}</th>
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