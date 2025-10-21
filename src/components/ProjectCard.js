// src/components/ProjectCard.js
import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

const statusColors = {
  "en marxa": "bg-blue-500",
  "pendent": "bg-yellow-500",
  "completat": "bg-gray-400",
  "completed": "bg-gray-400",
  "pending": "bg-yellow-500",
  "in_progress": "bg-blue-500",
};

const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

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
            {project.Nom || project.Name || "—"}
          </h4>
        </div>
        <button
          onClick={toggleExpand}
          className="text-xl font-bold text-blue-500 hover:text-blue-700"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p>
            <strong>{t("status")}:</strong> {project.Status || "—"}
          </p>
          <p>
            <strong>{t("startDate")}:</strong> {project.StartDate || "—"}
          </p>
          <p>
            <strong>{t("endDate")}:</strong> {project.EndDate || "—"}
          </p>
          <p>
            <strong>{t("price")}:</strong> {project.Preu || project.Price || "—"} CHF
          </p>
          <p>
            <strong>{t("timePerStone")}:</strong> {project.timePerStone || "—"} min
          </p>
          <p>
            <strong>{t("client")}:</strong> {project.clientName || "—"}
          </p>
          <p>
            <strong>{t("description")}:</strong> {project.Descripcio || project.Description || "—"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;