import React, { useEffect, useState } from 'react';
import './auth-styles.css';
import { useParams } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState('Verificando...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_AUTH;
        const url = `${baseUrl}/verify-email/${token}`;

        console.log("🧪 Token recibido:", token);
        console.log("🔗 Haciendo fetch a:", url);

        const res = await fetch(url);

        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          const errorText = contentType?.includes("application/json")
            ? await res.json()
            : await res.text();

          throw new Error(typeof errorText === 'string' ? errorText : errorText?.error || 'Error desconocido');
        }

        setStatus('✅ Tu correo ha sido verificado con éxito. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } catch (err: any) {
        console.error('❌ Error al verificar el correo:', err);
        setStatus(`❌ ${err.message || 'Ocurrió un error inesperado.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            {isLoading ? (
              <svg className="spinner" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : status.includes('✅') ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="auth-title">Verificación de Correo</h2>
          <p className="auth-subtitle">
            {isLoading ? 'Procesando tu verificación...' : 'Resultado de la verificación'}
          </p>
        </div>

        <div className="verify-content">
          {!isLoading && (
            <p style={{ color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>
          )}
        </div>

        {!isLoading && (
          <div className="auth-footer">
            <a href="/" className="auth-link">← Volver al inicio de sesión</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
