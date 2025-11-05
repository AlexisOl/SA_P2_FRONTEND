
export interface CrearVentaSnackDirectaDTO {
  usuarioId: string;
  cineId: string;
  snacks: { [key: string]: number }; // Map<snackId, cantidad>
}

export interface ResponseVentaSnackDTO {
  ventaSnackId: string;
  ventaId: string | null;
  snackId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  usuarioId: string;
  fechaVenta: string;
}

export interface FiltroVentaSnackDTO {
  ventaSnackId?: string;
  ventaId?: string;
  snackId?: string;
  usuarioId?: string;
  fechaInicio?: string; //  format: yyyy-MM-dd'T'HH:mm:ss
  fechaFin?: string; // format: yyyy-MM-dd'T'HH:mm:ss
}
