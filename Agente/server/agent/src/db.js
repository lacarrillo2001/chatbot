import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtener __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Ruta al certificado SSL (descargado desde Aiven)
const caPath = path.resolve(__dirname, './certs/ca.pem');

// Crear el pool de conexión con SSL
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath).toString(),
  },
});

export default pool;
