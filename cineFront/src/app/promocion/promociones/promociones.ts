import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import {PromocionService} from '@/services/promocion.service';
import {CrearPromocionDTO, EditarPromocionDTO, ResponsePromocionDTO, TipoPromocion} from '@/models/promocion';

@Component({
  selector: 'app-promociones',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    DatePickerModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService, PromocionService],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss',
})
export class Promociones implements OnInit {

  promocionDialog: boolean = false;
  promociones = signal<ResponsePromocionDTO[]>([]);
  promocion: any = {};
  selectedPromociones: ResponsePromocionDTO[] = [];
  submitted: boolean = false;
  isEditMode: boolean = false;

  @ViewChild('dt') dt!: Table;

  // Opciones para selects
  tiposPromocion: any[] = [];
  estadosPromocion: any[] = [];

  // Para fechas
  minDate: Date = new Date();

  constructor(
    private promocionService: PromocionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPromociones();
    this.initializeSelectOptions();
  }

  initializeSelectOptions() {
    this.tiposPromocion = [
      { label: 'General', value: TipoPromocion.GENERAL },
      { label: 'Cine', value: TipoPromocion.CINE },
      { label: 'Sala', value: TipoPromocion.SALA },
      { label: 'Película', value: TipoPromocion.PELICULA },
      { label: 'Cliente', value: TipoPromocion.CLIENTE }
    ];

    this.estadosPromocion = [
      { label: 'Activa', value: true },
      { label: 'Inactiva', value: false }
    ];
  }

  loadPromociones() {
    this.promocionService.listarPromociones().subscribe({
      next: (data) => {
        this.promociones.set(data);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las promociones',
          life: 3000
        });
        console.error('Error:', error);
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.promocion = {
      nombre: '',
      descripcion: '',
      tipo: null,
      porcentajeDescuento: null,
      fechaInicio: null,
      fechaFin: null,
      cineId: '',
      salaId: null,
      peliculaId: null,
      clienteId: null
    };
    this.submitted = false;
    this.isEditMode = false;
    this.promocionDialog = true;
  }

  editPromocion(promocion: ResponsePromocionDTO) {
    this.promocion = {
      promocionId: promocion.promocionId,
      nombre: promocion.nombre,
      descripcion: promocion.descripcion,
      tipo: promocion.tipo,
      porcentajeDescuento: promocion.porcentajeDescuento,
      fechaInicio: new Date(promocion.fechaInicio),
      fechaFin: new Date(promocion.fechaFin),
      activa: promocion.activa,
      cineId: promocion.cineId,
      salaId: promocion.salaId,
      peliculaId: promocion.peliculaId,
      clienteId: promocion.clienteId
    };
    this.isEditMode = true;
    this.promocionDialog = true;
  }

  deletePromocion(promocion: ResponsePromocionDTO) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea desactivar la promoción ' + promocion.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.promocionService.desactivarPromocion(promocion.promocionId).subscribe({
          next: () => {
            this.loadPromociones();
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Promoción desactivada',
              life: 3000
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al desactivar la promoción',
              life: 3000
            });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  deleteSelectedPromociones() {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea desactivar las promociones seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let completedCount = 0;
        const totalCount = this.selectedPromociones.length;

        this.selectedPromociones.forEach((promocion) => {
          this.promocionService.desactivarPromocion(promocion.promocionId).subscribe({
            next: () => {
              completedCount++;
              if (completedCount === totalCount) {
                this.loadPromociones();
                this.selectedPromociones = [];
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Promociones desactivadas',
                  life: 3000
                });
              }
            },
            error: (error) => {
              completedCount++;
              console.error('Error:', error);
            }
          });
        });
      }
    });
  }

  togglePromocionEstado(promocion: ResponsePromocionDTO) {
    const action = promocion.activa ? 'desactivar' : 'activar';
    const observable = promocion.activa
      ? this.promocionService.desactivarPromocion(promocion.promocionId)
      : this.promocionService.activarPromocion(promocion.promocionId);

    observable.subscribe({
      next: () => {
        this.loadPromociones();
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `Promoción ${action === 'activar' ? 'activada' : 'desactivada'}`,
          life: 3000
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${action} la promoción`,
          life: 3000
        });
        console.error('Error:', error);
      }
    });
  }

  hideDialog() {
    this.promocionDialog = false;
    this.submitted = false;
  }

  savePromocion() {
    this.submitted = true;

    if (!this.validatePromocion()) {
      return;
    }

    if (this.isEditMode) {
      this.updatePromocion();
    } else {
      this.createPromocion();
    }
  }

  validatePromocion(): boolean {
    return !!(
      this.promocion.nombre?.trim() &&
      this.promocion.tipo &&
      this.promocion.porcentajeDescuento &&
      this.promocion.fechaInicio &&
      this.promocion.fechaFin &&
      this.promocion.cineId?.trim()
    );
  }

  createPromocion() {
    const dto: CrearPromocionDTO = {
      nombre: this.promocion.nombre.trim(),
      descripcion: this.promocion.descripcion?.trim() || undefined,
      tipo: this.promocion.tipo,
      porcentajeDescuento: this.promocion.porcentajeDescuento,
      fechaInicio: this.formatDateToISO(this.promocion.fechaInicio),
      fechaFin: this.formatDateToISO(this.promocion.fechaFin),
      cineId: this.promocion.cineId.trim(),
      salaId: this.promocion.salaId?.trim() || undefined,
      peliculaId: this.promocion.peliculaId?.trim() || undefined,
      clienteId: this.promocion.clienteId?.trim() || undefined
    };

    this.promocionService.crearPromocion(dto).subscribe({
      next: () => {
        this.loadPromociones();
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Promoción creada',
          life: 3000
        });
        this.promocionDialog = false;
        this.promocion = {};
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al crear la promoción',
          life: 3000
        });
        console.error('Error:', error);
      }
    });
  }

  updatePromocion() {
    const dto: EditarPromocionDTO = {
      nombre: this.promocion.nombre?.trim(),
      descripcion: this.promocion.descripcion?.trim(),
      tipo: this.promocion.tipo,
      porcentajeDescuento: this.promocion.porcentajeDescuento,
      fechaInicio: this.promocion.fechaInicio ? this.formatDateToISO(this.promocion.fechaInicio) : undefined,
      fechaFin: this.promocion.fechaFin ? this.formatDateToISO(this.promocion.fechaFin) : undefined,
      activa: this.promocion.activa,
      salaId: this.promocion.salaId?.trim() || undefined,
      peliculaId: this.promocion.peliculaId?.trim() || undefined,
      clienteId: this.promocion.clienteId?.trim() || undefined
    };

    this.promocionService.editarPromocion(this.promocion.promocionId, dto).subscribe({
      next: () => {
        this.loadPromociones();
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Promoción actualizada',
          life: 3000
        });
        this.promocionDialog = false;
        this.promocion = {};
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al actualizar la promoción',
          life: 3000
        });
        console.error('Error:', error);
      }
    });
  }

  formatDateToISO(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getSeverityEstado(activa: boolean) {
    return activa ? 'success' : 'danger';
  }

  getSeverityTipo(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (tipo) {
      case TipoPromocion.GENERAL:
        return 'info';
      case TipoPromocion.CINE:
        return 'secondary';  // Cambiar 'primary' por cualquiera de los valores válidos
      case TipoPromocion.SALA:
        return 'warn';
      case TipoPromocion.PELICULA:
        return 'success';
      case TipoPromocion.CLIENTE:
        return 'contrast';
      default:
        return 'info';
    }
  }

  exportCSV() {
    this.dt.exportCSV();
  }

}
