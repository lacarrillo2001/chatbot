/*import axios from 'axios';

const message = "Hi, I'm Bob, and I live in SF.";

axios.post('http://127.0.0.1:5000/ask', {
  message: message
})
.then(response => {
  console.log('Response from Python Agent:', response.data.response);
})
.catch(error => {
  console.error('Error:', error);
});
import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';
import dotenv from 'dotenv';



dotenv.config();

const app = express();

// ✅ CORS abierto (compatible con Node 22)
app.use(cors());

// ✅ Middleware para JSON
app.use(express.json());

// ✅ Rutas de autenticación
app.use('/api/auth', authRoutes);

export default app;*/
// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import emocionesRoutes from './routes/emociones.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import simulacionesRoutes from './routes/simulaciones.routes.js';
import chatRoutes from './routes/chat.routes.js';
import simuladorRoutes from './routes/simulador.routes.js';

import pool from './db.js'; // conexión PostgreSQL

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);                // 🟢 Login, registro, recuperación
app.use('/api/emociones', emocionesRoutes);      // PostgreSQL
app.use('/api/estadisticas', estadisticasRoutes);// PostgreSQL
app.use('/api/simulaciones', simulacionesRoutes);// MongoDB
app.use('/api/chat', chatRoutes);                // Chat con agente
app.use('/api/simulador', simuladorRoutes);      // Simulador social

// Ruta de prueba de conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
