import React, { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext";
import { getSheetData } from "../services/sheetsAPI";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const Dashboard = () => {
  const { t, language } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({});

  // --- Load data from Google Sheet ---
  useEffect(() => {
    const loadData = async () => {
      const data = await getSheetData("Alliance");
      setProjects(data);
      calculateStats(data);
    };
    loadData();
  }, []);

  // --- Compute summary data for the top-left card ---
  const calculateStats = (data) => {
    const total = data.length;
    const completed = data.filter((p) => p.Status === "completed").length;
    const pending = data.filter((p) => p.Status === "pending").length;
    const inProgress = data.filter((p) => p.Status === "in_progress").length;
    const totalRevenue = data.reduce(
      (sum, p) => sum + (parseFloat(p.Preu) || 0),
      0
    );

    setStats({ total, completed, pending, inProgress, totalRevenue });
  };

  // --- Calendar events from sheet ---
  const events = projects.map((p) => ({
    title: p.ProjectName || "No name",
    start: p.StartDate,
    end: p.EndDate,
    backgroundColor:
      p.Status === "completed"
        ? "#9ca3af" // gray
        : p.Status === "in_progress"
        ? "#3b82f6" // blue
        : "#f97316", // orange
  }));

  // --- Filtered projects for list ---
  const currentMonth = selectedDate.getMonth();
  const currentProjects = projects.filter((p) => {
    const start = new Date(p.StartDate);
    return start.getMonth() === currentMonth;
  });

  return (
    <div className="p-6 grid grid-cols-2 gap-6 h-[90vh]">
      {/* --- TOP LEFT: WORKFLOW CARD --- */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-2">
          🧭 {t("dashboardTitle")}
        </h2>
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
            ⏳ {t("pending")}:{" "}
            <span className="font-medium">{stats.pending}</span>
          </p>
          <p className="col-span-2 border-t pt-2 mt-2 text-sm text-gray-700">
            💰 {t("completedRevenue")}:{" "}
            <span className="font-bold text-green-600">
              {stats.totalRevenue?.toFixed(2)} CHF
            </span>
          </p>
        </div>
      </div>

      {/* --- TOP RIGHT: CALENDAR --- */}
      <div className="bg-white rounded-2xl shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,dayGridYear",
          }}
          events={events}
          height="70vh"
          locale={language}
          datesSet={(arg) => setSelectedDate(arg.start)}
        />
      </div>

      {/* --- BOTTOM LEFT: PROJECT LIST --- */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">
          📋 {t("projectsInProgress")}
        </h3>
        {currentProjects.length === 0 ? (
          <p className="text-gray-500">{t("noProjects")}</p>
        ) : (
          <ul>
            {currentProjects.map((p, i) => (
              <li
                key={i}
                className="border-b py-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{p.ProjectName}</p>
                  <p className="text-xs text-gray-500">
                    {p.Client} – {p.Preu || "?"} CHF
                  </p>
                </div>
                <button className="text-blue-500 text-lg font-bold">＋</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- BOTTOM RIGHT: REVENUE + TIPS --- */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-2">
          📈 {t("completedRevenue")}
        </h3>
        <p className="text-gray-600 mb-4">{t("basedOnCompleted")}</p>

        <div className="text-2xl font-bold text-green-600 mb-2">
          {stats.totalRevenue?.toFixed(2)} CHF
        </div>
        <p className="text-sm text-gray-500 mb-2">
          {t("optimizationTip")}
        </p>

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
