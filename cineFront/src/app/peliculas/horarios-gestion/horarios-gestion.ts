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
import { cine } from '@/models/Cine';
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
    <div class="grid mb-4" style="row-gap:10px; column-gap:10px">
      <div class="col-12 md:col-4">
        <label class="block font-bold mb-2">Película *</label>
        <p-select
          class="w-full"
          [(ngModel)]="sel.peliculaId"
          [options]="peliculas"
          optionLabel="titulo"
          optionValue="id"
          placeholder="Selecciona película"
          (onChange)="onChangePelicula()"
        />
      </div>

      <div class="col-12 md:col-4">
        <label class="block font-bold mb-2">Cine *</label>
        <p-select
          class="w-full"
          [(ngModel)]="sel.cinemaId"
          [options]="cines"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Selecciona cine"
          (onChange)="onChangeCine()"
        />
      </div>

      <div class="col-12 md:col-4">
        <label class="block font-bold mb-2">Sala *</label>
        <p-select
          class="w-full"
          [(ngModel)]="sel.salaId"
          [options]="salas"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Selecciona sala"
          [disabled]="!salas.length"
        />
      </div>

      <div class="col-12 md:col-3">
        <label class="block font-bold mb-2">Desde</label>
        <p-datepicker
          class="w-full"
          [(ngModel)]="filtrosDesde"
          [showIcon]="true"
          [showTime]="true"
        ></p-datepicker>
      </div>
      <div class="col-12 md:col-3">
        <label class="block font-bold mb-2">Hasta</label>
        <p-datepicker
          class="w-full"
          [(ngModel)]="filtrosHasta"
          [showIcon]="true"
          [showTime]="true"
        ></p-datepicker>
      </div>
      <div class="col-12 md:col-3 flex items-center gap-2">
        <p-toggleswitch
          [(ngModel)]="soloActivos"
          (onChange)="load()"
        ></p-toggleswitch
        ><span>Solo activos</span>
      </div>
      <div class="col-12 md:col-3 flex gap-2">
        <p-button label="Buscar" icon="pi pi-search" (click)="load()" />
        <p-button
          label="Limpiar"
          icon="pi pi-eraser"
          severity="secondary"
          (click)="clearFilters()"
        />
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
    <p-dialog
      [(visible)]="dialog"
      [style]="{ width: '760px' }"
      [modal]="true"
      header="{{ form.id ? 'Editar' : 'Nuevo' }} horario"
    >
      <ng-template #content>
        <div class="grid" style="row-gap:10px; column-gap:10px">
          <div class="col-12 md:col-4">
            <label class="block font-bold mb-2">Idioma *</label>
            <input
              pInputText
              class="w-full"
              [(ngModel)]="form.idioma"
              placeholder="ES/EN..."
            />
          </div>
          <div class="col-12 md:col-4">
            <label class="block font-bold mb-2">Formato *</label>
            <input
              pInputText
              class="w-full"
              [(ngModel)]="form.formato"
              placeholder="2D/3D/IMAX..."
            />
          </div>
          <div class="col-12 md:col-4">
            <label class="block font-bold mb-2">Precio</label>
            <p-inputnumber
              class="w-full"
              [(ngModel)]="form.precio"
              [min]="0"
              [useGrouping]="false"
              mode="currency"
              currency="GTQ"
              locale="es-GT"
            ></p-inputnumber>
          </div>

          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Inicio *</label>
            <p-datepicker
              class="w-full"
              [(ngModel)]="formInicio"
              [showIcon]="true"
              [showTime]="true"
            ></p-datepicker>
          </div>
          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Fin *</label>
            <p-datepicker
              class="w-full"
              [(ngModel)]="formFin"
              [showIcon]="true"
              [showTime]="true"
            ></p-datepicker>
          </div>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="dialog = false"
        />
        <p-button label="Guardar" icon="pi pi-check" (click)="save()" />
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
  newHorario() {
    if (!this.sel.peliculaId || !this.sel.cinemaId || !this.sel.salaId) {
      this.toast.add({
        severity: 'warn',
        summary: 'Campos',
        detail: 'Selecciona película, cine y sala',
        life: 2000,
      });
      return;
    }
    this.form = { id: null, idioma: '', formato: '', precio: 0 };
    this.formInicio = this.formFin = null;
    this.dialog = true;
  }

  edit(h: Horario) {
    this.sel.peliculaId = h.peliculaId;
    this.sel.cinemaId = h.cinemaId;
    this.sel.salaId = h.salaId;
    this.form = {
      id: h.id,
      idioma: h.idioma,
      formato: h.formato,
      precio: h.precio ?? 0,
    };
    this.formInicio = h.inicio ? new Date(h.inicio) : null;
    this.formFin = h.fin ? new Date(h.fin) : null;
    this.dialog = true;
  }

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
      this.toast.add({
        severity: 'warn',
        summary: 'Campos',
        detail: 'Completa todos los campos',
        life: 2000,
      });
      return;
    }

    const payload: HorarioCreate = {
      peliculaId: this.sel.peliculaId,
      cinemaId: this.sel.cinemaId,
      salaId: this.sel.salaId,
      idioma: this.form.idioma,
      formato: this.form.formato,
      inicio: this.toApiLocal(this.formInicio!), // 👈 antes usabas toISO()
      fin: this.toApiLocal(this.formFin!), // 👈
      precio: Number(this.form.precio ?? 0),
    };
    console.log('payload');

    console.log(payload);

    const req = this.form.id
      ? this.horarios.update(this.form.id, payload)
      : this.horarios.create(payload);
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
}
