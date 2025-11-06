import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VentaSnackService } from '@/services/venta-snack.service';
import { CineServiceService } from '@/services/cine-service.service';
import { CrearVentaSnackDirectaDTO, ResponseVentaSnackDTO } from '@/models/venta-snack.model';
import {cine, snacks} from '@/models/Cine';
import {SnacksService} from '@/services/snacks-service.service';
import { SelectModule } from 'primeng/select';
import {AuthService} from '@/services/auth';
import {UserDTO} from '@/models/user.model';

interface ItemCarrito {
  snack: snacks;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-venta-snack',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService, VentaSnackService, SnacksService, CineServiceService, AuthService],
  templateUrl: './venta-snack.html',
  styleUrl: './venta-snack.scss',
})
export class VentaSnack implements OnInit {

  //private auth = inject(AuthService);

  cines: cine[] = [];
  cineSeleccionado: cine | null = null;
  snacksDisponibles: snacks[] = [];
  carrito: ItemCarrito[] = [];

  // Usuario
  usuarioId: string = '';

  // Estados
  cargandoSnacks: boolean = false;
  procesandoVenta: boolean = false;

  // Total
  totalVenta: number = 0;
  userDto!: UserDTO;

  constructor(
    private ventaSnackService: VentaSnackService,
    private snacksService: SnacksService,
    private cineService: CineServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    console.log('Inicializando VentaSnack');
    this.auth.currentUser$.subscribe(u => {
      console.log('Current User:', u);
      if (u) {
        this.userDto = u;
        this.usuarioId = u.id;
      }
    });
    this.auth.fetchAndCacheUser().subscribe(u => {
      if (u) {
        console.log('Fetched User:', u);
        this.userDto = u;
        this.usuarioId = u.id;
      }
    });
    this.cargarCines();
  }

  cargarCines(): void {
    this.cineService.obtenerCInesLIst().subscribe({
      next: (cines) => {
        this.cines = cines;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cines'
        });
        console.error('Error al cargar cines:', error);
      }
    });
  }

  onCineChange(): void {
    const cineId = this.cineSeleccionado?.id;
    if (cineId) {
      this.cargarSnacksPorCine(cineId);
    } else {
      this.snacksDisponibles = [];
    }
  }

  cargarSnacksPorCine(cineId: String): void {
    this.cargandoSnacks = true;
    this.snacksService.listarSnacksId(cineId).subscribe({
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los snacks'
        });
        console.error('Error al cargar snacks:', error);
      }
    });
  }

  agregarAlCarrito(snack: snacks): void {
  // Validar que haya una cantidad seleccionada
  if (!snack.cantidadSeleccionada || snack.cantidadSeleccionada <= 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar una cantidad válida'
    });
    return;
  }

  // Verificar si el snack ya está en el carrito
  const itemExistente = this.carrito.find(item => item.snack.id === snack.id);

  if (itemExistente) {
    // Actualizar cantidad
    const nuevaCantidad = itemExistente.cantidad + snack.cantidadSeleccionada;

    itemExistente.cantidad = nuevaCantidad;
    itemExistente.subtotal = itemExistente.cantidad * Number(itemExistente.snack.precio);
  } else {
    // Agregar nuevo item
    this.carrito.push({
      snack: { ...snack },
      cantidad: snack.cantidadSeleccionada,
      subtotal: snack.cantidadSeleccionada * Number(snack.precio)
    });
  }

  // Resetear cantidad seleccionada
  snack.cantidadSeleccionada = 0;

  this.calcularTotal();

  this.messageService.add({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Snack agregado al carrito'
  });
}

  eliminarDelCarrito(item: ItemCarrito): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar ${item.snack.nombre} del carrito?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.carrito = this.carrito.filter(i => i.snack.id !== item.snack.id);
        this.calcularTotal();
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: 'Item eliminado del carrito'
        });
      }
    });
  }

  vaciarCarrito(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de vaciar todo el carrito?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.carrito = [];
        this.totalVenta = 0;
        this.messageService.add({
          severity: 'info',
          summary: 'Carrito Vacío',
          detail: 'El carrito ha sido vaciado'
        });
      }
    });
  }

  calcularTotal(): void {
    this.totalVenta = this.carrito.reduce((total, item) => {
      item.subtotal = item.cantidad * item.snack.precio;
      return total + item.subtotal;
    }, 0);
  }

  validarVenta(): boolean {
    return this.carrito.length > 0 &&
      this.usuarioId.trim() !== '' &&
      this.cineSeleccionado !== null;
  }

  procesarVenta(): void {
    if (!this.validarVenta()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos y agregue al menos un snack'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Confirmar venta por un total de ${this.totalVenta.toFixed(2)} GTQ?`,
      header: 'Confirmar Venta',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.ejecutarVenta();
      }
    });
  }

  ejecutarVenta(): void {
    this.procesandoVenta = true;

    // Construir el DTO
    const snacksMap: { [key: string]: number } = {};
    this.carrito.forEach(item => {
  if (item.snack.id) {
    snacksMap[item.snack.id] = item.cantidad;
  }
});

    const ventaDTO: CrearVentaSnackDirectaDTO = {
      usuarioId: this.usuarioId,
      cineId: this.cineSeleccionado!.id?.toString() ?? '',
      snacks: snacksMap
    };

    this.ventaSnackService.comprarSnacksDirecto(ventaDTO).subscribe({
      next: (response: ResponseVentaSnackDTO[]) => {
        this.procesandoVenta = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Venta Exitosa',
          detail: `Venta procesada correctamente. Total: ${this.totalVenta.toFixed(2)} GTQ`,
          life: 5000
        });

        // Limpiar formulario
        this.carrito = [];
        this.totalVenta = 0;
        this.usuarioId = '';


      },
      error: (error) => {
        this.procesandoVenta = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo procesar la venta'
        });
        console.error('Error al procesar venta:', error);
      }
    });
  }

}
