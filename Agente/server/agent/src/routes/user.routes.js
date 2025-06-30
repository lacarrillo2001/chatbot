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

  try {
    await pool.query('UPDATE usuarios SET etapa_flujo = $1 WHERE id = $2', [nuevaEtapa, id]);
    res.json({ mensaje: 'Etapa actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la etapa' });
  }
});

export default router;
