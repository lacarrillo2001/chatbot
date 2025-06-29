import React, { useState } from "react";
import type { Simulacion, Escenario } from "../types/simulacion";
import { createSimulacion } from "../services/api";
import "./SimulacionForm.css";
 // Opcional: crea si deseas estilo externo

const SimulacionForm: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({
  onCreated,
  onCancel,
}) => {
  const [form, setForm] = useState<Simulacion>({
    id: "",
    titulo: "",
    descripcion: "",
    objetivo: "",
    escenarios: [],
    usuario_id: ""
  });

  const handleAddPaso = () => {
    const nuevoPaso: Escenario = {
      paso: form.escenarios.length + 1,
      situacion: "",
      opciones: ["", "", "", ""],
      respuestas: ["", "", "", ""],
    };
    setForm({ ...form, escenarios: [...form.escenarios, nuevoPaso] });
  };

  const handleInput = (field: keyof Simulacion, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handlePasoChange = (index: number, field: keyof Escenario, value: any) => {
    const updated = [...form.escenarios];
    (updated[index] as any)[field] = value;
    setForm({ ...form, escenarios: updated });
  };

  const handleArrayChange = (
    pasoIndex: number,
    arrayField: "opciones" | "respuestas",
    itemIndex: number,
    value: string
  ) => {
    const updated = [...form.escenarios];
    updated[pasoIndex][arrayField][itemIndex] = value;
    setForm({ ...form, escenarios: updated });
  };

  const handleSubmit = async () => {
    if (!form.titulo || !form.objetivo || form.escenarios.length === 0) {
      alert("Completa los campos obligatorios.");
      return;
    }
    const sim = { ...form, id: "sim-" + Math.random().toString(36).slice(2, 7) };
    await createSimulacion(sim);
    onCreated();
  };

  return (
    <div className="sim-form-container">
      <h3>➕ Nueva Simulación</h3>
      <input
        type="text"
        placeholder="Título"
        value={form.titulo}
        onChange={(e) => handleInput("titulo", e.target.value)}
      />
      <textarea
        placeholder="Descripción"
        value={form.descripcion}
        onChange={(e) => handleInput("descripcion", e.target.value)}
      />
      <textarea
        placeholder="Objetivo"
        value={form.objetivo}
        onChange={(e) => handleInput("objetivo", e.target.value)}
      />

      {form.escenarios.map((esc, idx) => (
        <div key={idx} className="paso-box">
  <h4>Paso {esc.paso}</h4>

  <div className="paso-grid">
    <div className="situacion-column">
      <label>🧠 Situación</label>
      <textarea
        placeholder="Describe la situación"
        value={esc.situacion}
        onChange={(e) => handlePasoChange(idx, "situacion", e.target.value)}
      />
    </div>

    <div className="opciones-column">
      <label>🧩 Opciones</label>
      {esc.opciones.map((op, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Opción ${i + 1}`}
          value={op}
          onChange={(e) => handleArrayChange(idx, "opciones", i, e.target.value)}
        />
      ))}
    </div>

    <div className="respuestas-column">
      <label>💡 Respuestas</label>
      {esc.respuestas.map((r, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Respuesta ${i + 1}`}
          value={r}
          onChange={(e) => handleArrayChange(idx, "respuestas", i, e.target.value)}
        />
      ))}
    </div>
  </div>
</div>
      ))}

      <div className="sim-form-actions">
        <button onClick={handleAddPaso}>➕ Añadir paso</button>
        <button onClick={handleSubmit}>✅ Guardar</button>
        <button onClick={onCancel}>❌ Cancelar</button>
      </div>
    </div>
  );
};

export default SimulacionForm;
