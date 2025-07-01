// src/components/EtapaInfoModal.tsx

import React from 'react';
import "./EtapaInfoModal.css";

interface Props {
  etapa: string;
  onClose: () => void;
}
//gdgdgd
const getEtapaDescripcion = (etapa: string): string => {
  switch (etapa) {
    case 'inicio':
      return 'En esta etapa puedes comenzar tu primera evaluación para conocer tus niveles de ansiedad social.sdasdasdasdasdasd';
    case 'test_completado':
      return 'Has completado el test. Ahora puedes explorar tus emociones e interactuar con el asistente.';
    case 'emocion_registrada':
      return 'Has registrado una emoción. Continúa explorando o reflexionando sobre tu estado actual.';
    case 'completo':
      return 'Has completado todas las etapas disponibles. Puedes seguir revisando tus resultados.';
    default:
      return 'Etapa desconocida.';
  }
};

const EtapaInfoModal: React.FC<Props> = ({ etapa, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Etapa actualsss: <span style={{ textTransform: "capitalize" }}>{etapa}</span></h2>
        <p>{getEtapaDescripcion(etapa)}</p>
        <button onClick={onClose}>Cerrarrrrr</button>
      </div>
    </div>
  );
};

export default EtapaInfoModal;
