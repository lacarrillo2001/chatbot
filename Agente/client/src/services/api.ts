import axios from "axios";
import type { Simulacion } from "../types/simulacion";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});
export const getSimulaciones = () => API.get<Simulacion[]>("/simulaciones");
export const deleteSimulacion = (id: string) => API.delete(`/simulaciones/${id}`);
export const createSimulacion = (data: Simulacion) => API.post("/simulaciones", data);
