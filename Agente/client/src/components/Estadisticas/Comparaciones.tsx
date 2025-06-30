import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';
import type { ResultadoTest } from './DiarioEmocional';

interface ComparacionesProps {
  resultadosTest: ResultadoTest[];
}

const Comparaciones: React.FC<ComparacionesProps> = ({ resultadosTest }) => {
  // Datos para gráficos
  const datosGlobales = resultadosTest.map(test => ({
    nombre: test.nombre,
    Total: parseInt(test.puntuacion_total),
    fecha: new Date(test.fecha).toLocaleDateString()
  }));

  const datosLSPS = resultadosTest
    .filter(test => test.test_id.toLowerCase().includes("lsps") || test.test_id.toLowerCase().includes("lsas"))
    .map(test => ({
      fecha: new Date(test.fecha).toLocaleDateString(),
      Total: parseInt(test.puntuacion_total),
    }));

  const datosSINP = resultadosTest
    .filter(test => test.test_id.toLowerCase().includes("sinp") || test.test_id.toLowerCase().includes("spin"))
    .map(test => ({
      fecha: new Date(test.fecha).toLocaleDateString(),
      Total: parseInt(test.puntuacion_total),
    }));

  return (
    <div className="tab-content">
      <div className="comparacion-section">
        <h2>📈 Análisis Comparativo</h2>

        {resultadosTest.length === 0 ? (
          <div className="estado-vacio">
            <div className="estado-vacio-icon">📊</div>
            <h3>¡Los gráficos te están esperando!ldkfnsdkfjndskj</h3>
            <p>Las comparaciones y análisis estadísticos aparecerán aquí una vez que tengas datos de tests.</p>
            
            <div className="sugerencias">
              <h4>📈 ¿Qué verás aquí cuando tengas datos?</h4>
              <ul>
                <li>Gráficos de evolución temporal de tus puntajes</li>
                <li>Comparaciones entre diferentes tipos de tests</li>
                <li>Tendencias y patrones en tu progreso</li>
                <li>Análisis visual de tu bienestar a lo largo del tiempo</li>
              </ul>
            </div>

            
          </div>
        ) : resultadosTest.length === 1 ? (
          <>
            <div className="sugerencias">
              <h4>🎯 ¡Buen comienzo!</h4>
              <ul>
                <li>Has completado tu primer test, ¡felicidades!</li>
                <li>Para ver comparaciones y tendencias, necesitas al menos 2 tests</li>
                <li>Realiza el mismo test después de un tiempo para ver tu progreso</li>
                <li>Prueba diferentes tipos de tests para una evaluación más completa</li>
              </ul>
              <div className="botones-accion">
                <button className="boton-accion" onClick={() => alert('Redirigir a página de tests')}>
                  📝 Realizar Otro Test
                </button>
              </div>
            </div>

            <div className="comparacion-card card">
              <h3>📊 Tu Primer Resultado</h3>
              <div className="grafico-contenedor">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosGlobales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Sugerencia para seguir mejorando 
            <div className="sugerencias">
              <h4>💡 Análisis de tu progreso:</h4>
              <ul>
                <li>Revisa las tendencias en tus gráficos para identificar patrones</li>
                <li>Compara diferentes períodos para ver tu evolución</li>
                <li>Considera factores externos que pueden influir en los cambios</li>
              </ul>
              <div className="botones-accion">
               
              </div>
            </div>*/}

            <div className="comparacion-card card">
              <h3>🌐 Comparación Global de Tests</h3>
              <div className="grafico-contenedor">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosGlobales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {datosLSPS.length > 0 && (
              <div className="comparacion-card card">
                <h3>🔵 Evolución Tests LSPS/LSAS</h3>
                <div className="grafico-contenedor">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={datosLSPS}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Total" stroke="#00bcd4" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {datosSINP.length > 0 && (
              <div className="comparacion-card card">
                <h3>🟢 Evolución Tests SINP/SPIN</h3>
                <div className="grafico-contenedor">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={datosSINP}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Total" stroke="#4caf50" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comparaciones;
