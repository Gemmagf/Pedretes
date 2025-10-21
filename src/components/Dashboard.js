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

  // --- Unique color generator for projects ---
  const getColorForProject = (name) => {
    const hash = Array.from(name || "default").reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
      0
    );
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

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

  // --- Compute stats ---
  const calculateStats = (data) => {
    const total = data.length;
    const completed = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "completat" ||
        p.Status?.toLowerCase() === "completed"
    );

    const inProgress = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "en marxa" ||
        p.Status?.toLowerCase() === "in_progress"
    );

    const pending = data.filter(
      (p) =>
        p.Status?.toLowerCase() === "pendent" ||
        p.Status?.toLowerCase() === "pending"
    );

    // --- Project revenue = Preis pro Stein * Zeit pro Stein ---
    const parseNum = (v) =>
      isNaN(parseFloat(v)) ? 0 : parseFloat(v.toString().replace(",", "."));

    const projectRevenue = data.map((p) => {
      const preis = parseNum(p["Preis pro Stein (chf)"] || p.Preu || p.pricePerStone);
      const zeit = parseNum(p["Zeit pro Stein (Minuten)"] || p.Zeit || p.timePerStone);
      return preis * zeit;
    });

    const totalRevenue = projectRevenue.reduce((a, b) => a + b, 0);
    const completedRevenue = completed
      .map((p) => {
        const preis = parseNum(p["Preis pro Stein (chf)"] || p.Preu || p.pricePerStone);
        const zeit = parseNum(p["Zeit pro Stein (Minuten)"] || p.Zeit || p.timePerStone);
        return preis * zeit;
      })
      .reduce((a, b) => a + b, 0);

    setStats({
      total,
      completed: completed.length,
      inProgress: inProgress.length,
      pending: pending.length,
      totalRevenue,
      completedRevenue,
    });
  };

  // --- Filter projects for visible calendar range ---
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
    const title =
      p["Projekte Name"] || p.Nom || p.ProjectName || "Unbenanntes Projekt";
    const start = new Date(p.StartDate || p.Date);
    const end = p.EndDate ? new Date(p.EndDate) : start;
    const color = getColorForProject(title);

    return {
      title,
      start,
      end,
      display: "block",
      color,
    };
  });

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* --- TOP LEFT: Stats --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-2">🧭 {t("dashboardTitle")}</h2>
        <p className="text-gray-600 mb-4">{t("dashboardSubtitle")}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>🧩 {t("totalProjects")}: {stats.total}</p>
          <p>🔧 {t("in_progress")}: {stats.inProgress}</p>
          <p>✅ {t("completed")}: {stats.completed}</p>
          <p>⏳ {t("pending")}: {stats.pending}</p>
          <p className="col-span-2 border-t pt-2 mt-2 text-sm text-gray-700">
            💰 {t("completedRevenue")}:{" "}
            <span className="font-bold text-green-600">
              {stats.completedRevenue?.toFixed(2)} CHF
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
          viewDidMount={(arg) => setView(arg.view.type)}
        />
      </div>

      {/* --- BOTTOM LEFT: Project List (scrollable, same height as calendar) --- */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <h3 className="text-lg font-semibold mb-2">📋 {t("projectsInProgress")}</h3>
        {loading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : currentProjects.length === 0 ? (
          <p className="text-gray-500">{t("noProjects")}</p>
        ) : (
          <div className="grid gap-3">
            {currentProjects.map((project, i) => (
              <ProjectCard
                key={i}
                project={project}
                color={getColorForProject(
                  project["Projekte Name"] || project.Nom || project.ProjectName
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- BOTTOM RIGHT: Completed Revenue --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between" style={{ maxHeight: "70vh" }}>
        <h3 className="text-lg font-semibold mb-2">📈 {t("completedRevenue")}</h3>
        <p className="text-gray-600 mb-4">{t("basedOnCompleted")}</p>
        <div className="text-2xl font-bold text-green-600 mb-2">
          {stats.completedRevenue?.toFixed(2)} CHF
        </div>
      </div>
    </div>
  );
};

export default Dashboard;