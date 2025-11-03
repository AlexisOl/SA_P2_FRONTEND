// src/app/pages/movies-list.component.ts
import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { ConfirmationService, MessageService } from 'primeng/api';
import type { ButtonSeverity } from 'primeng/button';

import { Movie, MovieService, Page } from '../services/movie.service';

@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgOptimizedImage,
    TableModule, ToolbarModule, ButtonModule, ToastModule, ConfirmDialogModule, DialogModule,
    InputTextModule, TagModule, RippleModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button label="Nueva" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="create()" />
        <p-button
          [label]="bulkActionLabel()"
          [icon]="bulkActionIcon()"
          [severity]="bulkButtonSeverity()"
          outlined
          (onClick)="toggleSelected()"
          [disabled]="!selected?.length"
        />
      </ng-template>

      <ng-template #end>
        <p-button label="Exportar CSV" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="rows()"
      [(selection)]="selected"
      dataKey="id"
      [rowHover]="true"
      [paginator]="true"
      [rows]="size"
      [rowsPerPageOptions]="[10,20,30]"
      [lazy]="true"
      [totalRecords]="total()"
      (onPage)="onPage($event)"
      [tableStyle]="{ 'min-width': '78rem' }"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} películas"
      [showCurrentPageReport]="true"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Películas</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onSearch($event)" placeholder="Buscar por título..." />
          </p-iconfield>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          <th style="width:3rem"><p-tableHeaderCheckbox /></th>
          <th style="width:5rem">Póster</th>
          <th>Título</th>
          <th>Director</th>
          <th style="width:7rem">Duración</th>
          <th style="width:7rem">Clasif.</th>
          <th style="width:8rem">Estreno</th>
          <th style="width:8rem">Estado</th>
          <th style="width:12rem"></th>
        </tr>
      </ng-template>

      <ng-template #body let-m>
        <tr>
          <td><p-tableCheckbox [value]="m" /></td>
          <td>
            <img
              *ngIf="m.posters?.length; else noimg"
              [ngSrc]="m.posters[0]" width="48" height="64" class="rounded border" alt="poster" />
            <ng-template #noimg><div class="w-3rem h-4rem surface-200 border-round-sm flex align-items-center justify-content-center">—</div></ng-template>
          </td>
          <td>{{ m.titulo }}</td>
          <td class="text-color-secondary">{{ m.director || '-' }}</td>
          <td>{{ m.duracion }} min</td>
          <td>{{ m.clasificacion }}</td>
          <td>{{ m.fechaEstreno | date:'yyyy-MM-dd' }}</td>
          <td><p-tag [value]="m.activa ? 'ACTIVA' : 'INACTIVA'" [severity]="m.activa ? 'success' : 'danger'"></p-tag></td>
          <td class="text-right">
            <p-button label="Detalles" icon="pi pi-eye" class="mr-2" [text]="true" (click)="view(m)" />
            <p-button label="Editar" icon="pi pi-pencil" class="mr-2" [text]="true" (click)="edit(m)" />
            <p-button
              [label]="m.activa ? 'Desactivar' : 'Activar'"
              [icon]="m.activa ? 'pi pi-ban' : 'pi pi-check'"
              [severity]="buttonSeverityFor(m)"
              [rounded]="true"
              [outlined]="true"
              (click)="toggleOne(m)"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr><td colspan="9" class="text-center py-6">Sin datos</td></tr>
      </ng-template>
    </p-table>

    <p-confirmdialog [style]="{ width: '450px' }" />
    <p-toast />
  `
})
export class MoviesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  rows = signal<Movie[]>([]);
  total = signal<number>(0);

  selected: Movie[] | null = null;

  // estado de paginación/búsqueda
  page = 0;
  size = 10;
  search = '';
  sort = 'createdAt,desc';

  constructor(
    private svc: MovieService,
    private toast: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void { this.fetch(); }

  fetch() {
    this.svc.list(this.page, this.size, this.search, this.sort).subscribe({
      next: (res: Page<Movie>) => {
        this.rows.set(res.content);
        this.total.set(res.totalElements);
      }
    });
  }

  onPage(e: any) {
    this.page = Math.floor(e.first / e.rows);
    this.size = e.rows;
    this.fetch();
  }

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value || '';
    this.page = 0;
    this.fetch();
  }

  exportCSV() { this.dt.exportCSV(); }

  // ——— Acciones
  create() {
    // TODO: navegar a /peliculas/nueva (lo conectamos cuando tengas la ruta)
    this.toast.add({ severity: 'info', summary: 'Info', detail: 'Ir a crear película', life: 1800 });
  }

  view(m: Movie) {
    // TODO: navegar a /peliculas/:id/detalle
    this.toast.add({ severity: 'info', summary: 'Info', detail: `Ver detalle: ${m.titulo}`, life: 1800 });
  }

  edit(m: Movie) {
    // TODO: navegar a /peliculas/:id/editar
    this.toast.add({ severity: 'info', summary: 'Info', detail: `Editar: ${m.titulo}`, life: 1800 });
  }

  // Toggle por fila
  toggleOne(m: Movie) {
    const accion = m.activa ? 'desactivar' : 'activar';
    this.confirm.confirm({
      message: `¿Deseas ${accion} la película "${m.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const req = m.activa ? this.svc.desactivar(m.id) : this.svc.activar(m.id);
        req.subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: `Película ${m.activa ? 'desactivada' : 'activada'}`,
              life: 2200
            });
            this.fetch();
          }
        });
      }
    });
  }

  // Toggle masivo
  toggleSelected() {
    if (!this.selected?.length) return;
    const activas = this.selected.filter(x => x.activa).length;
    const inactivas = this.selected.length - activas;
    const msg =
      activas && inactivas
        ? `Se activarán ${inactivas} y desactivarán ${activas} películas. ¿Continuar?`
        : activas
        ? `Se desactivarán ${activas} películas. ¿Continuar?`
        : `Se activarán ${inactivas} películas. ¿Continuar?`;

    this.confirm.confirm({
      message: msg,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let done = 0, total = this.selected!.length;
        this.selected!.forEach(p => {
          const req = p.activa ? this.svc.desactivar(p.id) : this.svc.activar(p.id);
          req.subscribe({
            next: () => {
              done++;
              if (done === total) {
                this.toast.add({ severity: 'success', summary: 'OK', detail: 'Cambio de estado aplicado', life: 2200 });
                this.selected = null;
                this.fetch();
              }
            }
          });
        });
      }
    });
  }

  // Helpers UI
  buttonSeverityFor(row: Movie): ButtonSeverity {
    return row.activa ? 'warn' : 'success';
  }
  bulkButtonSeverity(): ButtonSeverity {
    if (!this.selected?.length) return 'secondary';
    const activas = this.selected.filter(x => x.activa).length;
    const inactivas = this.selected.length - activas;
    if (activas && inactivas) return 'secondary';
    return activas ? 'warn' : 'success';
  }
  bulkActionLabel() {
    if (!this.selected?.length) return 'Activar/Desactivar';
    const activas = this.selected.filter(x => x.activa).length;
    const inactivas = this.selected.length - activas;
    if (activas && inactivas) return 'Aplicar cambios';
    return activas ? 'Desactivar seleccionadas' : 'Activar seleccionadas';
  }
  bulkActionIcon() {
    if (!this.selected?.length) return 'pi pi-refresh';
    const activas = this.selected.filter(x => x.activa).length;
    const inactivas = this.selected.length - activas;
    if (activas && inactivas) return 'pi pi-refresh';
    return activas ? 'pi pi-ban' : 'pi pi-check';
  }
}