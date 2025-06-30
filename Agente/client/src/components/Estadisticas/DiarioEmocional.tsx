import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Resumen from './Resumen';
import TestsDetallados from './TestsDetallados';
import Comparaciones from './Comparaciones';
import Emociones from './Emociones';
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

  const tabs = [
    { id: 'resumen', label: '📊 Resumen', icon: '📊' },
    { id: 'tests', label: '🧠 Tests Detallados', icon: '🧠' },
    { id: 'comparaciones', label: '📈 Comparaciones', icon: '📈' },
    { id: 'emociones', label: '💭 Emociones', icon: '💭' }
  ];

  const renderContenido = () => {
    switch (tabActiva) {
      case 'resumen':
        return <Resumen resultadosTest={resultadosTest} emociones={emociones} setTabActiva={setTabActiva} />;
      case 'tests':
        return <TestsDetallados resultadosTest={resultadosTest} />;
      case 'comparaciones':
        return <Comparaciones resultadosTest={resultadosTest} />;
      case 'emociones':
        return <Emociones emociones={emociones} />;
      default:
        return <Resumen resultadosTest={resultadosTest} emociones={emociones} setTabActiva={setTabActiva} />;
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
export type { ResultadoTest, EmocionRespuesta, TabType };