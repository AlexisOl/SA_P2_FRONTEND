export interface Movie {
  id?: string;
  titulo: string;
  sinopsis: string;
  duracion: number;
  posters: string[];      // URLs
  cast: string[];
  director: string;
  clasificacion: string;  // A, B12, etc.
  activa: boolean;
  fechaEstreno: string;   // YYYY-MM-DD
}

export interface Page<T> {
  content: T[];
  totalElements: number;
}


export interface Category {
  id: string;
  nombre: string;
  activa: boolean;
  createdAt?: string;
  updatedAt?: string;
}