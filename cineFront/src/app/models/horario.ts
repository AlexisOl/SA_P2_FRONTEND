export interface Horario {
  id: string;
  peliculaId: string;
  cinemaId: string;
  salaId: string;
  idioma: string;
  formato: string;
  inicio: string;   // ISO
  fin: string;      // ISO
  precio: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface HorarioCreate {
  peliculaId: string;
  cinemaId: string;
  salaId: string;
  idioma: string;
  formato: string;
  inicio: string;  // ISO
  fin: string;     // ISO
  precio: number;
}

export interface Sala {
  id: string;
  nombre: string;
  capacidad?: number;
  activa?: boolean;
}