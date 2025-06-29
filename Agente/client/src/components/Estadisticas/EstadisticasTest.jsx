import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EstadisticasTest = ({ userId }) => {
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3003/api/estadisticas/resultados-test/${userId}`)
      .then((res) => setResultados(res.data))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div>
      <h2>🧠 Resultados de Tests de Ansiedad Social</h2>
      {resultados.map((test, index) => (
        <div key={index} className="card" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{test.nombre}</h3>
          <p><strong>Puntaje total:</strong> {test.puntuacion_total}</p>

          {test["puntaje_social(miedo )"] && (
            <p><strong>Puntaje Social (miedo):</strong> {test["puntaje_social(miedo )"]}</p>
          )}
          {test["puntaje_rendimiento(evitacion)"] && (
            <p><strong>Puntaje Rendimiento (evitación):</strong> {test["puntaje_rendimiento(evitacion)"]}</p>
          )}

          <p><strong>Interpretación:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
            {test.interpretacion}
          </pre>

          <p><small>📅 Fecha: {new Date(test.fecha).toLocaleString()}</small></p>
        </div>
      ))}
    </div>
  );
};

export default EstadisticasTest;
