import React, { useState } from "react";
import axios from "axios";
import "./Login.css";


interface Props {
  onLoginSuccess: (token: string, userId: string) => void;
  onRegisterClick?: () => void;
  onForgotClick: () => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess, onRegisterClick , onForgotClick}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    

    const baseUrl = import.meta.env.VITE_API_AUTH;
        const url = `${baseUrl}/login`;
    try {
      const res = await axios.post(url, {
        username,
        password
      });

      const { token, id } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      onLoginSuccess(token, id);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al iniciar sesión.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <h2 className="login-title">Bienvenido de vuelta</h2>
          <p className="login-subtitle">Inicia sesión para continuar tu progreso</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="login-input"
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="login-error-container">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span className="login-error-text">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <div className="login-loading-container">
                <div className="login-spinner"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            ¿No tienes cuenta?{" "}
            {onRegisterClick ? (
              <button 
                type="button"
                onClick={onRegisterClick}
                className="login-link login-link-button"
              >
                Regístrate aquí
              </button>
            ) : (
              <a href="/register" className="login-link">
                Regístrate aquí
              </a>
            )}
          </p>

          <p className="forgot-password-container">
            <button className="forgot-password-btn" onClick={onForgotClick}>
              ¿Olvidaste tu contraseña?
            </button>
          </p>


        </div>
      </div>
    </div>
  );
};

export default Login;