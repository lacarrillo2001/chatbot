import React, { useEffect, useState } from "react";
import { getSimulaciones, deleteSimulacion } from "../services/api";
import type { Simulacion } from "../types/simulacion";
import "./SimuladorList.css";
import SimulacionForm from "./SimulacionForm";

interface Props {
  userId: string;
}

const SimuladorList: React.FC = () => {
  const [simuladores, setSimuladores] = useState<Simulacion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadSimulaciones();
  }, []);

  const loadSimulaciones = async () => {
    const res = await getSimulaciones();
    setSimuladores(res.data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta simulación?")) {
      await deleteSimulacion(id);
      loadSimulaciones();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredSimuladores = simuladores.filter((sim) => sim.usuario_id === userId);

  return (
    <div className="simulador-container">
      <h2 className="simulador-title">Simulaciones Guardadas</h2>

      {formVisible ? (
        <SimulacionForm
          onCreated={() => {
            setFormVisible(false);
            loadSimulaciones();
          }}
          onCancel={() => setFormVisible(false)}
        />
      ) : (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {/* Botón adicional si es necesario */}
        </div>
      )}

      {filteredSimuladores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>No hay simulaciones guardadas</h3>
          <p>Crea tu primera simulación para comenzar</p>
        </div>
      ) : (
        <div className="simulador-list">
          {filteredSimuladores.map((sim) => (
            <div key={sim.id} className="sim-card">
              <h3 className="sim-title">{sim.titulo}</h3>

              <p className="sim-text">
                <span className="sim-label">📝 Descripción:</span> {sim.descripcion}
              </p>

              <div className="sim-buttons">
                <button onClick={() => toggleExpand(sim.id)} className="sim-button view">
                  {expandedId === sim.id ? "🔼 Ocultar pasos" : "🔽 Ver pasos"}
                </button>
                <button onClick={() => handleDelete(sim.id)} className="sim-button delete">
                  🗑 Eliminar
                </button>
              </div>

              {expandedId === sim.id && (
                <div className="sim-pasos">
                  {sim.escenarios?.map((esc, idx) => (
                    <div key={idx} className="sim-escenario">
                      <p>
                        <strong>Paso {idx + 1}:</strong> {esc.situacion}
                      </p>
                      <ul>
                        {esc.opciones.map((op, i) => (
                          <li key={i}>
                            <strong>🧩 Opción:</strong> {op}
                            {esc.respuestas?.[i] && (
                              <>
                                <br />
                                <strong>💡 Respuesta:</strong> {esc.respuestas[i]}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimuladorList;