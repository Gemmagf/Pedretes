// src/components/ProjectCard.js
import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

const statusColors = {
  "en marxa": "bg-green-500",
  "pendent": "bg-yellow-500",
  "completat": "bg-gray-400",
};

const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  /// --- Calculate project revenue ---
  // --- Calculate project revenue ---
    const price = parseFloat(
    (project["Preis pro Stein (chf), Zahl eingeben"] || project.pricePerStone || "0")
        .toString()
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    );

    const time = parseFloat(
    (project["Zeit pro Stein (Minuten), Zahl eingeben in minuten"] || project.timePerStone || "0")
        .toString()
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    );

    const projectRevenue = isNaN(price) || isNaN(time) ? 0 : price * time;
 
  return (
    <div className="bg-white shadow rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              statusColors[project.Status?.toLowerCase()] || "bg-blue-400"
            }`}
          ></div>
          <h4 className="text-lg font-semibold text-gray-800">
            {project["Projekte Name"] || project.Nom || project.ProjectName || "Sin nom"}
          </h4>
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
          <p>
            <strong>{t("projectRevenue")}:</strong> {projectRevenue.toFixed(2)} CHF
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;