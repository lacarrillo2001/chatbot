import React from "react";
import './UserInfoModal.css';

interface Props {
  info: {
    nombre: string;
    correo: string;
    universidad: string;
    carrera?: string;
    semestre?: string;
  };
  onClose: () => void;
}

const UserInfoModal: React.FC<Props> = ({ info, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Información del Usuario</h2>
        <p><strong>Nombre:</strong> {info.nombre}</p>
        
        <p><strong>Correo:</strong> {info.correo}</p>
        {/* <p><strong>Universidad:</strong> {info.universidad}</p> */}
        {info.carrera && <p><strong>Carrera:</strong> {info.carrera}</p>}
        {info.semestre && <p><strong>Semestre:</strong> {info.semestre}</p>}
        <button className="cerrar-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default UserInfoModal;
