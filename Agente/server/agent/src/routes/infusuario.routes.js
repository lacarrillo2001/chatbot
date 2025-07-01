import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/info', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido en la URL' });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.seudonimo,
        u.etapa_flujo,
        ip.nombre,
        ip.apellido,
        ip.correo,
        ip.universidad,
        ip.carrera,
        ip.semestre,
        ip.genero,
        ip.edad
      FROM usuarios u
      LEFT JOIN informacion_personal ip ON u.id = ip.id
      WHERE u.token_info = $1
      `,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado con ese token' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener información pública:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
