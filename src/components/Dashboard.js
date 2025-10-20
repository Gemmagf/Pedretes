// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // npm install react-calendar
import "react-calendar/dist/Calendar.css";
import { getSheetData } from "../services/sheetsAPI";
import { useTranslation } from "../context/LanguageContext";
import ProjectCard from "./ProjectCard"; // Component mínim per mostrar projectes

const Dashboard = () => {
  const { t } = useTranslation();

  // Estat del calendari
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month"); // month/week/day

  // Dades per bloc notes
  const [summary, setSummary] = useState({
    totalProjects: 0,
    completedProjects: 0,
    scheduledTime: 0,
    timeSpent: 0,
    freeTime: 0,
    bookedTime: 0,
    daysOff: 0,
  });

  // Dades de projectes del període
  const [projects, setProjects] = useState([]);

  // Dades de revenue
  const [revenue, setRevenue] = useState({
    currentMonth: 0,
    prevYearSameMonth: 0,
    tips: [],
  });

  // Funció per obtenir dades (dummy inicialment)
  useEffect(() => {
    const fetchData = async () => {
      // Exemple: llegeix projectes de "Alliance" (es pot afegir Fassung i Pave)
      const data = await getSheetData("Alliance");
      // Filtra projectes segons data seleccionada (a implementar)
      setProjects(data);

      // Exemple: calcular resum (dummy)
      const total = data.length;
      const completed = data.filter(p => p.status === "Completed").length;
      const scheduled = data.reduce((acc, p) => acc + Number(p.timePerStone || 0), 0);
      setSummary({
        totalProjects: total,
        completedProjects: completed,
        scheduledTime: scheduled,
        timeSpent: scheduled * 0.8, // dummy
        freeTime: 40 - scheduled,    // dummy
        bookedTime: scheduled * 0.9, // dummy
        daysOff: 2                   // dummy
      });

      setRevenue({
        currentMonth: data.reduce((acc, p) => acc + Number(p.pricePerStone || 0), 0),
        prevYearSameMonth: 5000, // dummy
        tips: ["Ajusta material i temps per maximitzar marge", "No tots els preus són exactes"]
      });
    };
    fetchData();
  }, [date]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", padding: "20px" }}>
      {/* Bloc notes i calendari */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Bloc notes */}
        <div className="notes-block" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("totalProjects")}: {summary.totalProjects}</p>
          <p>{t("statusCompleted")}: {summary.completedProjects}</p>
          <p>Temps programat: {summary.scheduledTime}h</p>
          <p>Temps passat: {summary.timeSpent}h</p>
          <p>Temps lliure futur: {summary.freeTime}h</p>
          <p>Temps booked: {summary.bookedTime}h</p>
          <p>Days Off: {summary.daysOff}</p>
        </div>

        {/* Calendari */}
        <div className="calendar-block" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <Calendar
            onChange={setDate}
            value={date}
            view={view}
            onViewChange={({ activeStartDate, view }) => setView(view)}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setView("month")}>Month</button>
            <button onClick={() => setView("week")}>Week</button>
            <button onClick={() => setView("day")}>Day</button>
          </div>
        </div>
      </div>

      {/* Part dreta: projectes + revenue */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Projectes */}
        <div>
          <h3>Projectes ({projects.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {projects.map((p, idx) => (
              <ProjectCard key={idx} project={p} />
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
          <h3>Revenue {date.toLocaleString("default", { month: "long" })}</h3>
          <p>Actual: CHF {revenue.currentMonth}</p>
          <p>Any passat: CHF {revenue.prevYearSameMonth}</p>
          <ul>
            {revenue.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
