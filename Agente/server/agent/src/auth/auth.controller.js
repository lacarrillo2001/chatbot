import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { sendResetEmail,sendVerificationEmail} from './emailService.js';

dotenv.config();

export const register = async (req, res) => {
  console.log("BODY:", req.body); 

  const {
    username,
    password,
    nombre,
    apellido,
    correo,
    edad,
    fechanacimiento,
    telefono,
    direccion,
    universidad,
    carrera,
    semestre,
    genero
  } = req.body;

  try {
    // 🔍 1. Verificar si el username ya existe
    const userCheck = await pool.query(
      'SELECT 1 FROM inicio_sesion WHERE username = $1',
      [username]
    );
    if (userCheck.rowCount > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // 🔍 2. Verificar si el correo ya está registrado
    const emailCheck = await pool.query(
      'SELECT 1 FROM public.informacion_personal WHERE correo = $1',
      [correo]
    );
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // 🔐 3. Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    // 🔑 4. Generar UUID para el nuevo usuario
    const result = await pool.query('SELECT gen_random_uuid() as id');
    const userId = result.rows[0].id;

    // 🧩 5. Insertar en tabla usuarios
   await pool.query(
      `INSERT INTO public.usuarios (id, seudonimo, permisos, fecha_registro)
      VALUES ($1, $2, $3, NOW())`,
      [userId, username, '{}']  // ✅ Solo 3 parámetros, como corresponde
    );
    // 🔐 6. Insertar en inicio_sesion
    await pool.query(
      `INSERT INTO public.inicio_sesion (id, username, contrasena, fecha_ultimo_inicio)
       VALUES ($1, $2, $3, NOW())`,
      [userId, username, hashed]
    );

    // 👤 7. Insertar en informacion_personal
    await pool.query(
      `INSERT INTO public.informacion_personal (
        id, nombre, apellido, correo, edad, fechanacimiento, telefono,
        direccion, universidad, carrera, semestre, genero
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12
      )`,
      [
        userId, nombre, apellido, correo, edad, fechanacimiento, telefono,
        direccion, universidad, carrera, semestre, genero
      ]
    );

    // 📩 8. Generar token y fecha de expiración (justo antes del UPDATE)
      const verifyToken = uuidv4();
      const expiration = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
      const expirationUTC = new Date(expiration.toISOString()); // 🔁 fuerza UTC

      console.log("🔗 Token generado:", verifyToken);
      console.log("📆 Expira en:", expiration.toISOString());

      await pool.query(
        `UPDATE public.usuarios 
        SET reset_token = $1, reset_token_expiration = $2 
        WHERE id = $3`,
        [verifyToken, expirationUTC, userId]
      );

      await sendVerificationEmail(correo, verifyToken);

    // ✅ 9. Éxito
    res.status(201).json({ message: 'Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta.', id: userId });
    
  } catch (error) {
    console.error('❌ Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar por username o correo
    const result = await pool.query(
    `SELECT i.*, ip.correo 
    FROM public.inicio_sesion i
    JOIN public.informacion_personal ip ON i.id = ip.id
    WHERE i.username = $1 OR ip.correo = $1`,
    [username]
  );


    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Comparar contraseña
    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    // Verifica si el correo del usuario está verificado
    const correoCheck = await pool.query(
      `SELECT correo_verificado FROM informacion_personal WHERE id = $1`,
      [user.id]
    );

    if (!correoCheck.rows[0].correo_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu correo electrónico para iniciar sesión' });
    }

    res.json({ message: 'Login exitoso', token, id: user.id });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error al hacer login' });
  }
};

export const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const token = uuidv4();
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const update = await pool.query(
      `UPDATE public.usuarios
      SET reset_token = $1,
          reset_token_expiration = $2
      WHERE id IN (
        SELECT id FROM public.informacion_personal WHERE correo = $3
      )`,
      [token, expiration, correo]
    );

    if (update.rowCount === 0) {
      return res.status(200).json({ message: 'Si el correo existe, se enviará un enlace.' });
    }

    await sendResetEmail(correo, token);
    res.json({ message: 'Correo enviado con instrucciones.' });
  } catch (err) {
    console.error('❌ Error forgotPassword:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Buscar al usuario en tabla usuarios por el token
    const user = await pool.query(
      `SELECT * FROM public.usuarios
       WHERE reset_token = $1 AND reset_token_expiration > NOW()`,
      [token]
    );

    if (user.rowCount === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // ✅ Aquí defines userId correctamente
    const userId = user.rows[0].id;

    // 2. Hashear nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // 3. Actualizar contraseña en inicio_sesion
    await pool.query(
      `UPDATE public.inicio_sesion
       SET contrasena = $1
       WHERE id = $2`,
      [hashed, userId]
    );

    // 4. Limpiar token en usuarios
    await pool.query(
      `UPDATE public.usuarios
       SET reset_token = NULL,
           reset_token_expiration = NULL
       WHERE id = $1`,
      [userId]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error resetPassword:', err);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};


export const verifyEmail = async (req, res) => {
  const token = req.params.token;
  console.log("🔐 Token recibido:", `[${token}]`);

  try {
    const result = await pool.query(
      `SELECT
        id,
        reset_token,
        reset_token_expiration,
        NOW() AS ahora,
        reset_token_expiration > NOW() AS comparacion_directa,
        reset_token_expiration > (NOW() AT TIME ZONE 'UTC') AS comparacion_utc
      FROM usuarios
      WHERE reset_token = $1;`,
      [token]
    );

    console.log("📦 Resultado SQL:", result.rows);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const userId = result.rows[0].id;

    await pool.query(
      `UPDATE public.informacion_personal
       SET correo_verificado = TRUE
       WHERE id = $1`,
      [userId]
    );

    await pool.query(
      `UPDATE public.usuarios
       SET reset_token = NULL,
           reset_token_expiration = NULL
       WHERE id = $1`,
      [userId]
    );

    res.json({ message: 'Correo verificado correctamente' });
  } catch (err) {
    console.error('❌ Error verificar correo:', err);
    res.status(500).json({ error: 'No se pudo verificar el correo' });
  }
};
