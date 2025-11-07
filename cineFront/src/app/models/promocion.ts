/**
 * DTO de respuesta que devuelve el backend
 */
export interface ResponsePromocionDTO {
  promocionId: string;
  nombre: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  porcentajeDescuento: number;
  fechaInicio: string; // LocalDate -> string ISO (YYYY-MM-DD)
  fechaFin: string;    // LocalDate -> string ISO (YYYY-MM-DD)
  activa: boolean;
  cineId: string;
  salaId: string | null;
  peliculaId: string | null;
  clienteId: string | null;
}

/**
 * DTO para crear una nueva promoción
 */
export interface CrearPromocionDTO {
  nombre: string;              // @NotBlank, max 200 caracteres
  descripcion?: string;        // Opcional, max 500 caracteres
  tipo: TipoPromocion;         // @NotNull
  porcentajeDescuento: number; // @NotNull, @Min(1), @Max(100)
  fechaInicio: string;         // @NotNull, formato ISO (YYYY-MM-DD)
  fechaFin: string;            // @NotNull, formato ISO (YYYY-MM-DD)
  cineId: string;              // @NotNull (UUID)
  salaId?: string;             // Opcional (UUID)
  peliculaId?: string;         // Opcional (UUID)
  clienteId?: string;          // Opcional (UUID)
}

/**
 * DTO para editar una promoción existente
 */
export interface EditarPromocionDTO {
  nombre?: string;              // Opcional, max 200 caracteres
  descripcion?: string;         // Opcional, max 500 caracteres
  tipo?: TipoPromocion;         // Opcional
  porcentajeDescuento?: number; // Opcional, @Min(1), @Max(100)
  fechaInicio?: string;         // Opcional, formato ISO (YYYY-MM-DD)
  fechaFin?: string;            // Opcional, formato ISO (YYYY-MM-DD)
  activa?: boolean;             // Opcional
  salaId?: string;              // Opcional (UUID)
  peliculaId?: string;          // Opcional (UUID)
  clienteId?: string;           // Opcional (UUID)
}

/**
 * DTO para filtrar promociones
 */
export interface FiltroPromocionDTO {
  cineId?: string;
  salaId?: string;
  peliculaId?: string;
  clienteId?: string;
  tipo?: TipoPromocion;
  activa?: boolean;
  fecha?: string; // LocalDate -> string ISO (YYYY-MM-DD)
}

/**
 * Enum que representa los tipos de promoción
 */
export enum TipoPromocion {
  AMBOS = 'AMBOS',
  CINE = 'CINE',
  SALA = 'SALA',
  PELICULA = 'PELICULA',
  CLIENTE = 'CLIENTE',
  BOLETOS = 'BOLETOS',
  SNACKS = 'SNACKS',
}
