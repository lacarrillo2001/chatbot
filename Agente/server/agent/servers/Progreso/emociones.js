// emociones.js
import { Router } from 'express';
import pool from './db.js';

const router = Router();

router.get('/emociones-con-respuestas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT e.id AS emocion_id, e.descripcion, e.emocion_identificada, sr.*
      FROM emociones e
      JOIN situaciones_respuestas sr ON e.id = sr.emocion_id
      WHERE e.usuario_id = $1
      ORDER BY sr.fecha_respuesta DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener emociones con respuestas' });
  }
});

// 👇 Asegúrate de esto:
export default router;
