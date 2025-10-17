import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbyIowiPbj54BmtcwmpvWd_ZuJHbtSGZ1ictdYWjWBhlrpvSZ1PB_AELxRylOpN0pZcp/exec"
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en la connexió:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <p>Carregant dades...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pedretes CMS</h1>
      <div style={styles.cards}>
        {data.map((item, idx) => (
          <div key={idx} style={styles.card}>
            <h3 style={styles.cardTitle}>{item.Title}</h3>
            <p style={styles.cardContent}>{item.Content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.5rem",
    color: "#333",
    marginBottom: "30px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    justifyItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "20px",
    width: "220px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardTitle: {
    fontSize: "1.25rem",
    color: "#1a73e8",
    marginBottom: "10px",
  },
  cardContent: {
    fontSize: "1rem",
    color: "#555",
  },
  loadingContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
    padding: "100px",
    fontSize: "1.2rem",
    color: "#555",
  },
};

export default App;
