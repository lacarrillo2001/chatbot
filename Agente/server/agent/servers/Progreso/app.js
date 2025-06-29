import express from 'express';
import emocionesRoutes from './emociones.js';
import estadisticasRoutes from './estadisticasTest.js';
import cors from 'cors'; // o: const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use('/api/emociones', emocionesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
