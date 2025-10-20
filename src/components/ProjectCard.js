// src/components/ProjectCard.js
import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "10px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{project.clientName || "Unknown Client"} - {project.stoneType || project.material}</span>
        <button onClick={() => setExpanded(!expanded)} style={{
          backgroundColor: "#f0f0f0",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          border: "none",
          cursor: "pointer"
        }}>{expanded ? "-" : "+"}</button>
      </div>

      {expanded && (
        <div style={{ marginTop: "10px" }}>
          <p><strong>{t("material")}:</strong> {project.material}</p>
          <p><strong>Stil:</strong> {project.style}</p>
          <p><strong>Form:</strong> {project.shape}</p>
          <p><strong>Zeit pro Stein:</strong> {project.timePerStone} min</p>
          <p><strong>Preis pro Stein:</strong> CHF {project.pricePerStone}</p>
          <p><strong>Gold zurück:</strong> {project.goldBack} g</p>
          <p><strong>Creació:</strong> {project.Creació}</p>
          {/* Aquí podem afegir futurament un mini formulari per editar */}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;