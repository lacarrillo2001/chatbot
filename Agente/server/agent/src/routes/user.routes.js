import express from 'express';
import pool from '../db.js';

const router = express.Router();
// GET /api/usuarios/:id/etapa

router.get('/usuarios/:id/etapa', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT etapa_flujo FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ etapa: result.rows[0].etapa_flujo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la etapa' });
  }
});
// PUT /api/usuarios/:id/etapa
router.put('/usuarios/:id/etapa', async (req, res) => {
  const { id } = req.params;
  const { nuevaEtapa } = req.body;
  console.log("🧪 Recibido PUT para ID:", id, "Etapa:", nuevaEtapa);

  // Orden lógico de etapas
  const ordenEtapas = ['inicio', 'test_completado', 'emocion_registrada', 'completo'];

  try {
    // Obtener etapa actual del usuario
    const result = await pool.query('SELECT etapa_flujo FROM usuarios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const etapaActual = result.rows[0].etapa_flujo;

    const indexActual = ordenEtapas.indexOf(etapaActual);
    const indexNueva = ordenEtapas.indexOf(nuevaEtapa);

    if (indexNueva === -1) {
      return res.status(400).json({ error: 'Etapa no válida' });
    }

    if (indexNueva > indexActual) {
      // Solo actualizar si es una etapa posterior
      await pool.query('UPDATE usuarios SET etapa_flujo = $1 WHERE id = $2', [nuevaEtapa, id]);
      return res.json({ mensaje: 'Etapa actualizada correctamente', updated: true });
    } else {
      // Ignorar si es igual o menor
      return res.json({ mensaje: 'Etapa no actualizada porque no representa un avance', updated: false });
    }

  } catch (err) {
    console.error("❌ Error al actualizar etapa:", err);
    res.status(500).json({ error: 'Error al actualizar la etapa' });
  }
});

export default router;
