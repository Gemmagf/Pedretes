import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

const ProjectCard = ({ project, color }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  // --- Parse numeric fields safely ---
  const parseNum = (v) => {
    if (!v) return 0;
    const clean = v.toString().replace(",", ".").replace(/[^\d.-]/g, "");
    return isNaN(parseFloat(clean)) ? 0 : parseFloat(clean);
  };

  const price = parseNum(
    project["Preis pro Stein (chf), Zahl eingeben"] ||
      project.pricePerStone ||
      project["Preis pro Stein (chf)"] ||
      project.Preu
  );
  const time = parseNum(
    project["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] ||
      project.timePerStone ||
      project["Zeit pro Stein (Minuten)"] ||
      project.Zeit
  );

  const projectRevenue = price * time;

  const title =
    project["Projekte Name"] || project.ProjectName || "Sin nom";

  return (
    <div
      className="bg-white shadow rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all"
      style={{ borderLeft: `6px solid ${color || "#3b82f6"}` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Dot with project color */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color || "#3b82f6" }}
          ></div>
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
        <button
          onClick={toggleExpand}
          className="text-xl font-bold text-blue-500 hover:text-blue-700"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {/* Expanded info */}
      {expanded && (
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          {Object.entries(project).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value || "—"}
            </p>
          ))}
          <p className="mt-2 font-medium text-gray-800">
            💰 <strong>{t("projectRevenue")}:</strong>{" "}
            {projectRevenue.toFixed(2)} CHF
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;