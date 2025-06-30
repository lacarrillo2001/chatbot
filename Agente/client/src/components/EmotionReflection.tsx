import React, { useState } from "react";
import axios from "axios";
import "./EmotionReflection.css"; // Import the CSS file for styles
import BodyMapSelector from "./BodyMapSelector";


interface EmotionReflectionProps {
  emotion: string;
  onAnswer: (answer: string) => void;
  userId: string;
  onResetEmotion: () => void;
  onEmocionRegistrada: () => void;

}

const EmotionReflection: React.FC<EmotionReflectionProps> = ({ emotion, onAnswer, userId, onResetEmotion, onEmocionRegistrada }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);  
  const [answer, setAnswer] = useState<string>("");  
  const [responses, setResponses] = useState<string[]>([]);  
  const [loading, setLoading] = useState<boolean>(false);  
  const [analysis, setAnalysis] = useState<string>("");  
  const [situation, setSituation] = useState<string>("");  
  const [bodyLocation, setBodyLocation] = useState<string>("");
  const [sensation, setSensation] = useState<string>("");
 
 const bodilySensations: {
  [emotion: string]: { [location: string]: string }
} = {
  "Ansiedad": {
    "Cabeza": "sensación de presión o tensión mental",
    "Pecho / Corazón": "latidos acelerados o presión en el pecho",
    "Piernas": "inquietud o sensación de querer huir",
    "Manos": "temblor o sudoración",
    "Todo el cuerpo": "estado de alerta o tensión general",
  },
  "Miedo": {
    "Cabeza": "pensamientos acelerados o confusión",
    "Pecho / Corazón": "latidos fuertes o sensación de opresión",
    "Piernas": "rigidez o deseo de escapar",
    "Manos": "temblor o frialdad",
    "Todo el cuerpo": "parálisis o necesidad urgente de huir",
  },
  "Culpa": {
    "Cabeza": "pensamientos repetitivos o remordimiento",
    "Estómago": "nudo en el estómago o vacío",
    "Manos": "sensación de debilidad o inutilidad",
  },
  "Vergüenza": {
    "Cabeza": "deseo de ocultarse o evitar la mirada",
    "Manos": "manos temblorosas o sensación de inmovilidad",
    "Piernas": "piernas débiles o inmóviles",
    "Todo el cuerpo": "deseo de desaparecer o sentirse atrapado",
  }
};

  const questions: { [key: string]: string[] } = {
    "Ansiedad": [
      "¿Cómo es relevante esta situación para tus metas, valores o creencias personales?",
      "¿Esta situación te ayuda o te aleja de tus metas o valores? ¿En qué sentido?",
      "¿Quién es responsable de esta situación? ¿Eres tú, otra persona o las circunstancias?",
      "¿Qué tanto puedes hacer para cambiar o mejorar esta situación?",
      "¿Puedes adaptarte a esta situación cambiando cómo la interpretas o lo que sientes?",
      "¿Crees que esta situación o tu forma de verla puede cambiar en el futuro?",
    ],
    "Miedo": [
      "¿Cómo es relevante esta situación para tus metas, valores o creencias personales?",
      "¿Esta situación te ayuda o te aleja de tus metas o valores? ¿En qué sentido?",
      "¿Quién es responsable de esta situación? ¿Eres tú, otra persona o las circunstancias?",
      "¿Qué tanto puedes hacer para cambiar o mejorar esta situación?",
      "¿Puedes adaptarte a esta situación cambiando cómo la interpretas o lo que sientes?",
      "¿Crees que esta situación o tu forma de verla puede cambiar en el futuro?",
    ],
    "Vergüenza": [
      "¿Cómo es relevante esta situación para tus metas, valores o creencias personales?",
      "¿Esta situación te ayuda o te aleja de tus metas o valores? ¿En qué sentido?",
      "¿Quién es responsable de esta situación? ¿Eres tú, otra persona o las circunstancias?",
      "¿Qué tanto puedes hacer para cambiar o mejorar esta situación?",
      "¿Puedes adaptarte a esta situación cambiando cómo la interpretas o lo que sientes?",
      "¿Crees que esta situación o tu forma de verla puede cambiar en el futuro?",
    ],
    "Culpa": [
      "¿Cómo es relevante esta situación para tus metas, valores o creencias personales?",
      "¿Esta situación te ayuda o te aleja de tus metas o valores? ¿En qué sentido?",
      "¿Quién es responsable de esta situación? ¿Eres tú, otra persona o las circunstancias?",
      "¿Qué tanto puedes hacer para cambiar o mejorar esta situación?",
      "¿Puedes adaptarte a esta situación cambiando cómo la interpretas o lo que sientes?",
      "¿Crees que esta situación o tu forma de verla puede cambiar en el futuro?",
    ]
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

const handleAnswerSubmit = async () => {
  if (!answer.trim() || loading) return;

  const isLastQuestion = currentQuestionIndex === questions[emotion].length - 1;

  const newResponses = [...responses, answer];
  setResponses(newResponses);
  onAnswer(answer);
  setAnswer("");

  if (isLastQuestion) {
    setLoading(true); // evitar doble envío
    await sendResponsesToBackend(newResponses);
    setLoading(false);
  } else {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }
};




  const handleSituationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSituation(e.target.value);
  };

