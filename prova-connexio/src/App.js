import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbySoSBaDM_BYSf2fm9p-L8QIXlcO2pMgksZYlylf9e9wd4xBjGTGgVi6rtPja86PCsx/exec"
    )
      .then((res) => res.json())
      .then((json) => {
        console.log("Dades rebudes:", json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en la connexió:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregant dades...</p>;

  return (
    <div style={styles.container}>
      <h1>Test connexió dades</h1>
      <div style={styles.cards}>
        {data.map((item, idx) => (
          <div key={idx} style={styles.card}>
            <h3>{item.Title}</h3>
            <p>{item.Content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    textAlign: "center",
    padding: "20px",
  },
  cards: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    padding: "15px",
    width: "200px",
  },
};

export default App;