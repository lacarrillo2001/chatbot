import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

interface Props {
  onLoginClick?: () => void;
}

const Register: React.FC<Props> = ({ onLoginClick }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    correo: "",
    edad: "",
    fechanacimiento: "",
    telefono: "",
    direccion: "",
    universidad: "",
    carrera: "",
    semestre: "",
    genero: ""
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    const baseUrl = import.meta.env.VITE_API_AUTH;
        const url = `${baseUrl}/register`;
    try {
      const response = await axios.post(url, {
        ...form,
        username: form.username.trim(),
        password: form.password.trim(),
        edad: parseInt(form.edad)
      });
      //setMessage("✅ Registro exitoso. ID: " + response.data.id);
      setError(null);
      setShowModal(true); // ← Agregar esta línea
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("❌ Error desconocido al registrar.");
      }
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };
  
  const handleModalClose = () => {
  setShowModal(false);
  if (onLoginClick) {
    onLoginClick();
  }
};

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2 className="register-title">Crear nueva cuenta</h2>
          <p className="register-subtitle">Completa tus datos para comenzar tu journey de bienestar</p>
        </div>

        <form onSubmit={handleFormSubmit} className="register-form">
          <h3 className="register-section-title">Información de Cuenta</h3>
          
          <div className="register-input-group">
            <label className="register-label">Usuario *</label>
            <input
              className="register-input"
              name="username"
              placeholder="Elige tu nombre de usuario"
              value={form.username}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Contraseña *</label>
            <input
              className="register-input"
              name="password"
              type="password"
              placeholder="Crea una contraseña segura"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <h3 className="register-section-title">Información Personal</h3>

          <div className="register-input-group">
            <label className="register-label">Nombre *</label>
            <input
              className="register-input"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Apellido *</label>
            <input
              className="register-input"
              name="apellido"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Correo Electrónico *</label>
            <input
              className="register-input"
              name="correo"
              placeholder="tu@email.com"
              type="email"
              value={form.correo}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Edad *</label>
            <input
              className="register-input"
              name="edad"
              placeholder="Tu edad"
              type="number"
              min="16"
              max="100"
              value={form.edad}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Fecha de Nacimiento</label>
            <input
              className="register-input"
              name="fechanacimiento"
              type="date"
              value={form.fechanacimiento}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Género</label>
            <select
              className="register-select"
              name="genero"
              value={form.genero}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Selecciona tu género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          <h3 className="register-section-title">Información de Contacto</h3>

          <div className="register-input-group">
            <label className="register-label">Teléfono</label>
            <input
              className="register-input"
              name="telefono"
              placeholder="Tu número de teléfono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="register-input-group full-width">
            <label className="register-label">Dirección</label>
            <input
              className="register-input"
              name="direccion"
              placeholder="Tu dirección completa"
              value={form.direccion}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <h3 className="register-section-title">Información Académica</h3>

          <div className="register-input-group">
            <label className="register-label">Universidad</label>
            <input
              className="register-input"
              name="universidad"
              placeholder="Tu universidad"
              value={form.universidad}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Carrera</label>
            <input
              className="register-input"
              name="carrera"
              placeholder="Tu carrera"
              value={form.carrera}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Semestre</label>
            <input
              className="register-input"
              name="semestre"
              placeholder="Semestre actual"
              value={form.semestre}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className="register-message success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="register-message error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={
              isLoading ||
              !form.username.trim() ||
              !form.password.trim() ||
              !form.nombre.trim() ||
              !form.apellido.trim() ||
              !form.correo.trim() ||
              !form.edad.trim()
            }

          >
            {isLoading ? (
              <div className="register-loading-container">
                <div className="register-spinner"></div>
                <span>Creando cuenta...</span>
              </div>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="register-footer-text">
            ¿Ya tienes cuenta?{" "}
            <button 
              type="button"
              onClick={onLoginClick}
              className="register-link register-link-button"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>


        {showModal && (
  <div className="verification-modal-overlay">
    <div className="verification-modal">
      <div className="verification-modal-header">
        <div className="verification-modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <h3 className="verification-modal-title">¡Cuenta creada exitosamente!</h3>
        <p className="verification-modal-subtitle">Revisa tu correo para verificar tu cuenta</p>
      </div>
      
      <div className="verification-modal-content">
        <p className="verification-modal-text">
          Hemos enviado un enlace de verificación a:
        </p>
        <p className="verification-modal-email">{form.correo}</p>
        <p className="verification-modal-instructions">
          Haz clic en el enlace del correo para activar tu cuenta y poder iniciar sesión.
        </p>
      </div>

      <div className="verification-modal-footer">
        <button
          onClick={handleModalClose}
          className="verification-modal-button"
        >
          Entendido, ir al login
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default Register;