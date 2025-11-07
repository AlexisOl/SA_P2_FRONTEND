import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { VentaService } from '@/services/venta.service';
import { AsientoService } from '@/services/asiento.service';
import { SnacksService } from '@/services/snacks-service.service';
import { PromocionService } from '@/services/promocion.service';
import { AuthService } from '@/services/auth';

// Models
import { CrearVentaDTO, EstadoVenta } from '@/models/ventas.model';
import { ResponseAsientoDTO } from '@/models/asiento.model';
import { snacks } from '@/models/Cine';
import { ResponsePromocionDTO } from '@/models/promocion';

interface DatosReservacion {
  peliculaId: string;
  peliculaTitulo: string;
  cineId: string;
  cineNombre: string;
  salaId: string;
  salaNombre: string;
  funcionId: string;
  horario: string;
  precio: number;
}
interface ItemCarritoSnack {
  snack: snacks;
  cantidad: number;
  subtotal: number;
}

interface PromocionAplicada {
  id: string;
  porcentajeDescuento: number;
  montoMinimo: number;
}

@Component({
  selector: 'app-venta-boletos',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    ChipModule,
    TagModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    VentaService,
    AsientoService,
    SnacksService,
    PromocionService,
    AuthService
  ],
  templateUrl: './venta-boletos.html',
  styleUrl: './venta-boletos.scss',
})
export class VentaBoletos implements OnInit {

  // Datos de la reservación
  datosReservacion: DatosReservacion | null = null;

  // Usuario
  usuarioId: string = '';

  // Asientos
  asientosDisponibles: ResponseAsientoDTO[] = [];
  asientosSeleccionados: ResponseAsientoDTO[] = [];

  // Snacks
  snacksDisponibles: snacks[] = [];

  // Promoción
  mejorPromocion: ResponsePromocionDTO | null = null;

  // Estados de carga
  cargandoAsientos: boolean = false;
  cargandoSnacks: boolean = false;
  procesandoVenta: boolean = false;

