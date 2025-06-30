import React, { useState, useMemo } from 'react';
import type { EmocionRespuesta } from './DiarioEmocional';

interface EmocionesProps {
  emociones: EmocionRespuesta[];
}

const Emociones: React.FC<EmocionesProps> = ({ emociones }) => {
  const [filtroEmocion, setFiltroEmocion] = useState<string>('todas');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Obtener emociones únicas para el filtro
  const emocionesUnicas = useMemo(() => {
    const emociones_set = new Set(emociones.map(e => e.emocion_identificada));
    return Array.from(emociones_set).sort();
  }, [emociones]);

  // Filtrar emociones según la selección
  const emocionesFiltradas = useMemo(() => {
    if (filtroEmocion === 'todas') return emociones;
    return emociones.filter(e => e.emocion_identificada === filtroEmocion);
  }, [emociones, filtroEmocion]);

  // Agrupar por emoción para mostrar estadísticas
  const resumenEmociones = useMemo(() => {
    const grupos = emociones.reduce((acc, emocion) => {
      const key = emocion.emocion_identificada;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grupos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 emociones
  }, [emociones]);

  const toggleExpanded = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>💬 Registro de Emociones</h2>
        <button
          className="boton-test"
          onClick={() => window.dispatchEvent(new CustomEvent('cambiarModulo', { detail: 'emociones' }))}
        >
          💭 Explorar Emociones
        </button>
      </div>

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
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen de emociones más frecuentes */}
          <div className="card">
            <h3>📊 Resumen de Emociones</h3>
            <p>Total de registros: <strong>{emociones.length}</strong></p>
            <div className="dashboard" style={{ marginTop: '15px' }}>
              {resumenEmociones.map(([emocion, cantidad]) => (
                <div key={emocion} className="stat-card" style={{ minWidth: '120px' }}>
                  <div className="stat-number">{cantidad}</div>
                  <div className="stat-label">{emocion}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="card">
            <h4>🔍 Filtrar por emoción:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              <button 
                className={`boton-accion ${filtroEmocion === 'todas' ? '' : 'secundario'}`}
                onClick={() => setFiltroEmocion('todas')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Todas ({emociones.length})
              </button>
              {emocionesUnicas.map(emocion => (
                <button
                  key={emocion}
                  className={`boton-accion ${filtroEmocion === emocion ? '' : 'secundario'}`}
                  onClick={() => setFiltroEmocion(emocion)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {emocion} ({emociones.filter(e => e.emocion_identificada === emocion).length})
                </button>
              ))}
            </div>
          </div>

          {/* Lista de emociones filtradas */}
          <div style={{ marginTop: '20px' }}>
            <h3>📝 Registros ({emocionesFiltradas.length})</h3>
            {emocionesFiltradas.map((item, idx) => (
              <div key={idx} className="card emocion-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="emocion-identificada" style={{ marginBottom: '5px' }}>
                      {item.emocion_identificada}
                    </div>
                    <div className="fecha" style={{ fontSize: '0.9em', color: '#666' }}>
                      📅 {new Date(item.fecha_respuesta).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleExpanded(idx)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '20px',
                      color: '#666'
                    }}
                  >
                    {expandedCard === idx ? '▼' : '▶'}
                  </button>
                </div>
                
                {expandedCard === idx && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    {item.descripcion_situacion && (
                      <div className="puntaje-detalle" style={{ marginBottom: '15px' }}>
                        <strong>📝 Situación:</strong> 
                        <p style={{ margin: '5px 0', lineHeight: '1.4' }}>{item.descripcion_situacion}</p>
                      </div>
                    )}

                    <div className="puntaje-detalle">
                      <strong>💬 Respuestas:</strong>
                      {[1, 2, 3, 4, 5, 6].map(n => {
                        const respuesta = item[`respuesta_${n}` as keyof EmocionRespuesta];
                        return respuesta ? (
                          <p key={n} style={{ margin: '8px 0', lineHeight: '1.4' }}>
                            <strong>{n}.</strong> {respuesta}
                          </p>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Emociones;
