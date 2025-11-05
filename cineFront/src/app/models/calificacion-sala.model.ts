export interface CrearCalificacionSalaDTO {
  usuarioId: string;
  salaId: string;
  puntuacion: number; // 1-5
  comentario?: string;
  fecha?: string; // ISO 8601 format
}

export interface ResponseCalificacionSalaDTO {
  calificacionId: string;
  usuarioId: string;
  salaId: string;
  puntuacion: number;
  comentario: string | null;
  fecha: string; // ISO 8601 format
}

export interface FiltroCalificacionSalaDTO {
  usuarioId?: string;
  salaId?: string;
  puntuacionMinima?: number;
  puntuacionMaxima?: number;
  fechaInicio?: string; // ISO 8601 format
  fechaFin?: string; // ISO 8601 format
}

export interface PromedioCalificacionSalaResponse {
  salaId: string;
  promedio: number;
}

// Constantes útiles
export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;
export const MAX_CARACTERES_COMENTARIO = 500;
