import React, { useState } from 'react';
import './auth-styles.css'; // Importa el archivo CSS

export const ForgotPassword: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!correo.trim()) {
      setMensaje('❌ Por favor ingresa tu correo electrónico');
      return;
    }

    if (!isValidEmail(correo)) {
      setMensaje('❌ Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMensaje('✅ ' + (data.message || 'Enlace de recuperación enviado a tu correo'));
      } else {
        setMensaje('❌ ' + (data.error || 'Error al enviar el enlace'));
      }
    } catch (error) {
      setMensaje('❌ Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="auth-title">Recuperar Contraseña</h2>
          <p className="auth-subtitle">Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div className="input-container">
              <input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !correo.trim()}
            className="auth-button"
          >
            {isLoading ? (
              <div className="button-loader">
                <svg className="spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </div>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </button>

          {mensaje && (
            <div className={`status-message ${mensaje.includes('✅') ? 'status-success' : 'status-error'}`}>
              {mensaje}
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p>¿Recordaste tu contraseña?</p>
          <a href="/" className="auth-link">← Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;