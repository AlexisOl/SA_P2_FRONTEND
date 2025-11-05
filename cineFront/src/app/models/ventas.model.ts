
export interface CrearVentaDTO {
  idUsuario: string;
  idCine: string;
  idFuncion: string;
  idsAsientos: string[];
  montoTotal: number;
  snacks?: { [key: string]: number }; // Map<UUID, Integer> en Java
  salaId?: string;
  peliculaId?: string;
  aplicarPromocion?: boolean;
}

export interface EditarVentaDTO {
  idFuncion?: string;
  montoTotal?: number;
}

export interface ResponseVentaDTO {
  ventaId: string;
  usuarioId: string;
  funcionId: string;
  fechaVenta: string; // ISO 8601 format
  montoTotal: number;
  estado: EstadoVenta;
  cantidadBoletos: number;
  promocionAplicadaId?: string;
  montoDescuento?: number;
  porcentajeDescuento?: number;
  montoOriginal?: number;
}

export interface FiltroVentaDTO {
  usuarioId?: string;
  funcionId?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export enum EstadoVenta {
  ACTIVA = 'ACTIVA',
  ANULADA = 'ANULADA',
  COMPLETADA = 'COMPLETADA',
  PENDIENTE = 'PENDIENTE'
}
