import express from "express";
import { getSimulacionesCollection } from "../mongo.js";

const router = express.Router();

// GET todas las simulaciones
router.get("/", async (req, res) => {
  const col = await getSimulacionesCollection();
  const sims = await col.find({}, { projection: { _id: 0 } }).toArray();
  res.json(sims);
});

// GET una por ID
router.get("/:id", async (req, res) => {
  const col = await getSimulacionesCollection();
  const sim = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
  if (!sim) return res.status(404).json({ error: "Simulación no encontrada" });
  res.json(sim);
});

// POST nueva simulación
router.post("/", async (req, res) => {
  const col = await getSimulacionesCollection();
  const sim = req.body;
  if (!sim.id || !sim.titulo || !sim.escenarios) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  await col.insertOne(sim);
  res.status(201).json({ message: "Simulación guardada correctamente" });
});

// DELETE por ID
router.delete("/:id", async (req, res) => {
  const col = await getSimulacionesCollection();
  const result = await col.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Simulación no encontrada" });
  }
  res.json({ message: "Simulación eliminada" });
});
export default router;
