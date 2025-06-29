export interface Escenario {
  paso: number;
  situacion: string;
  opciones: string[];
  respuestas: string[];
}

export interface Simulacion {
  id: string;
  titulo: string;
  descripcion: string;
  usuario_id: string;
  objetivo: string;
  escenarios: Escenario[];
}
