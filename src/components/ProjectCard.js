import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

const ProjectCard = ({ project, color }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // Controls locals
  const [price, setPrice] = useState(
    parseFloat(project["Preis pro Stein (chf), Zahl eingeben"] || project.pricePerStone || 50)
  );
  const [timeSpent, setTimeSpent] = useState(
    parseFloat(project["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] || project.timePerStone || 0)
  );
  const [status, setStatus] = useState(project.Status || "In Progress");

  const toggleExpand = () => setExpanded(!expanded);

  const projectRevenue = price * timeSpent;
  const title = project["Projekte Name"] || project.ProjectName || "Sin nom";

  const renderValue = (value) => {
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === "string" && !isNaN(Date.parse(value))) return new Date(value).toLocaleDateString();
    return value || "—";
  };

  return (
    <div
      className="bg-white shadow rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all"
      style={{ borderLeft: `6px solid ${color || "#3b82f6"}` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color || "#3b82f6" }}></div>
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
        <button onClick={toggleExpand} className="text-xl font-bold text-blue-500 hover:text-blue-700">
          {expanded ? "−" : "+"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm text-gray-700 space-y-3">
          {/* Info projecte */}
          <div className="space-y-1">
            {Object.entries(project).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {renderValue(value)}
              </p>
            ))}
          </div>

          {/* Controls */}
          <div className="space-y-2 mt-2">
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t("price")} CHF: {price.toFixed(2)}</label>
              <input type="range" min="50" max="300" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t("timeSpent")} min: {timeSpent}</label>
              <input type="number" min="0" value={timeSpent} onChange={(e) => setTimeSpent(parseFloat(e.target.value))} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="flex gap-2">
              {["In Progress", "Completed", "Pending"].map((s) => (
                <button
                  key={s}
                  className={`px-3 py-1 rounded font-medium ${status === s ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setStatus(s)}
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Resum */}
          <div className="mt-3 border-t pt-2 flex justify-between items-center">
            <div className="font-medium text-gray-800">
              💰 {t("projectRevenue")}: {projectRevenue.toFixed(2)} CHF
            </div>
            <button className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600" onClick={() => alert(t("savingSimulation"))}>
              {t("save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;