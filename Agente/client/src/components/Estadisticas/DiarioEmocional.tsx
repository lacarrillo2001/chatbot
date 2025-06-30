import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';
import './DiarioEmocional.css';

interface ResultadoTest {
  test_id: string;
  nombre: string;
  puntuacion_total: string;
  interpretacion: string;
  fecha: string;
  "puntaje_social(miedo )"?: string;
  "puntaje_rendimiento(evitacion)"?: string;
}

interface EmocionRespuesta {
  emocion_id: string;
  descripcion: string | null;
  emocion_identificada: string;
  descripcion_situacion: string;
  respuesta_1: string;
  respuesta_2?: string;
  respuesta_3?: string;
  respuesta_4?: string;
  respuesta_5?: string;
  respuesta_6?: string;
  fecha_respuesta: string;
}

interface DiarioEmocionalProps {
  userId: string;
}

type TabType = 'resumen' | 'tests' | 'comparaciones' | 'emociones';

const DiarioEmocional: React.FC<DiarioEmocionalProps> = ({ userId }) => {
  const [emociones, setEmociones] = useState<EmocionRespuesta[]>([]);
  const [resultadosTest, setResultadosTest] = useState<ResultadoTest[]>([]);
  const [tabActiva, setTabActiva] = useState<TabType>('resumen');

   const urle = import.meta.env.VITE_API_EMOCIREUL;
   console.log(urle)
   const urlesta = import.meta.env.VITE_API_RESULTEST;
   console.log(urlesta)
  useEffect(() => {
    axios
      .get(`${urle}/${userId}`)
      .then((res) => setEmociones(res.data))
      .catch((err) => console.error('Error emociones:', err));

    axios
      .get(`${urlesta}/${userId}`)
      .then((res) => setResultadosTest(res.data))
      .catch((err) => console.error('Error test:', err));
  }, [userId]);

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

  const tabs = [
    { id: 'resumen', label: '📊 Resumen', icon: '📊' },
    { id: 'tests', label: '🧠 Tests Detallados', icon: '🧠' },
    { id: 'comparaciones', label: '📈 Comparaciones', icon: '📈' },
    { id: 'emociones', label: '💭 Emociones', icon: '💭' }
  ];

  const renderResumen = () => {
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
          <div className="stat-card">
            <div className="stat-number">{estadisticas.totalTests}</div>
            <div className="stat-label">Tests Realizados</div>
          </div>
          <div className="stat-card">
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
                <button className="boton-accion secundario" onClick={() => alert('Redirigir a registro de emociones')}>
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

  const renderTests = () => (
    <div className="tab-content">
      <h2>🧠 Tests Detallados</h2>
      
      {resultadosTest.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icon">📝</div>
          <h3>¡Es hora de conocerte mejor!</h3>
          <p>Los tests psicológicos te ayudan a entender aspectos importantes de tu bienestar mental y emocional.</p>
          
          <div className="sugerencias">
            <h4>🎯 ¿Por qué realizar tests?</h4>
            <ul>
              <li>Obtén una evaluación objetiva de tu estado emocional</li>
              <li>Identifica áreas de fortaleza y oportunidades de mejora</li>
              <li>Haz seguimiento de tu progreso a lo largo del tiempo</li>
              <li>Recibe interpretaciones profesionales de tus resultados</li>
            </ul>
          </div>

          <div className="botones-accion">
            
          </div>
        </div>
      ) : (
        <>
          {/* Sugerencia para continuar haciendo tests */}
          <div className="sugerencias">
            <h4>💡 Tip para un mejor seguimiento:</h4>
            <ul>
              <li>Realiza tests regularmente para monitorear cambios</li>
              <li>Considera hacer el mismo test después de un tiempo para ver tu progreso</li>
              <li>Combina diferentes tipos de tests para una evaluación integral</li>
            </ul>
            <div className="botones-accion">
         
            </div>
          </div>

          {resultadosTest.map((test, idx) => (
            <div key={idx} className="card test-card">
              <h3>{test.nombre}</h3>
              <div className="puntaje-total">
                Puntaje Total: {test.puntuacion_total}
              </div>

              {(test["puntaje_social(miedo )"] || test["puntaje_rendimiento(evitacion)"]) && (
                <div className="puntaje-detalle">
                  {test["puntaje_social(miedo )"] && (
                    <p><strong>🎭 Social (miedo):</strong> {test["puntaje_social(miedo )"]}</p>
                  )}
                  {test["puntaje_rendimiento(evitacion)"] && (
                    <p><strong>🏃 Rendimiento (evitación):</strong> {test["puntaje_rendimiento(evitacion)"]}</p>
                  )}
                </div>
              )}

              {/* Gráfico individual por test */}
              {test["puntaje_social(miedo )"] && test["puntaje_rendimiento(evitacion)"] && (
                <div className="grafico-contenedor">
                  <div className="grafico-titulo">📊 Desglose por Categoría</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { categoria: 'Miedo Social', valor: parseInt(test["puntaje_social(miedo )"]) },
                      { categoria: 'Evitación', valor: parseInt(test["puntaje_rendimiento(evitacion)"]) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="interpretacion">{test.interpretacion}</div>
              <div className="fecha">📅 {new Date(test.fecha).toLocaleString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderComparaciones = () => (
    <div className="tab-content">
      <div className="comparacion-section">
        <h2>📈 Análisis Comparativo</h2>

        {resultadosTest.length === 0 ? (
          <div className="estado-vacio">
            <div className="estado-vacio-icon">📊</div>
            <h3>¡Los gráficos te están esperando!</h3>
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
            {/* Sugerencia para seguir mejorando */}
            <div className="sugerencias">
              <h4>💡 Análisis de tu progreso:</h4>
              <ul>
                <li>Revisa las tendencias en tus gráficos para identificar patrones</li>
                <li>Compara diferentes períodos para ver tu evolución</li>
                <li>Considera factores externos que pueden influir en los cambios</li>
              </ul>
              <div className="botones-accion">
               
              </div>
            </div>

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

  const renderEmociones = () => (
    <div className="tab-content">
      <h2>💭 Diario Emocional</h2>
      
      {emociones.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icon">🌈</div>
          <h3>¡Tu diario emocional te espera!</h3>
          <p>Registrar tus emociones diariamente es una herramienta poderosa para el autoconocimiento y el bienestar mental.</p>
          
          <div className="sugerencias">
            <h4>💭 ¿Por qué registrar emociones?</h4>
            <ul>
              <li>Identifica patrones emocionales en tu día a día</li>
              <li>Desarrolla mayor conciencia de tus estados internos</li>
              <li>Aprende a gestionar mejor tus emociones</li>
              <li>Encuentra desencadenantes y situaciones específicas</li>
              <li>Lleva un registro de tu crecimiento emocional</li>
            </ul>
          </div>

         
        </div>
      ) : (
        <>
          {/* Sugerencias para continuar */}
          <div className="sugerencias">
            <h4>🎯 Manteniendo tu diario emocional:</h4>
            <ul>
              <li>Intenta registrar al menos una emoción por día</li>
              <li>Sé honesto y específico en tus descripciones</li>
              <li>Revisa patrones semanales o mensuales</li>
              {emociones.length < 7 && <li>¡Vas muy bien! Continúa registrando para ver patrones más claros</li>}
              {emociones.length >= 7 && <li>¡Excelente consistencia! Ya puedes identificar patrones interesantes</li>}
            </ul>
            <div className="botones-accion">
              
              {emociones.length >= 7 && (
                <button className="boton-accion secundario" onClick={() => alert('Mostrar análisis de patrones')}>
                  📊 Ver Mis Patrones
                </button>
              )}
            </div>
          </div>

          {emociones.map((item, idx) => (
            <div key={idx} className="card emocion-card">
              <div className="emocion-identificada">
                {item.emocion_identificada}
              </div>
              
              {item.descripcion_situacion && (
                <div className="puntaje-detalle">
                  <strong>📝 Situación:</strong> {item.descripcion_situacion}
                </div>
              )}

              <div className="puntaje-detalle">
                {[1, 2, 3, 4, 5, 6].map(n => {
                  const respuesta = item[`respuesta_${n}` as keyof EmocionRespuesta];
                  return respuesta ? (
                    <p key={n}><strong>💬 Respuesta {n}:</strong> {respuesta}</p>
                  ) : null;
                })}
              </div>

              <div className="fecha">📅 {new Date(item.fecha_respuesta).toLocaleString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderContenido = () => {
    switch (tabActiva) {
      case 'resumen':
        return renderResumen();
      case 'tests':
        return renderTests();
      case 'comparaciones':
        return renderComparaciones();
      case 'emociones':
        return renderEmociones();
      default:
        return renderResumen();
    }
  };

  return (
    <div className="diario-emocional">
      <nav className="navegacion-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${tabActiva === tab.id ? 'active' : ''}`}
            onClick={() => setTabActiva(tab.id as TabType)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {renderContenido()}
    </div>
  );
};

export default DiarioEmocional;