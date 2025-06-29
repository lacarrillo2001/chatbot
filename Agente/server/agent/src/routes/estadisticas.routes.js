import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/resultados-test/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT r.test_id, t.nombre, r.puntuacion_total, r.interpretacion, r.fecha,r."puntaje_social(miedo )", r."puntaje_rendimiento(evitacion)"
      FROM resultados_test r
      JOIN tests t ON r.test_id = t.id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resultados de test' });
  }
});

export default router;
