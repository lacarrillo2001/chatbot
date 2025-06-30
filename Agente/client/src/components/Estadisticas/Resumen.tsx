import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { ResultadoTest, EmocionRespuesta, TabType } from './DiarioEmocional';

interface ResumenProps {
  resultadosTest: ResultadoTest[];
  emociones: EmocionRespuesta[];
  setTabActiva: (tab: TabType) => void;
}

const Resumen: React.FC<ResumenProps> = ({ resultadosTest, emociones, setTabActiva }) => {
  // Datos para gráficos
  const datosGlobales = resultadosTest.map(test => ({
    nombre: test.nombre,
    Total: parseInt(test.puntuacion_total),
    fecha: new Date(test.fecha).toLocaleDateString()
  }));

  // Estadísticas para el resumen
  const estadisticas = {
    totalTests: resultadosTest.length,
    totalEmociones: emociones.length,
    promedioTests: resultadosTest.length > 0 
      ? Math.round(resultadosTest.reduce((acc, test) => acc + parseInt(test.puntuacion_total), 0) / resultadosTest.length)
      : 0,
    ultimoTest: resultadosTest.length > 0 
      ? new Date(Math.max(...resultadosTest.map(test => new Date(test.fecha).getTime()))).toLocaleDateString()
      : 'N/A'
  };

  const sinDatos = resultadosTest.length === 0 && emociones.length === 0;

  if (sinDatos) {
    return (
      <div className="tab-content">
        <div className="bienvenida">
          <h2>¡Bienvenido a tu Diario Emocional! 🌟</h2>
          <p>Comienza tu journey de autoconocimiento y bienestar mental</p>
        </div>

        <div className="estado-vacio">
          <div className="estado-vacio-icon">🚀</div>
          <h3>¡Empecemos tu seguimiento!</h3>
          <p>Para obtener insights valiosos sobre tu bienestar, necesitas comenzar registrando información.</p>
          
          <div className="sugerencias">
            <h4>💡 Te sugerimos empezar con:</h4>
            <ul>
              <li>Realizar tu primer test psicológico para establecer una línea base</li>
              <li>Registrar tus emociones diarias para identificar patrones</li>
              <li>Volver regularmente para hacer seguimiento de tu progreso</li>
              <li>Revisar tus resultados para entender tu evolución</li>
            </ul>
          </div>

          <div className="botones-accion">
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2>📊 Resumen General</h2>
      
      <div className="dashboard">
        <div
          className="stat-card"
          onClick={() => setTabActiva('tests')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-number">{estadisticas.totalTests}</div>
          <div className="stat-label">Tests Realizados</div>
        </div>

        <div className="stat-card"
        onClick={() => setTabActiva('emociones')}
          style={{ cursor: 'pointer' }}>
          <div className="stat-number">{estadisticas.totalEmociones}</div>
          <div className="stat-label">Registros Emocionales</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{estadisticas.promedioTests}</div>
          <div className="stat-label">Puntaje Promedio</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{estadisticas.ultimoTest}</div>
          <div className="stat-label">Último Test</div>
        </div>
      </div>

      {/* Sugerencias para seguir mejorando */}
      {(resultadosTest.length < 3 || emociones.length < 5) && (
        <div className="sugerencias">
          <h4>🎯 Recomendaciones para ti:</h4>
          <ul>
            {resultadosTest.length < 3 && (
              <li>Realiza más tests para obtener un seguimiento más completo de tu progreso</li>
            )}
            {emociones.length < 5 && (
              <li>Registra más emociones diariamente para identificar patrones importantes</li>
            )}
            {resultadosTest.length === 1 && (
              <li>¡Felicidades por tu primer test! Continúa regularmente para ver tu evolución</li>
            )}
          </ul>
          <div className="botones-accion">
            {resultadosTest.length < 3 && (
              <button className="boton-accion" onClick={() => alert('Redirigir a página de tests')}>
                🧠 Realizar Otro Test
              </button>
            )}
            {emociones.length < 5 && (
              <button className="boton-accion secundario" onClick={() => window.dispatchEvent(new CustomEvent('cambiarModulo', { detail: 'emociones' }))}>
                💭 Registrar Emoción
              </button>
            )}
          </div>
        </div>
      )}

      {resultadosTest.length > 0 && (
        <div className="card">
          <h3>📈 Evolución General de Tests</h3>
          <div className="grafico-contenedor">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGlobales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Total" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {resultadosTest.length > 0 && (
        <div className="card">
          <h3>🎯 Último Test Realizado</h3>
          {(() => {
            const ultimoTest = resultadosTest.reduce((ultimo, actual) => 
              new Date(actual.fecha) > new Date(ultimo.fecha) ? actual : ultimo
            );
            return (
              <div>
                <h4>{ultimoTest.nombre}</h4>
                <div className="puntaje-total">{ultimoTest.puntuacion_total} puntos</div>
                <div className="interpretacion">{ultimoTest.interpretacion}</div>
                <div className="fecha">📅 {new Date(ultimoTest.fecha).toLocaleString()}</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Resumen;
