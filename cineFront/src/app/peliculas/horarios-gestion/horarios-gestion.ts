import {
  Component,
  OnInit,
  ViewChild,
  signal,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Horario, HorarioCreate, HorarioService } from '@/services/horario';
import { MovieService } from '../services/movie.service'; // ya lo tienes
import { SalaServicio } from '@/services/sala-servicio.service';
import { Sala } from '@/models/horario';
import { CineServiceService } from '@/services/cine-service.service';
import {cine, sala} from '@/models/Cine';
//import { Sala, SalaService } from '../services/sala.service';

// Interfaces mínimas para tus datos existentes
export interface MovieMin {
  id: string;
  titulo: string;
}
//export interface Cine { id?: string; nombre: string; ubicacion?: string; telefono?: string; }

@Component({
  selector: 'app-horarios-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TagModule,
    RippleModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    InputNumberModule,
  ],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <h3 class="m-0">Gestión de horarios</h3>
      </ng-template>
      <ng-template #end>
        <p-button
          icon="pi pi-plus"
          label="Nuevo horario"
          (onClick)="newHorario()"
          [disabled]="!sel.peliculaId || !sel.cinemaId || !salas.length"
        />
      </ng-template>
    </p-toolbar>

    <!-- Filtros superiores -->
    <div
      class="mb-4"
      style="background: var(--surface-card); padding: 1.5rem; border-radius: 6px;"
    >

      <!-- Primera fila -->
      <div
        style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;"
      >
        <div style="flex: 1; min-width: 250px;">
          <label
            style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
            >Película *</label
          >
          <p-select
            [(ngModel)]="sel.peliculaId"
            [options]="peliculas"
            optionLabel="titulo"
            optionValue="id"
            placeholder="Selecciona película"
            (onChange)="onChangePelicula()"
            [style]="{ width: '100%' }"
          />
        </div>

        <div style="flex: 1; min-width: 250px;">
          <label
            style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
            >Cine *</label
          >
          <p-select
            [(ngModel)]="sel.cinemaId"
            [options]="cines"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Selecciona cine"
            (onChange)="onChangeCine()"
            [style]="{ width: '100%' }"
          />
        </div>

        <div style="flex: 1; min-width: 250px;">
          <label
            style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
            >Sala *</label
          >
          <p-select
            [(ngModel)]="sel.salaId"
            [options]="salas"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Selecciona sala"
            [disabled]="!salas.length"
            [style]="{ width: '100%' }"
          />
        </div>
      </div>

      <!-- Segunda fila -->
      <div style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label
            style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
            >Desde</label
          >
          <p-datepicker
            [(ngModel)]="filtrosDesde"
            [showIcon]="true"
            [showTime]="true"
            [style]="{ width: '100%' }"
          />
        </div>

        <div style="flex: 1; min-width: 200px;">
          <label
            style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
            >Hasta</label
          >
          <p-datepicker
            [(ngModel)]="filtrosHasta"
            [showIcon]="true"
            [showTime]="true"
            [style]="{ width: '100%' }"
          />
        </div>

        <div
          style="flex: 0 0 auto; display: flex; align-items: center; gap: 0.5rem;"
        >
          <p-toggleswitch [(ngModel)]="soloActivos" (onChange)="load()" />
          <span>Solo activos</span>
        </div>

        <div style="flex: 0 0 auto; display: flex; gap: 0.5rem;">
          <p-button label="Buscar" icon="pi pi-search" (onClick)="load()" />
          <p-button
            label="Limpiar"
            icon="pi pi-filter-slash"
            severity="secondary"
            (onClick)="clearFilters()"
          />
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <p-table
      #dt
      [value]="rows()"
      [paginator]="true"
      [rows]="10"
      [rowHover]="true"
      [tableStyle]="{ 'min-width': '72rem' }"
    >
      <ng-template #header>
        <tr>
          <th>Cine</th>
          <th>Sala</th>
          <th>Idioma</th>
          <th>Formato</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Precio</th>
          <th>Estado</th>
          <th style="width:10rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-h>
        <tr>
          <td>{{ nombreCine(h.cinemaId) }}</td>
          <td>{{ nombreSala(h.salaId) }}</td>
          <td>{{ h.idioma }}</td>
          <td>{{ h.formato }}</td>
          <td>{{ h.inicio | date: 'short' }}</td>
          <td>{{ h.fin | date: 'short' }}</td>
          <td>{{ h.precio | currency: 'GTQ' }}</td>
          <td>
            <p-tag
              [value]="h.activo ? 'ACTIVO' : 'INACTIVO'"
              [severity]="h.activo ? 'success' : 'danger'"
            />
          </td>
          <td class="text-right">
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="edit(h)"
            />
            <p-button
              icon="pi pi-ban"
              severity="warn"
              [rounded]="true"
              [outlined]="true"
              [disabled]="!h.activo"
              (click)="desactivar(h)"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="9" class="text-center py-4">Sin horarios</td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog crear/editar -->
    <!-- Dialog crear/editar -->
    <p-dialog
      [(visible)]="dialog"
      [style]="{ width: '760px' }"
      [modal]="true"
      header="{{ form.id ? 'Editar' : 'Nuevo' }} horario"
    >
      <ng-template #content>
         <!-- Fila 0: Cine y Sala (dentro del diálogo) -->
<div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 250px;">
    <label style="display:block; font-weight:600; margin-bottom: .5rem;">Cine *</label>
    <p-select
      [(ngModel)]="sel.cinemaId"
      [options]="cines"
      optionLabel="nombre"
      optionValue="id"
      placeholder="Selecciona cine"
      (onChange)="onDialogChangeCine()"
      [style]="{ width: '100%' }"
      appendTo="body"
    />
  </div>

  <div style="flex: 1; min-width: 250px;">
    <label style="display:block; font-weight:600; margin-bottom: .5rem;">Sala *</label>
    <p-select
      [(ngModel)]="sel.salaId"
      [options]="salas"
      optionLabel="nombre"
      optionValue="id"
      placeholder="Selecciona sala"
      [disabled]="!sel.cinemaId || !salas.length"
      [style]="{ width: '100%' }"
      (onChange)="onChangeSala()"
      appendTo="body"
    />
  </div>
</div>
        <!-- Primera fila: Idioma, Formato, Precio -->
        <div
          style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;"
        >
          <div style="flex: 1; min-width: 200px;">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
              >Idioma *</label
            >
            <input
              pInputText
              [(ngModel)]="form.idioma"
              placeholder="ES/EN..."
              style="width: 100%;"
            />
          </div>

          <div style="flex: 1; min-width: 200px;">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
              >Formato *</label
            >
            <input
              pInputText
              [(ngModel)]="form.formato"
              placeholder="2D/3D/IMAX..."
              style="width: 100%;"
            />
          </div>

          <div style="flex: 1; min-width: 200px;">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
              >Precio</label
            >
            <p-inputnumber
              [(ngModel)]="form.precio"
              [min]="0"
              [useGrouping]="false"
              mode="currency"
              currency="GTQ"
              locale="es-GT"
              [style]="{ width: '100%' }"
            />
          </div>
        </div>

        <!-- Segunda fila: Inicio, Fin -->
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
              >Inicio *</label
            >
            <p-datepicker
              [(ngModel)]="formInicio"
              [showIcon]="true"
              [showTime]="true"
              [style]="{ width: '100%' }"
              appendTo="body"
              dateFormat="dd/mm/yy"
              [touchUI]="false"
            />
          </div>

          <div style="flex: 1; min-width: 300px;">
            <label
              style="display: block; font-weight: 600; margin-bottom: 0.5rem;"
              >Fin *</label
            >
            <p-datepicker
              [(ngModel)]="formFin"
              [showIcon]="true"
              [showTime]="true"
              [style]="{ width: '100%' }"
              appendTo="body"
              dateFormat="dd/mm/yy"
              [touchUI]="false"
            />
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          [text]="true"
          (onClick)="dialog = false"
        />
        <p-button label="Guardar" icon="pi pi-check" (onClick)="save()" />
      </ng-template>
    </p-dialog>
    <p-confirmdialog [style]="{ width: '440px' }" />
    <p-toast />
  `,
  providers: [MessageService, ConfirmationService],
})
export class HorariosGestionComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // selects
  peliculas: MovieMin[] = [];
  cines: cine[] = [];
  salas: Sala[] = [];

  // debajo de tus arrays
  cineMap: Record<string, string> = {};
  salaMap: Record<string, string> = {};

  // helpers seguros
  nombreCine = (id?: string) => (id && this.cineMap[id]) ?? id ?? '-';
  nombreSala = (id?: string) => (id && this.salaMap[id]) ?? id ?? '-';
  // selección actual
  sel = { peliculaId: '', cinemaId: '', salaId: '' };

  // filtros
  filtrosDesde: Date | null = null;
  filtrosHasta: Date | null = null;
  soloActivos = false;

  // tabla
  rows = signal<Horario[]>([]);

  // dialog
  dialog = false;
  form: { id: string | null; idioma: string; formato: string; precio: number } =
    { id: null, idioma: '', formato: '', precio: 0 };
  formInicio: Date | null = null;
  formFin: Date | null = null;

  constructor(
    private horarios: HorarioService,
    private movies: MovieService, // ya lo tienes
    private salasSvc: SalaServicio, // nuevo o el tuyo
    private toast: MessageService,
    private confirm: ConfirmationService,
    private cineS: CineServiceService,
  ) {
    effect(() => {
      this.cines = this.cineS.cinesSignal();
      this.cineMap = {};
      for (const c of this.cines ?? []) {
        if (c?.id) this.cineMap[String(c.id)] = String(c.nombre ?? c.id);
      }
    });
  }

  ngOnInit(): void {
    // 1) Películas
    console.log('cargar peliculas');
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
    this.cineS.obtenerHoteles();

    // se re-asigna cuando cambie el signal

    // 2) Cines (reusa tu servicio existente que ya guarda en signal)
    // Si tu servicio expone un signal u observable, úsalo; si no, al menos llama a cargar:
    // this.cinesSvc.obtenerHoteles(); y luego lee su signal/observable.
    // Para no tocar tu servicio, asumimos que también expone un observable 'cines$' o un método get snapshot.
    // Si no lo tienes, reemplaza esta parte por tu forma actual de obtener el array.
    // -- EJEMPLO GENERICO:
    // this.cinesSvc.obtenerHoteles();
    // this.cinesSvc.cines$?.subscribe(c => this.cines = c);
  }

  // encadenados
  onChangePelicula() {
    this.rows.set([]);
  }

  onChangeCine() {
    this.sel.salaId = '';
    this.salas = [];
    this.salaMap = {}; // <-- limpiar mapa de salas
    if (!this.sel.cinemaId) return;

    this.salasSvc.listarSalasId(this.sel.cinemaId).subscribe({
      next: (salas: any) => {
        this.salas = (salas || []).map((s: any) => ({
          id: String(s.id),
          nombre: s.nombre || s.name || `Sala ${s.id}`,
        }));
        // construir mapa
        for (const s of this.salas) {
          if (s?.id) this.salaMap[String(s.id)] = String(s.nombre ?? s.id);
        }
      },
    });
  }

  // util
  //private toISO(d: Date | null) { return d ? d.toISOString() : ''; }
  // Reemplaza tu toISO por esta
  private toApiLocal(d: Date | null): string {
    if (!d) return '';
    // "Congela" la hora local quitando el offset antes de toISOString()
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    // Devuelve 'YYYY-MM-DDTHH:mm:ss' (SIN 'Z' ni milisegundos)
    return t.toISOString().slice(0, 19);
  }

  load() {
    this.rows.set([]);
    if (!this.sel.peliculaId) {
      this.toast.add({
        severity: 'info',
        summary: 'Filtro',
        detail: 'Selecciona una película',
        life: 2000,
      });
      return;
    }
    this.horarios
      .list({
        peliculaId: this.sel.peliculaId,
        cinemaId: this.sel.cinemaId || undefined,
        desde: this.toApiLocal(this.filtrosDesde) || undefined,
        hasta: this.toApiLocal(this.filtrosHasta) || undefined,
        soloActivos: this.soloActivos,
      })
      .subscribe({
        next: (r) => this.rows.set(r || []),
      });
  }

  clearFilters() {
    this.filtrosDesde = this.filtrosHasta = null;
    this.soloActivos = true;
    this.load();
  }

  // CRUD
  fila: number = 10;
  columna: number = 10;
 newHorario() {
  if (!this.sel.peliculaId || !this.sel.cinemaId) {
    this.toast.add({
      severity: 'warn',
      summary: 'Campos',
      detail: 'Selecciona al menos película y cine',
      life: 2000,
    });
    return;
  }

  this.form = { id: null, idioma: '', formato: '', precio: 0 };
  this.formInicio = this.formFin = null;

  // Asegurar salas del cine actual para el selector dentro del diálogo
  this.ensureSalasLoaded(this.sel.cinemaId, () => {
    // si no hay sala seleccionada y hay salas, autoselecciona la primera
    if (!this.sel.salaId && this.salas.length) this.sel.salaId = this.salas[0].id!;
    this.dialog = true;
  });
}

edit(h: Horario) {
  this.sel.peliculaId = h.peliculaId;
  this.sel.cinemaId   = h.cinemaId;
  this.sel.salaId     = h.salaId;

  this.form = {
    id: h.id,
    idioma: h.idioma,
    formato: h.formato,
    precio: h.precio ?? 0,
  };
  this.formInicio = h.inicio ? new Date(h.inicio) : null;
  this.formFin    = h.fin    ? new Date(h.fin)    : null;

  // Cargar salas del cine del horario, para que el selector muestre la actual marcada
  this.ensureSalasLoaded(this.sel.cinemaId, () => {
    // si la sala del horario no está en la lista (caso raro), no rompas la selección
    if (!this.salas.some(s => s.id === this.sel.salaId) && this.salas.length) {
      this.sel.salaId = this.salas[0].id!;
    }
    this.dialog = true;
  });
}
  saving = false;
  save() {
    const ok =
      this.sel.peliculaId &&
      this.sel.cinemaId &&
      this.sel.salaId &&
      this.form.idioma &&
      this.form.formato &&
      this.formInicio &&
      this.formFin;
    if (!ok) {
      /* toast */ return;
    }

    if (this.formInicio!.getTime() >= this.formFin!.getTime()) {
      this.toast.add({
        severity: 'warn',
        summary: 'Rango inválido',
        detail: 'La hora de inicio debe ser menor que la de fin',
        life: 2200,
      });
      return;
    }

    const payload: HorarioCreate = {
      peliculaId: this.sel.peliculaId,
      cinemaId: this.sel.cinemaId,
      salaId: this.sel.salaId,
      idioma: this.form.idioma,
      formato: this.form.formato,
      inicio: this.toApiLocal(this.formInicio!),
      fin: this.toApiLocal(this.formFin!),
      precio: Number(this.form.precio ?? 0),
      fila: this.fila,
      columna: this.columna
    };

    const req = this.form.id
      ? this.horarios.update(this.form.id, payload)
      : this.horarios.create(payload);
    this.saving = true;
    req.subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Horario guardado',
          life: 2200,
        });
        this.dialog = false;
        this.load();
      },
      error: () =>
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar',
          life: 2500,
        }),
      complete: () => (this.saving = false),
    });
  }

  desactivar(h: Horario) {
    this.confirm.confirm({
      message: '¿Desactivar este horario?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.horarios.desactivar(h.id).subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: 'Horario desactivado',
              life: 2200,
            });
            this.load();
          },
        });
      },
    });
  }

  // Reuso del cambio de cine dentro del diálogo (no afecta los filtros superiores)
onDialogChangeCine() {
  // Al cambiar cine dentro del diálogo, hay que recargar salas y resetear sala
  this.sel.salaId = '';
  if (!this.sel.cinemaId) {
    this.salas = [];
    this.salaMap = {};
    return;
  }
  this.ensureSalasLoaded(this.sel.cinemaId);
}

// Carga salas para un cine específico y ejecuta un callback opcional al terminar
  salaLis: sala[] = [];
private ensureSalasLoaded(cinemaId: string, done?: () => void) {
  this.salas = [];
  this.salaMap = {};
  this.salasSvc.listarSalasId(cinemaId).subscribe({
    next: (salas: any) => {
      this.salaLis = salas as sala[];
      this.salas = (salas || []).map((s: any) => ({
        id: String(s.id),
        nombre: s.nombre || s.name || `Sala ${s.id}`,
      }));
      this.salaMap = this.salas.reduce((acc, s) => {
        if (s?.id) acc[String(s.id)] = String(s.nombre ?? s.id);
        return acc;
      }, {} as Record<string, string>);
      if (done) done();
    },
    error: () => {
      this.toast.add({ severity:'error', summary:'Error', detail:'No se pudieron cargar las salas', life:2500 });
      if (done) done();
    }
  });
}

  protected onChangeSala() {
    const salaEncontrada = this.salaLis.find(s => s.id === this.sel.salaId);
    if (!salaEncontrada) return;
    this.fila = Number(salaEncontrada.matrizAsientos.filas);
    this.columna = Number(salaEncontrada.matrizAsientos.columnas);
  }
}
