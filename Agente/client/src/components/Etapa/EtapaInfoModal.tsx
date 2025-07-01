// src/components/EtapaInfoModal.tsx

import React from 'react';
import "./EtapaInfoModal.css";

interface Props {
  etapa: string;
  onClose: () => void;
}

const getEtapaDescripcion = (etapa: string): string => {
  switch (etapa) {
    case 'inicio':
      return 'Esta es la etapa inicial de tu proceso de evaluación psicológica. Aquí comenzarás tu primera evaluación para conocer y comprender tus niveles de ansiedad social. Es un punto de partida importante para entender tu estado emocional actual y establecer una línea base para tu desarrollo personal.';
    case 'test_completado':
      return 'Felicitaciones, has completado exitosamente el test de evaluación. Ahora tienes acceso a herramientas avanzadas donde puedes explorar tus emociones de manera más profunda, interactuar con nuestro asistente especializado y recibir orientación personalizada basada en tus resultados.';
    case 'emocion_registrada':
      return 'Has registrado satisfactoriamente una emoción en el sistema. Este registro es valioso para tu proceso de autoconocimiento. Te invitamos a continuar explorando otras emociones, reflexionar sobre tu estado emocional actual, o utilizar las herramientas de análisis disponibles para obtener insights más profundos.';
    case 'completo':
      return 'Excelente trabajo, has completado todas las etapas disponibles en el módulo de evaluación psicológica. Ahora puedes revisar tus resultados en cualquier momento, acceder a tu historial emocional, consultar recomendaciones personalizadas y continuar monitoreando tu progreso a lo largo del tiempo.';
    default:
      return 'La etapa actual no ha sido reconocida por el sistema. Por favor, contacta al soporte técnico si este problema persiste.';
  }
};

const EtapaInfoModal: React.FC<Props> = ({ etapa, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Información de la Etapa</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar modal">
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="etapa-badge">
            <span className="etapa-label">Etapa actual:</span>
            <span className="etapa-name">{etapa.replace('_', ' ')}</span>
          </div>
          
          <div className="descripcion-container">
            <p className="descripcion-text">{getEtapaDescripcion(etapa)}</p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default EtapaInfoModal;