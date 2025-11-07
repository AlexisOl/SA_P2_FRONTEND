import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { HorarioService } from '@/services/horario';
import { Horario, HorarioCreate } from '@/models/horario';

//import { Horario, HorarioCreate, HorarioService } from './services/horario';

// Si ya tienes el servicio de cines, úsalo; aquí dejo una interfaz mínima:
export interface Cine { id?: string; nombre: string; ubicacion?: string; telefono?: string; }

@Component({
  selector: 'app-horarios-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule, ToastModule,
    ConfirmDialogModule, DialogModule, InputTextModule, TagModule, RippleModule,
    SelectModule, DatePickerModule, ToggleSwitchModule, InputNumberModule
  ],
  template: `
  <p-toolbar styleClass="mb-4">
    <ng-template #start>
      <p-button icon="pi pi-arrow-left" label="Regresar" severity="secondary" (onClick)="goBack()"/>
    </ng-template>
    <ng-template #end>
      <p-button icon="pi pi-plus" label="Nuevo horario" (onClick)="newHorario()" />
    </ng-template>
  </p-toolbar>

  <div class="grid mb-4" style="row-gap:10px; column-gap:10px">
    <div class="col-12 md:col-3">
      <label class="block font-bold mb-2">Película</label>
      <input pInputText class="w-full" [(ngModel)]="filtros.peliculaId" placeholder="peliculaId (UUID)" />
    </div>
    <div class="col-12 md:col-3">
      <label class="block font-bold mb-2">Cine</label>
      <select class="p-inputtext p-component w-full" [(ngModel)]="filtros.cinemaId">
        <option value="">Todos</option>
        <option *ngFor="let c of cines" [value]="c.id">{{ c.nombre }}</option>
      </select>
    </div>
    <div class="col-12 md:col-3">
      <label class="block font-bold mb-2">Desde</label>
      <p-datepicker class="w-full" [(ngModel)]="filtrosDesde" [showIcon]="true" [showTime]="true"></p-datepicker>
    </div>
    <div class="col-12 md:col-3">
      <label class="block font-bold mb-2">Hasta</label>
      <p-datepicker class="w-full" [(ngModel)]="filtrosHasta" [showIcon]="true" [showTime]="true"></p-datepicker>
    </div>
    <div class="col-12 flex items-center gap-3">
      <p-toggleswitch [(ngModel)]="filtros.soloActivos" (onChange)="load()"></p-toggleswitch>
      <span>Solo activos</span>
      <p-button label="Buscar" icon="pi pi-search" (onClick)="load()" />
      <p-button label="Limpiar" icon="pi pi-eraser" severity="secondary" (onClick)="clearFilters()" />
    </div>
  </div>

  <p-table #dt [value]="rows()" [paginator]="true" [rows]="10" [rowHover]="true" [tableStyle]="{ 'min-width': '70rem' }">
    <ng-template #header>
      <tr>
        <th>Cine</th><th>Sala</th><th>Idioma</th><th>Formato</th>
        <th>Inicio</th><th>Fin</th><th>Precio</th><th>Estado</th><th style="width:10rem"></th>
      </tr>
    </ng-template>
    <ng-template #body let-h>
      <tr>
        <td>{{ h.cinemaId }}</td>
        <td>{{ h.salaId }}</td>
        <td>{{ h.idioma }}</td>
        <td>{{ h.formato }}</td>
        <td>{{ h.inicio | date:'short' }}</td>
        <td>{{ h.fin    | date:'short' }}</td>
        <td>{{ h.precio | currency:'GTQ' }}</td>
        <td><p-tag [value]="h.activo ? 'ACTIVO' : 'INACTIVO'" [severity]="h.activo ? 'success' : 'danger'"/></td>
        <td class="text-right">
          <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(h)" />
          <p-button icon="pi pi-ban" severity="warn" [rounded]="true" [outlined]="true" [disabled]="!h.activo" (click)="desactivar(h)" />
        </td>
      </tr>
    </ng-template>
    <ng-template #emptymessage>
      <tr><td colspan="9" class="text-center py-4">Sin horarios</td></tr>
    </ng-template>
  </p-table>

  <!-- Dialog crear/editar -->
  <p-dialog [(visible)]="dialog" [style]="{ width: '760px' }" [modal]="true" header="{{ form.id ? 'Editar' : 'Nuevo' }} horario">
    <ng-template #content>
      <div class="grid" style="row-gap:10px; column-gap:10px">
        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Cine *</label>
          <select class="p-inputtext p-component w-full" [(ngModel)]="form.cinemaId">
            <option value="" disabled>Selecciona cine</option>
            <option *ngFor="let c of cines" [value]="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Sala *</label>
          <input pInputText class="w-full" [(ngModel)]="form.salaId" placeholder="Sala/ID" />
        </div>
        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Idioma *</label>
          <input pInputText class="w-full" [(ngModel)]="form.idioma" placeholder="ES/EN..." />
        </div>

        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Formato *</label>
          <input pInputText class="w-full" [(ngModel)]="form.formato" placeholder="2D/3D/IMAX..." />
        </div>
        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Inicio *</label>
          <p-datepicker class="w-full" [(ngModel)]="formInicio" [showIcon]="true" [showTime]="true"></p-datepicker>
        </div>
        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Fin *</label>
          <p-datepicker class="w-full" [(ngModel)]="formFin" [showIcon]="true" [showTime]="true"></p-datepicker>
        </div>

        <div class="col-12 md:col-4">
          <label class="block font-bold mb-2">Precio</label>
          <p-inputnumber class="w-full" [(ngModel)]="form.precio" [min]="0" [useGrouping]="false" mode="currency" currency="GTQ" locale="es-GT"></p-inputnumber>
        </div>
      </div>
    </ng-template>
    <ng-template #footer>
      <p-button label="Cancelar" icon="pi pi-times" text (click)="dialog=false"/>
      <p-button label="Guardar" icon="pi pi-check" (click)="save()"/>
    </ng-template>
  </p-dialog>

  <p-confirmdialog [style]="{ width: '440px' }" />
  <p-toast />
  `,
  providers: [MessageService, ConfirmationService]
})
export class HorariosPageComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // estado
  rows = signal<Horario[]>([]);
  loading = false;

  // filtros
  filtros = { peliculaId: '', cinemaId: '', soloActivos: true };
  filtrosDesde: Date | null = null;
  filtrosHasta: Date | null = null;

  // cines (llénalo desde tu servicio)
  cines: Cine[] = [];

  // dialog/form
  dialog = false;
  form: { id: string|null; cinemaId: string; salaId: string; idioma: string; formato: string; precio: number } =
    { id: null, cinemaId: '', salaId: '', idioma: '', formato: '', precio: 0 };
  formInicio: Date | null = null;
  formFin: Date | null = null;

  // inyección
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  constructor(
    private svc: HorarioService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    // inyecta aquí tu servicio real de cines si lo tienes
  ) {}

  ngOnInit(): void {
    // si vienes desde películas, tomamos :peliculaId de la ruta
    const pid = this.route.snapshot.paramMap.get('peliculaId');
    if (pid) this.filtros.peliculaId = pid;

    // TODO: carga de cines usando tu servicio existente:
    // this.tuCineService.getAll().subscribe(c => this.cines = c);
    this.load();
  }

  private toISO(d: Date | null) { return d ? d.toISOString() : ''; }

  load() {
    this.loading = true;
    this.svc.list({
      peliculaId: this.filtros.peliculaId || undefined,
      cinemaId: this.filtros.cinemaId || undefined,
      desde: this.toISO(this.filtrosDesde) || undefined,
      hasta: this.toISO(this.filtrosHasta) || undefined,
      soloActivos: this.filtros.soloActivos
    }).subscribe({
      next: rows => { this.rows.set(rows); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  clearFilters() {
    this.filtros = { peliculaId: this.filtros.peliculaId, cinemaId: '', soloActivos: true };
    this.filtrosDesde = this.filtrosHasta = null;
    this.load();
  }

  goBack() { this.router.navigate(['../'], { relativeTo: this.route }); }

  // CRUD
  newHorario() {
    this.form = { id: null, cinemaId: '', salaId: '', idioma: '', formato: '', precio: 0 };
    this.formInicio = this.formFin = null;
    this.dialog = true;
  }
  edit(h: Horario) {
    this.form = {
      id: h.id, cinemaId: h.cinemaId, salaId: h.salaId,
      idioma: h.idioma, formato: h.formato, precio: h.precio ?? 0
    };
    this.formInicio = h.inicio ? new Date(h.inicio) : null;
    this.formFin    = h.fin    ? new Date(h.fin)    : null;
    this.dialog = true;
  }
  save() {
    if (!this.filtros.peliculaId) {
      this.toast.add({ severity: 'warn', summary: 'Falta película', detail: 'Ingresa películaId', life: 2200 });
      return;
    }
    const ok = this.form.cinemaId && this.form.salaId && this.form.idioma && this.form.formato && this.formInicio && this.formFin;
    if (!ok) { this.toast.add({ severity: 'warn', summary: 'Campos', detail: 'Completa todos los campos', life: 2000 }); return; }

    const payload: HorarioCreate = {
      peliculaId: this.filtros.peliculaId,
      cinemaId: this.form.cinemaId,
      salaId: this.form.salaId,
      idioma: this.form.idioma,
      formato: this.form.formato,
      inicio: this.toISO(this.formInicio!),
      fin: this.toISO(this.formFin!),
      precio: Number(this.form.precio ?? 0),
      fila: 10,
      columna: 10

    };

    const req = this.form.id ? this.svc.update(this.form.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'OK', detail: 'Horario guardado', life: 2200 });
        this.dialog = false;
        this.load();
      }
    });
  }
  desactivar(h: Horario) {
    this.confirm.confirm({
      message: '¿Desactivar este horario?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.svc.desactivar(h.id).subscribe({
          next: () => { this.toast.add({ severity:'success', summary:'OK', detail:'Horario desactivado', life:2200 }); this.load(); }
        });
      }
    });
  }
}