  // Totales
  subtotalBoletos: number = 0;
  subtotalSnacks: number = 0;
  descuento: number = 0;
  total: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ventaService: VentaService,
    private asientoService: AsientoService,
    private snacksService: SnacksService,
    private promocionService: PromocionService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
      }
    });

    this.authService.fetchAndCacheUser().subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
      }
    });

    // Obtener datos de la reservación desde query params o state
    this.route.queryParams.subscribe(params => {
      if (params['salaId'] && params['cineId'] && params['funcionId']) {
        this.datosReservacion = {
          peliculaId: params['peliculaId'] || '',
          peliculaTitulo: params['peliculaTitulo'] || 'Película',
          cineId: params['cineId'],
          cineNombre: params['cineNombre'] || 'Cine',
          salaId: params['salaId'],
          salaNombre: params['salaNombre'] || 'Sala',
          funcionId: params['funcionId'],
          horario: params['horario'] || new Date().toISOString(),
          precio: parseFloat(params['precio']) || 0
        };

        this.inicializarCompra();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Datos de la función no encontrados'
        });
        this.router.navigate(['/peliculas/listado']);
      }
    });
  }

  inicializarCompra(): void {
    if (!this.datosReservacion) return;

    // Cargar asientos
    this.cargarAsientos();

    // Cargar snacks
    this.cargarSnacks();

    // Obtener mejor promoción
    this.obtenerMejorPromocion();
  }

  cargarAsientos(): void {
    if (!this.datosReservacion) return;

    this.cargandoAsientos = true;
    this.asientoService.listarAsientosPorSala(this.datosReservacion.salaId, this.datosReservacion.funcionId).subscribe({
      next: (asientos) => {
        this.asientosDisponibles = asientos;
        this.cargandoAsientos = false;
      },
      error: (error) => {
        this.cargandoAsientos = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los asientos'
        });
        console.error('Error al cargar asientos:', error);
      }
    });
  }

  cargarSnacks(): void {
    if (!this.datosReservacion) return;

    this.cargandoSnacks = true;
    this.snacksService.listarSnacksId(this.datosReservacion.cineId).subscribe({
      next: (result) => {
        const snacks = result as snacks[];
        this.snacksDisponibles = snacks.map(snack => ({
          ...snack,
          cantidadSeleccionada: 0
        }));
        this.cargandoSnacks = false;
      },
      error: (error) => {
        this.cargandoSnacks = false;
        console.error('Error al cargar snacks:', error);
      }
    });
  }

  obtenerMejorPromocion(): void {
    if (!this.datosReservacion) return;

    const filtro = {
      cineId: this.datosReservacion.cineId,
      salaId: this.datosReservacion.salaId,
      peliculaId: this.datosReservacion.peliculaId,
      clienteId: this.usuarioId
    };

    this.promocionService.obtenerMejorPromocion(filtro).subscribe({
      next: (promocion) => {
        if (promocion) {
          this.mejorPromocion = promocion;
          this.calcularTotales();
        }
      },
      error: (error) => {
        console.error('Error al obtener promoción:', error);
      }
    });
  }

  // Gestión de asientos
  get filasUnicas(): string[] {
    const filas = [...new Set(this.asientosDisponibles.map(a => a.fila))];
    return filas.sort();
  }

  obtenerAsientosPorFila(fila: string): ResponseAsientoDTO[] {
    return this.asientosDisponibles
      .filter(a => a.fila === fila)
      .sort((a, b) => a.columna - b.columna);
  }

  toggleSeleccionAsiento(asiento: ResponseAsientoDTO): void {
    if (!asiento.disponible) return;

    const index = this.asientosSeleccionados.findIndex(
      a => a.asientoId === asiento.asientoId
    );

    if (index > -1) {
      this.asientosSeleccionados.splice(index, 1);
    } else {
      this.asientosSeleccionados.push(asiento);
    }

    this.calcularTotales();
  }

  esAsientoSeleccionado(asiento: ResponseAsientoDTO): boolean {
    return this.asientosSeleccionados.some(
      a => a.asientoId === asiento.asientoId
    );
  }

  obtenerTooltipAsiento(asiento: ResponseAsientoDTO): string {
    const estado = asiento.disponible ? 'Disponible' : 'Ocupado';
    return `Asiento ${asiento.fila}${asiento.columna} - ${estado}`;
  }

  // Gestión de snacks
  tieneSnacksSeleccionados(): boolean {
    return this.snacksDisponibles.some(
      s => s.cantidadSeleccionada && s.cantidadSeleccionada > 0
    );
  }

  snacksConCantidad(): snacks[] {
    return this.snacksDisponibles.filter(
      s => s.cantidadSeleccionada && s.cantidadSeleccionada > 0
    );
  }

  // Cálculos
  calcularSubtotalBoletos(): number {
    if (!this.datosReservacion) return 0;
    return this.asientosSeleccionados.length * this.datosReservacion.precio;
  }

  calcularSubtotalSnacks(): number {
    return this.snacksDisponibles.reduce((total, snack) => {
      if (snack.cantidadSeleccionada && snack.cantidadSeleccionada > 0) {
        return total + (snack.precio * snack.cantidadSeleccionada);
      }
      return total;
    }, 0);
  }

  calcularSubtotal(): number {
    return this.calcularSubtotalBoletos() + this.calcularSubtotalSnacks();
  }

  calcularDescuento(): number {
    if (!this.mejorPromocion) return 0;
    const subtotal = this.calcularSubtotal();
    return subtotal * (this.mejorPromocion.porcentajeDescuento / 100);
  }

  calcularTotal(): number {
    return this.calcularSubtotal() - this.calcularDescuento();
  }

  calcularTotales(): void {
    this.subtotalBoletos = this.calcularSubtotalBoletos();
    this.subtotalSnacks = this.calcularSubtotalSnacks();
    this.descuento = this.calcularDescuento();
    this.total = this.calcularTotal();
  }

  // Validación
  validarVenta(): boolean {
    return this.asientosSeleccionados.length > 0 &&
      this.usuarioId.trim() !== '' &&
      this.datosReservacion !== null;
  }

  // Procesar venta
  procesarVenta(): void {
    if (!this.validarVenta()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un asiento'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Confirmar compra por un total de ${this.total.toFixed(2)} GTQ?`,
      header: 'Confirmar Compra',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.ejecutarVenta();
      }
    });
  }

  ejecutarVenta(): void {
    if (!this.datosReservacion) return;

    this.procesandoVenta = true;

    // Construir mapa de snacks
    const snacksMap: { [key: string]: number } = {};
    this.snacksDisponibles.forEach(snack => {
      if (snack.id && snack.cantidadSeleccionada && snack.cantidadSeleccionada > 0) {
        snacksMap[snack.id] = snack.cantidadSeleccionada;
      }
    });

    // Construir DTO de venta
    const ventaDTO: CrearVentaDTO = {
      idUsuario: this.usuarioId,
      idCine: this.datosReservacion.cineId,
      idFuncion: this.datosReservacion.funcionId,
      idsAsientos: this.asientosSeleccionados.map(a => a.asientoId),
      montoTotal: this.total,
      snacks: Object.keys(snacksMap).length > 0 ? snacksMap : undefined,
      salaId: this.datosReservacion.salaId,
      peliculaId: this.datosReservacion.peliculaId,
      aplicarPromocion: this.mejorPromocion !== null
    };

    console.log(ventaDTO);
    
    this.ventaService.crearVenta(ventaDTO).subscribe({
      next: (response) => {
        this.procesandoVenta = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Compra Exitosa',
          detail: `Venta procesada correctamente. Total: ${this.total.toFixed(2)} GTQ`,
          life: 5000
        });

        // Mostrar detalles de la venta
        this.mostrarResumenVenta(response);

        // Redirigir después de un tiempo
        setTimeout(() => {
          this.router.navigate(['/peliculas/listado']);
        }, 3000);
      },
      error: (error) => {
        this.procesandoVenta = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo procesar la compra'
        });
        console.error('Error al procesar venta:', error);
      }
    });
  }

  mostrarResumenVenta(venta: any): void {
    let detalles = `
        ID de Venta: ${venta.ventaId}
        Boletos: ${venta.cantidadBoletos}
        Monto Original: ${venta.montoOriginal?.toFixed(2) || this.calcularSubtotal().toFixed(2)} GTQ
    `;

    if (venta.montoDescuento && venta.montoDescuento > 0) {
      detalles += `
        Descuento: ${venta.montoDescuento.toFixed(2)} GTQ (${venta.porcentajeDescuento}%)
      `;
    }

    detalles += `
        Total Pagado: ${venta.montoTotal.toFixed(2)} GTQ
        Estado: ${venta.estado}

    `;

    this.messageService.add({
      severity: 'info',
      summary: 'Resumen de la Compra',
      detail: detalles,
      sticky: true
    });
  }

  cancelarCompra(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar la compra?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.router.navigate(['/peliculas/listado']);
      }
    });
  }

}
