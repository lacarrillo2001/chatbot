// ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import './auth-styles.css'; // Importa el archivo CSS

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("resetToken");
    if (t) {
      setToken(t);
    } else {
      setStatus("Token no encontrado.");
    }
  }, []);

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setStatus('❌ Por favor ingresa una nueva contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('✅ Contraseña actualizada correctamente. Redirigiendo al login...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus('❌ Error al enviar la nueva contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleReset();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2V7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h2 className="auth-title">Restablecer Contraseña</h2>
          <p className="auth-subtitle">Ingresa tu nueva contraseña segura</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <label className="input-label">Nueva Contraseña</label>
            <div className="input-container">
              <input
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="auth-input"
                disabled={isLoading}
              />
              
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={isLoading || !newPassword.trim()}
            className="auth-button"
          >
            {isLoading ? (
              <div className="button-loader">
                <svg className="spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </div>
            ) : (
              'Guardar Nueva Contraseña'
            )}
          </button>

          {status && (
            <div className={`status-message ${status.includes('✅') ? 'status-success' : 'status-error'}`}>
              {status}
            </div>
          )}
        </div>

        <div className="auth-footer">
          <a href="/" className="auth-link">← Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;