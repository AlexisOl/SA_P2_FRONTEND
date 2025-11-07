import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormsModule, FormBuilder, Validators} from '@angular/forms';
import {
  CrearCalificacionPeliculaDTO,
  MAX_CARACTERES_COMENTARIO,
  PUNTUACION_MAXIMA,
  PUNTUACION_MINIMA,
  ResponseCalificacionPeliculaDTO
} from '@/models/calificacion-pelicula.model';
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
import {CalificacionPeliculaService} from '@/services/calificacion-pelicula.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {MovieMin} from '@/peliculas/horarios-gestion/horarios-gestion';
import {MovieService} from '@/peliculas/services/movie.service';
import {AuthService} from '@/services/auth';
import {ResponseBoletoDetalladoDTO} from '@/models/boleto.model';
import {VentaService} from '@/services/venta.service';
import {BoletoService} from '@/services/boleto.service';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-calificacion-pelicula',
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
    ConfirmDialogModule,
    ProgressSpinner
  ],
  providers: [MessageService, ConfirmationService, CalificacionPeliculaService, MovieService, AuthService, VentaService, BoletoService],
  templateUrl: './calificacion-pelicula.html',
  styleUrl: './calificacion-pelicula.scss',
})
export class CalificacionPelicula implements OnInit {
  calificaciones: ResponseCalificacionPeliculaDTO[] = [];
  calificacionSeleccionada: ResponseCalificacionPeliculaDTO | null = null;
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
  peliculas: MovieMin[] = [];

  // NUEVO: Para gestionar películas por calificar
  usuarioId: string = '';
  peliculasPorCalificar: Array<{
    peliculaId: string;
    peliculaTitulo: string;
    yaCalificada: boolean;
  }> = [];
  cargandoPeliculas: boolean = false;

  constructor(
    private calificacionService: CalificacionPeliculaService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private movies: MovieService,
    private authService: AuthService,
    private ventaService: VentaService,
    private boletoService: BoletoService,
  ) {}

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
        this.cargarPeliculasPorCalificar();
      }
    });

    this.authService.fetchAndCacheUser().subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
        this.cargarPeliculasPorCalificar();
      }
    });
    this.inicializarFormulario();
    this.cargarCalificaciones();
  }

  cargarPeliculas() {
    this.movies.list().subscribe({
      next: (list: any) => {
        console.log('cargar peliculas');

        // adapta si tu Movie tiene otro shape
        this.peliculas = (list || []).map((m: any) => ({
          id: m.id,
          titulo: m.titulo,
        }));
      },
    });
  }


  inicializarFormulario(): void {
    this.calificacionForm = this.fb.group({
      usuarioId: ['', Validators.required],
      peliculaId: ['', Validators.required],
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

    const nuevaCalificacion: CrearCalificacionPeliculaDTO = {
      usuarioId: this.calificacionForm.value.usuarioId,
      peliculaId: this.calificacionForm.value.peliculaId,
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
        this.cargarPromedioCalificacion(calificacion.peliculaId);
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


  cargarCalificacionesPorPelicula(peliculaId: string): void {
    this.loading = true;
    this.calificacionService.listarCalificacionesPorPelicula(peliculaId).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.totalCalificaciones = calificaciones.length;
        this.calcularDistribucionEstrellas();
        this.cargarPromedioCalificacion(peliculaId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar calificaciones:', error);
        this.loading = false;
      }
    });
  }


  verDetalleCalificacion(calificacion: ResponseCalificacionPeliculaDTO): void {
    this.calificacionSeleccionada = calificacion;
    this.displayDetalleDialog = true;
  }


  cargarPromedioCalificacion(peliculaId: string): void {
    this.loadingPromedio = true;
    this.calificacionService.obtenerPromedioCalificacion(peliculaId).subscribe({
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

  cargarPeliculasPorCalificar(): void {
    if (!this.usuarioId) return;

    this.cargandoPeliculas = true;

    // 1. Obtener todas las ventas del usuario
    this.ventaService.listarVentas({ usuarioId: this.usuarioId }).subscribe({
      next: (ventas) => {
        // 2. Para cada venta, obtener sus boletos
        const promesasBoletos = ventas.map(venta =>
          this.boletoService.listarBoletosPorVenta(venta.ventaId).toPromise()
        );

        Promise.all(promesasBoletos).then((resultadosBoletos) => {
          // 3. Extraer películas únicas
          const peliculasMap = new Map<string, string>();

          resultadosBoletos.forEach(boletos => {
            if (boletos) {
              boletos.forEach((boleto: ResponseBoletoDetalladoDTO) => {
                peliculasMap.set(boleto.peliculaId, boleto.peliculaTitulo);
              });
            }
          });

          // 4. Verificar cuáles ya fueron calificadas
          this.calificacionService.listarCalificacionesPorUsuario(this.usuarioId).subscribe({
            next: (misCalificaciones) => {
              this.peliculasPorCalificar = Array.from(peliculasMap.entries()).map(([id, titulo]) => ({
                peliculaId: id,
                peliculaTitulo: titulo,
                yaCalificada: misCalificaciones.some(cal => cal.peliculaId === id)
              }));

              this.cargandoPeliculas = false;
            },
            error: (error) => {
              console.error('Error al cargar mis calificaciones:', error);
              this.cargandoPeliculas = false;
            }
          });
        }).catch(error => {
          console.error('Error al cargar boletos:', error);
          this.cargandoPeliculas = false;
        });
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus películas'
        });
        this.cargandoPeliculas = false;
      }
    });
  }

  /**
   * Abrir diálogo para calificar una película específica
   */
  abrirDialogoCalificarPelicula(peliculaId: string, peliculaTitulo: string): void {
    this.calificacionForm.patchValue({
      usuarioId: this.usuarioId,
      peliculaId: peliculaId
    });
    this.ratingValue = 0;
    this.displayDialog = true;

    this.messageService.add({
      severity: 'info',
      summary: 'Calificar Película',
      detail: `Calificando: ${peliculaTitulo}`,
      life: 3000
    });
  }

}
