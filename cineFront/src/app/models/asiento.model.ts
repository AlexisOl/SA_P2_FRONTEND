
export interface CrearAsientoDTO {
  salaId: string;
  fila: string;
  columna: number;
}

export interface ResponseAsientoDTO {
  asientoId: string;
  fila: string;
  columna: number;
  salaId: string;
  disponible: boolean;
}
