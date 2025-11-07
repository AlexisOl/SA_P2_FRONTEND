export interface ResponseBoletoDTO {
  boletoId: string;
  ventaId: string;
  asientoId: string;
  precio: number;
  codigoBoleto: string;
}

export interface ResponseBoletoDetalladoDTO {
  // Datos básicos del boleto
  boletoId: string;
  ventaId: string;
  asientoId: string;
  precio: number;
  codigoBoleto: string;

  // Datos del asiento
  fila: string;
  columna: number;
  salaId: string;

  // Datos de la película
  peliculaId: string;
  peliculaTitulo: string;
  peliculaDuracion: number;

  // Datos de la función / horario
  funcionId: string;
  fechaHoraInicio: string; // LocalDateTime → ISO string (ej: "2025-11-07T10:00:00")
  fechaHoraFin: string;
  idioma: string;
  formato: string;
}

export interface UsuarioCompradorDTO {
  usuarioId: string;
  nombreUsuario: string;
  emailUsuario: string;
  cantidadBoletosComprados: number;
  totalGastado: number;
}

export interface ReporteBoletosSalaDTO {
  salaId: string;
  nombreSala: string; // si está disponible en el backend
  totalBoletos: number;
  totalDinero: number;
  usuarios: UsuarioCompradorDTO[];
}

export interface ReporteBoletosGeneralDTO {
  fechaInicio: string;  // LocalDateTime → string (ISO)
  fechaFin: string;
  totalBoletosVendidos: number;
  totalDineroRecaudado: number;
  detallesPorSala: ReporteBoletosSalaDTO[];
}
