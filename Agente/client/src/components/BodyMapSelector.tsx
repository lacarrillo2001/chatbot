import React from "react";
import "./BodyMapSelector.css";

interface BodyMapSelectorProps {
  emotion: string;
  onSelect: (location: string, sensation: string) => void;
}

const bodyMapData: {
  [emotion: string]: {
    [location: string]: string;
  };
} = {
  "Ansiedad": {
    "Cabeza": "brain in precision",
    "Pecho / Corazón": "brain in precision",
    "Manos": "brain in precision",
    "Piernas": "brain in precision",
  },
  "Miedo": {
    "Cabeza": "brain in precision",
    "Pecho / Corazón": "brain in precision",
    "Manos": "brain in precision",
    "Piernas": "brain in precision",
  },
  "Culpa": {
    "Cabeza": "cloudy feeling in the stomach and head",
    "Estómago": "cloudy feeling in the stomach and head",
    "Manos": "cloudy feeling in the stomach and head",
  },
  "Vergüenza": {
    "Cabeza": "wanting to hide / I cannot escape",
    "Piernas": "hands and legs are tied",
    "Manos": "hands and legs are tied",
  },
};

const BodyMapSelector: React.FC<BodyMapSelectorProps> = ({ emotion, onSelect }) => {
  const emotionMap = bodyMapData[emotion];

  const handleSelect = (location: string) => {
    const sensation = emotionMap?.[location] || "Sin sensación definida.";
    onSelect(location, sensation);
  };

  return (
    <div className="bodymap-selector">
      <img
        src="/bodymap.png"
        useMap="#bodymap"
        alt="Body map"
        className="bodymap-image"
      />
      <map name="bodymap">
        <area shape="rect" coords="100,10,160,60" alt="Cabeza" onClick={() => handleSelect("Cabeza")} />
        <area shape="rect" coords="100,70,160,120" alt="Pecho / Corazón" onClick={() => handleSelect("Pecho / Corazón")} />
        <area shape="rect" coords="100,130,160,180" alt="Estómago" onClick={() => handleSelect("Estómago")} />
        <area shape="rect" coords="40,130,90,180" alt="Manos" onClick={() => handleSelect("Manos")} />
        <area shape="rect" coords="80,200,140,300" alt="Piernas" onClick={() => handleSelect("Piernas")} />
      </map>
    </div>
  );
};

export default BodyMapSelector;
