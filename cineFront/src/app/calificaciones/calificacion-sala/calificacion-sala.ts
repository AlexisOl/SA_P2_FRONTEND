import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormsModule, FormBuilder, Validators} from '@angular/forms';
import {
  CrearCalificacionSalaDTO,
  MAX_CARACTERES_COMENTARIO,
  PUNTUACION_MAXIMA,
  PUNTUACION_MINIMA,
  ResponseCalificacionSalaDTO
} from '@/models/calificacion-sala.model';
import {FormGroup} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {CalificacionSalaService} from '@/services/calificacion-sala.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-calificacion-sala',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // PrimeNG
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    RatingModule,
    CardModule,
    TagModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
    ChipModule,
    DividerModule,
    ProgressBarModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService, CalificacionSalaService],
  templateUrl: './calificacion-sala.html',
  styleUrl: './calificacion-sala.scss',
})
export class CalificacionSala implements OnInit {


  calificaciones: ResponseCalificacionSalaDTO[] = [];
  calificacionSeleccionada: ResponseCalificacionSalaDTO | null = null;
  promedioCalificacion: number = 0;
  calificacionForm!: FormGroup;

  // Variables para diálogos
  displayDialog: boolean = false;
  displayDetalleDialog: boolean = false;

  // Variables para loading
  loading: boolean = false;
  loadingPromedio: boolean = false;

  // Constantes para el template
  readonly PUNTUACION_MIN = PUNTUACION_MINIMA;
  readonly PUNTUACION_MAX = PUNTUACION_MAXIMA;
  readonly MAX_COMENTARIO = MAX_CARACTERES_COMENTARIO;

  // Rating
  ratingValue: number = 0;

  // Estadísticas
  totalCalificaciones: number = 0;
  distribucionEstrellas: Map<number, number> = new Map();

  constructor(
    private calificacionService: CalificacionSalaService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCalificaciones();
  }


  inicializarFormulario(): void {
    this.calificacionForm = this.fb.group({
      usuarioId: ['', Validators.required],
      salaId: ['', Validators.required],
      puntuacion: [null, [
        Validators.required,
        Validators.min(PUNTUACION_MINIMA),
        Validators.max(PUNTUACION_MAXIMA)
      ]],
      comentario: ['', [Validators.maxLength(MAX_CARACTERES_COMENTARIO)]]
    });
  }


  abrirDialogoCalificacion(): void {
    this.calificacionForm.reset();
    this.ratingValue = 0;
    this.displayDialog = true;
  }


  crearCalificacion(): void {
    if (this.calificacionForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor complete todos los campos requeridos'
      });
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;

    const nuevaCalificacion: CrearCalificacionSalaDTO = {
      usuarioId: this.calificacionForm.value.usuarioId,
      salaId: this.calificacionForm.value.salaId,
      puntuacion: this.calificacionForm.value.puntuacion,
      comentario: this.calificacionForm.value.comentario || undefined,
      fecha: new Date().toISOString()
    };

    this.calificacionService.crearCalificacion(nuevaCalificacion).subscribe({
      next: (calificacion) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Calificación enviada exitosamente',
          life: 3000
        });
        this.displayDialog = false;
        this.cargarCalificaciones();
        this.cargarPromedioCalificacion(calificacion.salaId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear calificación:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la calificación'
        });
        this.loading = false;
      }
    });
  }


  marcarCamposComoTocados(): void {
    Object.keys(this.calificacionForm.controls).forEach(key => {
      this.calificacionForm.get(key)?.markAsTouched();
    });
  }


  cargarCalificaciones(): void {
    this.loading = true;
    this.calificacionService.listarCalificaciones().subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.calcularDistribucionEstrellas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar calificaciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las calificaciones'
        });
        this.loading = false;
      }
    });
  }


  cargarCalificacionesPorSala(salaId: string): void {
    this.loading = true;
    this.calificacionService.listarCalificacionesPorSala(salaId).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.calcularDistribucionEstrellas();
        this.cargarPromedioCalificacion(salaId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar calificaciones:', error);
        this.loading = false;
      }
    });
  }

  verDetalleCalificacion(calificacion: ResponseCalificacionSalaDTO): void {
    this.calificacionSeleccionada = calificacion;
    this.displayDetalleDialog = true;
  }

  cargarPromedioCalificacion(salaId: string): void {
    this.loadingPromedio = true;
    this.calificacionService.obtenerPromedioCalificacion(salaId).subscribe({
      next: (response) => {
        this.promedioCalificacion = response.promedio;
        this.loadingPromedio = false;
      },
      error: (error) => {
        console.error('Error al obtener promedio:', error);
        this.loadingPromedio = false;
      }
    });
  }


  filtrarCalificacionesExcelentes(): void {
    this.loading = true;
    this.calificacionService.listarCalificacionesPorRango(4, 5).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.messageService.add({
          severity: 'info',
          summary: 'Filtro aplicado',
          detail: `${calificaciones.length} calificaciones excelentes encontradas`
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar:', error);
        this.loading = false;
      }
    });
  }


  filtrarCalificacionesRegulares(): void {
    this.loading = true;
    this.calificacionService.listarCalificacionesPorRango(3, 3).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.messageService.add({
          severity: 'info',
          summary: 'Filtro aplicado',
          detail: `${calificaciones.length} calificaciones regulares encontradas`
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar:', error);
        this.loading = false;
      }
    });
  }

  filtrarCalificacionesMalas(): void {
    this.loading = true;
    this.calificacionService.listarCalificacionesPorRango(1, 2).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.messageService.add({
          severity: 'warn',
          summary: 'Filtro aplicado',
          detail: `${calificaciones.length} calificaciones bajas encontradas`
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar:', error);
        this.loading = false;
      }
    });
  }


  onRatingChange(value: number): void {
    this.ratingValue = value;
    this.calificacionForm.patchValue({ puntuacion: value });
  }


  calcularDistribucionEstrellas(): void {
    this.distribucionEstrellas.clear();
    for (let i = 1; i <= 5; i++) {
      this.distribucionEstrellas.set(i, 0);
    }
    this.calificaciones.forEach(cal => {
      const count = this.distribucionEstrellas.get(cal.puntuacion) || 0;
      this.distribucionEstrellas.set(cal.puntuacion, count + 1);
    });
  }


  obtenerPorcentajeEstrella(puntuacion: number): number {
    if (this.totalCalificaciones === 0) return 0;
    const count = this.distribucionEstrellas.get(puntuacion) || 0;
    return Math.round((count / this.totalCalificaciones) * 100);
  }


  getSeverityBadge(puntuacion: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (puntuacion >= 4) return 'success';
    if (puntuacion >= 3) return 'info';
    if (puntuacion >= 2) return 'warn';
    return 'danger';
  }


  getIconoPuntuacion(puntuacion: number): string {
    if (puntuacion >= 4) return 'pi pi-thumbs-up';
    if (puntuacion >= 3) return 'pi pi-minus';
    return 'pi pi-thumbs-down';
  }


  obtenerTextoCalificacion(puntuacion: number): string {
    const textos: { [key: number]: string } = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    };
    return textos[puntuacion] || '';
  }


  calcularPromedioLocal(): number {
    if (this.calificaciones.length === 0) return 0;
    const suma = this.calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0);
    return Number((suma / this.calificaciones.length).toFixed(2));
  }

  limpiarFiltros(): void {
    this.cargarCalificaciones();
  }

}
