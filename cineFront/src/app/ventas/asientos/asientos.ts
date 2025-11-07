import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrearAsientoDTO, ResponseAsientoDTO } from '@/models/asiento.model';
import { AsientoService } from '@/services/asiento.service';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {CineServiceService} from '@/services/cine-service.service';
import {SalaServicio} from '@/services/sala-servicio.service';
import {cine, sala} from '@/models/Cine';
import { SelectModule } from 'primeng/select';
import {isArray} from 'chart.js/helpers';


@Component({
  selector: 'app-asientos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    TagModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
    ChipModule,
    DividerModule,
    ConfirmDialogModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService, AsientoService, CineServiceService, SalaServicio],
  templateUrl: './asientos.html',
  styleUrl: './asientos.scss',
})
export class Asientos implements OnInit {

  asientos: ResponseAsientoDTO[] = [];
  asientoSeleccionadoDetalle: ResponseAsientoDTO | null = null;
  asientosSeleccionados: ResponseAsientoDTO[] = [];

  cines: cine[] = [];
  salas: sala[]= []
  cineSeleccionado: any = null;
  salaSeleccionada: any = null;
  salaIdSeleccionada: string = '';
  // Loading states
  loading: boolean = false;
  loadingCines: boolean = false;
  loadingSalas: boolean = false;


  // Formularios
  asientoForm!: FormGroup;
  mapaForm!: FormGroup;

  // Diálogos
  displayDialogCrear: boolean = false;
  displayDialogGenerarMapa: boolean = false;
  displayDialogDetalle: boolean = false;

  constructor(
    private asientoService: AsientoService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cineService: CineServiceService,
    private salaServicio: SalaServicio
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
  }


