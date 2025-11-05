export interface CrearCalificacionSnackDTO {
  usuarioId: string;
  snackId: string;
  puntuacion: number; // 1-5
  comentario?: string;
  fecha?: string;
}

export interface ResponseCalificacionSnackDTO {
  calificacionId: string;
  usuarioId: string;
  snackId: string;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
}

export interface FiltroCalificacionSnackDTO {
  usuarioId?: string;
  snackId?: string;
  puntuacionMinima?: number;
  puntuacionMaxima?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PromedioCalificacionSnackResponse {
  snackId: string;
  promedio: number;
}

// Constantes útiles
export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;
export const MAX_CARACTERES_COMENTARIO = 500;
