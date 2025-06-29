// /src/components/EmotionReflection.tsx
import React, { useState } from "react";

interface EmotionReflectionProps {
  emotion: string;
  onAnswer: (answer: string) => void;
}

const EmotionReflection: React.FC<EmotionReflectionProps> = ({ emotion, onAnswer }) => {
  // Almacenamos las respuestas con el índice de la pregunta como clave
  const [responses, setResponses] = useState<{ [index: number]: string }>({}); 

  const questions: { [key: string]: string[] } = {
    "Ansiedad": [
      "¿Qué situación social te causó ansiedad?",
      "¿Por qué esta situación fue relevante para ti?",
      "¿Cómo te sentiste capaz de afrontar la situación?",
    ],
    "Miedo": [
      "¿Por qué esta situación te causó miedo?",
      "¿Qué es lo peor que podría pasar?",
      "¿Te sentías capaz de afrontar este miedo?",
    ],
    "Vergüenza": [
      "¿Qué te hizo sentir vergüenza?",
      "¿Fue algo que hiciste o la forma en que los demás te percibieron lo que causó la vergüenza?",
    ],
    "Culpa": [
      "¿Qué crees que hiciste mal?",
      "¿Te sentiste responsable de lo que ocurrió?",
    ]
  };

  // Función para manejar los cambios en las respuestas de cada pregunta
  const handleAnswerChange = (index: number, value: string) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [index]: value,  // Almacenamos la respuesta para la pregunta con el índice
    }));
  };

  // Función para manejar el envío de la respuesta
  const handleAnswerSubmit = (index: number) => {
    const answer = responses[index]; // Obtenemos la respuesta para la pregunta actual
    if (answer.trim()) {
      onAnswer(answer);  // Enviamos la respuesta al componente principal
      setResponses((prevResponses) => ({
        ...prevResponses,
        [index]: "",  // Limpiamos la respuesta una vez que se haya enviado
      }));
    }
  };

  return (
    <div>
      <h2>{emotion}</h2>
      <div>
        {questions[emotion].map((question, index) => (
          <div key={index}>
            <p>{question}</p>
            <textarea
              value={responses[index] || ""}  // Usamos el índice para manejar el valor de cada input individual
              onChange={(e) => handleAnswerChange(index, e.target.value)}  // Manejo del cambio para cada input
              placeholder="Escribe tu respuesta aquí"
            />
            <button onClick={() => handleAnswerSubmit(index)}>Enviar Respuesta</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionReflection;
