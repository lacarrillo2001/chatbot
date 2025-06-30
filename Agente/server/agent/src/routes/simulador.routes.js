import express from "express";
import axios from "axios";

export const router = express.Router();

// 🧠 Memoria temporal para simulaciones
const simulaciones = new Map();

// Ruta de prueba para saber si está activo
router.get("/", (req, res) => {
  res.send("🧠 Servidor de simulaciones sociales activo.");
});

// Iniciar simulación
router.post("/start", (req, res) => {
  const { user_id, user_name } = req.body;

  if (!user_id) return res.status(400).json({ error: "user_id es requerido" });

  simulaciones.set(user_id, {
    user_id,
    user_name: user_name || `Usuario ${user_id}`,
    mensajes: [],
    iniciada: new Date().toISOString(),
    ultimo_mensaje: new Date().toISOString(),
  });

  res.json({
    message: "🟢 Simulación iniciada",
    simulador_id: user_id,
    user_name: user_name || `Usuario ${user_id}`,
  });
});

// Enviar mensaje al simulador (contacta a Python)
router.post("/message", async (req, res) => {
  const { message, user_id } = req.body;

  if (!message || !user_id) return res.status(400).json({ error: "message y user_id son requeridos" });

  const simulacion = simulaciones.get(user_id) || {
    user_id,
    user_name: `Usuario ${user_id}`,
    mensajes: [],
    iniciada: new Date().toISOString(),
    ultimo_mensaje: new Date().toISOString(),
  };

  simulacion.mensajes.push({
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  });
 const url = process.env.API_AGENTPYTHON_SIMU;
  console.log("Backend URL:", url);

  try {
    const response = await axios.post("url", {
      message,
      user_id,
    });

    const feedback = {
      role: "assistant",
      content: response.data.response || response.data.message,
      timestamp: new Date().toISOString(),
    };

    simulacion.mensajes.push(feedback);
    simulacion.ultimo_mensaje = new Date().toISOString();
    simulaciones.set(user_id, simulacion);

    res.json({
      response: feedback.content,
      simulador_id: user_id,
      timestamp: feedback.timestamp,
      mensaje_total: simulacion.mensajes.length,
    });
  } catch (error) {
    simulacion.mensajes.push({
      role: "system",
      content: "Error del servidor al procesar tu mensaje.",
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Error desde el simulador Python",
      detalles: error.response ? error.response.data : error.message,
    });
  }
});

// Historial de la simulación
router.get("/history/:user_id", (req, res) => {
  const simulacion = simulaciones.get(req.params.user_id);
  if (!simulacion) return res.status(404).json({ error: "Simulación no encontrada" });
  res.json(simulacion);
});

// Limpiar la conversación
router.delete("/clear/:user_id", (req, res) => {
  const simulacion = simulaciones.get(req.params.user_id);
  if (!simulacion) return res.status(404).json({ error: "Simulación no encontrada" });

  simulacion.mensajes = [];
  simulacion.ultimo_mensaje = new Date().toISOString();

  res.json({ message: "Simulación reiniciada", simulador_id: req.params.user_id });
});

export default router;
