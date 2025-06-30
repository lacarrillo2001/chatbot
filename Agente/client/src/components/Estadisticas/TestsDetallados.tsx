import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { ResultadoTest } from './DiarioEmocional';

interface TestsDetalladosProps {
  resultadosTest: ResultadoTest[];
}

const TestsDetallados: React.FC<TestsDetalladosProps> = ({ resultadosTest }) => {
  const [selectedTest, setSelectedTest] = useState<ResultadoTest | null>(null);

  const closeModal = () => {
    setSelectedTest(null);
  };

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🧠 Tests Realizados</h2>
        <button
          className="boton-test"
          onClick={() => window.dispatchEvent(new CustomEvent('cambiarModulo', { detail: 'chatevaluacion' }))}
        >
          📝 Realizar Test
        </button>
      </div>

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
        </div>
      ) : (
        <>
          <div className="card">
            <h3>📊 Resumen: {resultadosTest.length} tests realizados</h3>
            
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Test
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Puntaje Total
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Social/Miedo
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Rendimiento
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Fecha
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosTest.map((test, idx) => (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid #dee2e6'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ 
                        padding: '12px',
                        fontWeight: '500'
                      }}>
                        {test.nombre}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#0066cc'
                      }}>
                        {test.puntuacion_total}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center'
                      }}>
                        {test["puntaje_social(miedo )"] || '-'}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center'
                      }}>
                        {test["puntaje_rendimiento(evitacion)"] || '-'}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        {new Date(test.fecha).toLocaleDateString()}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center'
                      }}>
                        <button
                          onClick={() => setSelectedTest(test)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal para mostrar detalles */}
          {selectedTest && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative'
              }}>
                <button
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>

                <h3>{selectedTest.nombre}</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div><strong>Puntaje Total:</strong> {selectedTest.puntuacion_total}</div>
                    <div><strong>Fecha:</strong> {new Date(selectedTest.fecha).toLocaleString()}</div>
                  </div>
                  
                  {(selectedTest["puntaje_social(miedo )"] || selectedTest["puntaje_rendimiento(evitacion)"]) && (
                    <div style={{ marginBottom: '15px' }}>
                      {selectedTest["puntaje_social(miedo )"] && (
                        <div><strong>🎭 Social (miedo):</strong> {selectedTest["puntaje_social(miedo )"]}</div>
                      )}
                      {selectedTest["puntaje_rendimiento(evitacion)"] && (
                        <div><strong>🏃 Rendimiento (evitación):</strong> {selectedTest["puntaje_rendimiento(evitacion)"]}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Gráfico */}
                {selectedTest["puntaje_social(miedo )"] && selectedTest["puntaje_rendimiento(evitacion)"] && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>📊 Desglose por Categoría</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { categoria: 'Miedo Social', valor: parseInt(selectedTest["puntaje_social(miedo )"]) },
                        { categoria: 'Evitación', valor: parseInt(selectedTest["puntaje_rendimiento(evitacion)"]) }
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

                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '5px'
                }}>
                  <h4>📝 Interpretación:</h4>
                  <p style={{ lineHeight: '1.5', margin: 0 }}>
                    {selectedTest.interpretacion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestsDetallados;
