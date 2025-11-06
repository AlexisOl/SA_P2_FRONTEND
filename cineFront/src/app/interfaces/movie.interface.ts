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

export interface MovieVM {
  id: string;
  titulo: string;
  posters?: string[];
  clasificacion?: Clasificacion;
}

type Clasificacion = 'A' | 'B' | 'B12' | 'B15' | 'C';

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