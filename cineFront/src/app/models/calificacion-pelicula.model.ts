
export interface CrearCalificacionPeliculaDTO {
  usuarioId: string;
  peliculaId: string;
  puntuacion: number; // 1-5
  comentario?: string;
  fecha?: string;
}

export interface ResponseCalificacionPeliculaDTO {
  calificacionId: string;
  usuarioId: string;
  peliculaId: string;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
}

export interface FiltroCalificacionPeliculaDTO {
  usuarioId?: string;
  peliculaId?: string;
  puntuacionMinima?: number;
  puntuacionMaxima?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PromedioCalificacionResponse {
  peliculaId: string;
  promedio: number;
}

// Constantes útiles
export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;
export const MAX_CARACTERES_COMENTARIO = 500;
