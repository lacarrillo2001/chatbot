// src/components/BotonesSeleccionTest.tsx
import React from "react";
import "./BotonesSeleccionTest.css";

interface Props {
  onSelect: (mensaje: string) => void;
}

const BotonesSeleccionTest: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="test-buttons-container">
      <button onClick={() => onSelect("Quiero hacer el test SINP")} className="test-button">
        Iniciar test SINP
      </button>
      <button onClick={() => onSelect("Iniciar test LSPS")} className="test-button">
        Iniciar test LSPS
      </button>
    </div>
  );
};

export default BotonesSeleccionTest;