const sendResponsesToBackend = async (finalResponses: string[]) => {
  setLoading(true);
if (finalResponses.length > 6) {
  console.warn("⚠️ Hay más de 6 respuestas. Se recortarán.");
  finalResponses = finalResponses.slice(0, 6);
}

  // 🔍 Mostrar en consola lo que se enviará al backend
  console.log("📤 Enviando al backend:", {
    user_id: userId,
    emotion: emotion,
    responses: finalResponses,
    situation: situation,
    body_location: bodyLocation,
    body_sensation: sensation,
  });

  try {
    
    const url = import.meta.env.VITE_API_EMOTION;
    console.log(url)
    const response = await axios.post(url, {
      user_id: userId,
      emotion: emotion,
      responses: finalResponses,
      situation: situation,
      body_location: bodyLocation,
      body_sensation: sensation,
    });

    setAnalysis(response.data.analysis);

    // ✅ Actualizar etapa cuando se recibe el análisis
    await fetch(`http://localhost:3003/api/usuarios/${userId}/etapa`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nuevaEtapa: "emocion_registrada" }),
    });

    onEmocionRegistrada(); // Notifica a App para cambiar etapa y módulo


  } catch (error) {
    console.error("❌ Error al enviar las respuestas:", error);
  } finally {
    setLoading(false);
  }
};

  if (currentQuestionIndex === -1) {
    return (
      <div className="emotion-reflection-container">
        <h2 className="emotion-title">{emotion}</h2>
        <p style={{ color: "black" }}>Describe brevemente la situación que te generó esta emoción:</p>
        <textarea
          className="situation-textarea"
          value={situation}
          onChange={handleSituationChange}
          placeholder="Ejemplo: tuve que hablar frente a la clase y sentí ansiedad..."
        />
        <p style={{ color: "black" }}>¿En qué parte de tu cuerpo sientes esta emoción?</p>
        <select
          className="body-select"
          value={bodyLocation}
          onChange={(e) => {
            const selected = e.target.value;
            setBodyLocation(selected);

            const emotionMap = bodilySensations[emotion];
            if (emotionMap && emotionMap[selected]) {
              setSensation(emotionMap[selected]);
            } else {
              setSensation("No hay una descripción sensorial definida para esta combinación.");
            }
          }}
        >
          <option value="">Selecciona una opción</option>
          <option value="Cabeza">Cabeza</option>
          <option value="Pecho / Corazón">Pecho / Corazón</option>
          <option value="Estómago">Estómago</option>
          <option value="Manos">Manos</option>
          <option value="Piernas">Piernas</option>
          <option value="Espalda / Hombros">Espalda / Hombros</option>
          <option value="Todo el cuerpo">Todo el cuerpo</option>
        </select>

        {bodyLocation && (
          <p style={{ color: "black", marginTop: "10px" }}>
            <strong>Sensación corporal:</strong> {sensation}
          </p>
        )}
       <button
          className="start-button"
          onClick={() => setCurrentQuestionIndex(0)}
          disabled={!situation.trim() || !bodyLocation}
        >
          Comenzar
        </button>

      </div>
    );
  }

  // Dentro del return del componente principal:
return (
  <div className="emotion-reflection-container">
    <h2 className="emotion-title">{emotion}</h2>
    <div className="question-container">
      <p style={{ color: "black" }}>{questions[emotion][currentQuestionIndex]}</p>
      <textarea
        className="answer-textarea"
        value={answer}
        onChange={handleAnswerChange}
        placeholder="Escribe tu respuesta aquí"
      />
      <div className="button-group">
        {/* 🔄 Botón para regresar a la pregunta anterior */}
        <button
          className="prev-button"
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(currentQuestionIndex - 1);
              const updatedResponses = [...responses];
              updatedResponses.pop(); // quita la última
              setResponses(updatedResponses);
              setAnswer(updatedResponses[updatedResponses.length - 1] || "");
            }
          }}
          disabled={currentQuestionIndex === 0}
        >
          ⬅ Pregunta anterior
        </button>

        <button
          className="submit-button"
          onClick={handleAnswerSubmit}
          disabled={loading || !answer.trim()} // <- desactiva si vacío o cargando
        >
          {loading ? "Procesando..." : "Enviar Respuesta"}
        </button>

        {/* 🔄 Botón para elegir otra emoción */}
       
      </div>
    </div>

    {loading && <p className="loading-text">Procesando tus respuestas...</p>}

    {analysis && !loading && (
  <div className="analysis-container">
    <h3>Análisis de tus respuestas:</h3>
    <div
      className="analysis-html scroll-box"
      dangerouslySetInnerHTML={{ __html: analysis }}
    ></div>

    <button
      className="reset-button"
      style={{ marginTop: "20px" }}
      onClick={onResetEmotion}
    >
      🔁 Elegir otra emoción
    </button>
  </div>
)}

  </div>
);

};

export default EmotionReflection;
