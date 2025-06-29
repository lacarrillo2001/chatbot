import React from "react";
import "./EmotionSelection.css"; // Import the CSS file for styles

interface EmotionSelectionProps {
  onSelectEmotion: (emotion: string) => void;
}

const EmotionSelection: React.FC<EmotionSelectionProps> = ({ onSelectEmotion }) => {
  const emotions = [
    { name: "Ansiedad", icon: "😰" },
    { name: "Miedo", icon: "😨" },
    { name: "Vergüenza", icon: "😳" },
    { name: "Culpa", icon: "😔" }
  ];

  const handleEmotionSelection = (emotion: string): void => {
    onSelectEmotion(emotion);  // Establecer emoción seleccionada
  };

  return (
    <div className="emotion-selection-container">
      <h2>Selecciona una emoción para explorar:</h2>
      {emotions.map((emotion, index) => (
        <button 
          key={index} 
          className="emotion-button" 
          onClick={() => handleEmotionSelection(emotion.name)}
        >
          <span className="emotion-icon">{emotion.icon}</span>
          {emotion.name}
        </button>
      ))}
    </div>
  );
};

export default EmotionSelection;