  inicializarFormularios(): void {
    this.cineService.obtenerCInesLIst()
      .subscribe({
        next: data => {
          this.cines = data;
        }, error: err => {
          console.error('Error al cargar cines:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cines'
          });
        }
      });
    this.asientoForm = this.fb.group({
      salaId: ['', Validators.required],
      fila: ['', [Validators.required, Validators.maxLength(1)]],
      columna: [null, [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    this.mapaForm = this.fb.group({
      salaId: ['', Validators.required],
      filaInicio: ['', [Validators.required, Validators.maxLength(1)]],
      filaFin: ['', [Validators.required, Validators.maxLength(1)]],
      cantidadColumnas: [null, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  onCineChange(event: any): void {
    this.salaSeleccionada = null;

    this.salas = [];
    this.asientos = [];
    this.asientosSeleccionados = [];
    this.salaIdSeleccionada = '';
console.log('Seleccionado', this.cineSeleccionado, event.value);
    if (event.value && event.value.id) {
      console.log('cargar salas');
      this.cargarSalasPorCine(event.value.id);
    }
  }

  onSalaChange(event: any): void {
    this.asientos = [];
    this.asientosSeleccionados = [];

    if (event.value && event.value.id) {
      this.salaIdSeleccionada = event.value.id;
    } else {
      this.salaIdSeleccionada = '';
    }
  }


  cargarSalasPorCine(cineId: string): void {
    this.loadingSalas = true;
    this.salaServicio.listarSalasId(cineId).subscribe({
      next: (res) => {
        this.salas =  res as sala[];
        this.loadingSalas = false;

        if (isArray(res) && res.length == 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'Este cine no tiene salas registradas'
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar salas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las salas'
        });
        this.loadingSalas = false;
      }
    });
  }


  cargarAsientosPorSala(): void {
    if (!this.salaIdSeleccionada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un ID de sala'
      });
      return;
    }

    this.loading = true;
    this.asientoService.listarAsientosPorSala(this.salaIdSeleccionada).subscribe({
      next: (asientos) => {
        this.asientos = asientos;
        this.asientosSeleccionados = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${asientos.length} asientos cargados`
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar asientos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los asientos'
        });
        this.loading = false;
      }
    });
  }


  abrirDialogoCrearAsiento(): void {
    this.asientoForm.reset();
    if (this.salaIdSeleccionada) {
      this.asientoForm.patchValue({ salaId: this.salaIdSeleccionada });
    }
    this.displayDialogCrear = true;
  }


  crearAsiento(): void {
    if (this.asientoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Complete todos los campos requeridos'
      });
      Object.keys(this.asientoForm.controls).forEach(key => {
        this.asientoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const nuevoAsiento: CrearAsientoDTO = {
      salaId: this.asientoForm.value.salaId,
      fila: this.asientoForm.value.fila.toUpperCase(),
      columna: this.asientoForm.value.columna
    };

    this.asientoService.crearAsiento(nuevoAsiento).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Asiento creado exitosamente'
        });
        this.displayDialogCrear = false;
        if (this.salaIdSeleccionada === nuevoAsiento.salaId) {
          this.cargarAsientosPorSala();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear asiento:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el asiento'
        });
        this.loading = false;
      }
    });
  }


  abrirDialogoGenerarMapa(): void {
    this.mapaForm.reset();
    if (this.salaIdSeleccionada) {
      this.mapaForm.patchValue({ salaId: this.salaIdSeleccionada });
    }
    this.displayDialogGenerarMapa = true;
  }


  generarMapaAsientos(): void {
    if (this.mapaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    const salaId = this.mapaForm.value.salaId;
    const filaInicio = this.mapaForm.value.filaInicio.toUpperCase();
    const filaFin = this.mapaForm.value.filaFin.toUpperCase();
    const cantidadColumnas = this.mapaForm.value.cantidadColumnas;

    const filaInicioCode = filaInicio.charCodeAt(0);
    const filaFinCode = filaFin.charCodeAt(0);

    if (filaInicioCode > filaFinCode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error de validación',
        detail: 'La fila inicial debe ser menor o igual a la fila final'
      });
      return;
    }

    this.loading = true;
    let asientosCreados = 0;
    const totalAsientos = (filaFinCode - filaInicioCode + 1) * cantidadColumnas;

    // Crear asientos en secuencia
    const crearAsientoSecuencial = (filaCode: number, columna: number) => {
      if (filaCode > filaFinCode) {
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: `${asientosCreados} asientos creados exitosamente`
        });
        this.displayDialogGenerarMapa = false;
        if (this.salaIdSeleccionada === salaId) {
          this.cargarAsientosPorSala();
        }
        this.loading = false;
        return;
      }

      if (columna > cantidadColumnas) {
        crearAsientoSecuencial(filaCode + 1, 1);
        return;
      }

      const asiento: CrearAsientoDTO = {
        salaId: salaId,
        fila: String.fromCharCode(filaCode),
        columna: columna
      };

      this.asientoService.crearAsiento(asiento).subscribe({
        next: () => {
          asientosCreados++;
          crearAsientoSecuencial(filaCode, columna + 1);
        },
        error: (error) => {
          console.error('Error al crear asiento:', error);
          crearAsientoSecuencial(filaCode, columna + 1);
        }
      });
    };

    crearAsientoSecuencial(filaInicioCode, 1);
  }


  calcularTotalAsientos(): number {
    if (this.mapaForm.invalid) return 0;

    const filaInicio = this.mapaForm.value.filaInicio?.toUpperCase() || '';
    const filaFin = this.mapaForm.value.filaFin?.toUpperCase() || '';
    const cantidadColumnas = this.mapaForm.value.cantidadColumnas || 0;

    if (!filaInicio || !filaFin || !cantidadColumnas) return 0;

    const filaInicioCode = filaInicio.charCodeAt(0);
    const filaFinCode = filaFin.charCodeAt(0);

    if (filaInicioCode > filaFinCode) return 0;

    return (filaFinCode - filaInicioCode + 1) * cantidadColumnas;
  }


  verDetalleAsiento(asiento: ResponseAsientoDTO): void {
    this.asientoSeleccionadoDetalle = asiento;
    this.displayDialogDetalle = true;
  }


  get filasUnicas(): string[] {
    const filas = [...new Set(this.asientos.map(a => a.fila))];
    return filas.sort();
  }


  obtenerAsientosPorFila(fila: string): ResponseAsientoDTO[] {
    return this.asientos
      .filter(a => a.fila === fila)
      .sort((a, b) => a.columna - b.columna);
  }


  toggleSeleccionAsiento(asiento: ResponseAsientoDTO): void {
    if (!asiento.disponible) return;

    const index = this.asientosSeleccionados.findIndex(a => a.asientoId === asiento.asientoId);
    if (index > -1) {
      this.asientosSeleccionados.splice(index, 1);
    } else {
      this.asientosSeleccionados.push(asiento);
    }
  }


  esAsientoSeleccionado(asiento: ResponseAsientoDTO): boolean {
    return this.asientosSeleccionados.some(a => a.asientoId === asiento.asientoId);
  }


  obtenerTooltipAsiento(asiento: ResponseAsientoDTO): string {
    const estado = asiento.disponible ? 'Disponible' : 'Ocupado';
    return `Asiento ${asiento.fila}${asiento.columna} - ${estado}`;
  }


  get asientosDisponibles(): number {
    return this.asientos.filter(a => a.disponible).length;
  }

  get asientosOcupados(): number {
    return this.asientos.filter(a => !a.disponible).length;
  }

  get porcentajeOcupacion(): number {
    if (this.asientos.length === 0) return 0;
    return Math.round((this.asientosOcupados / this.asientos.length) * 100);
  }

}
