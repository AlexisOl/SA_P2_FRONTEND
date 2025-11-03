// src/app/pages/categories-crud.component.ts
import { Component, OnInit, ViewChild, signal } from '@angular/core';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Category, CategoryService } from '../services/category';
//import { Category, CategoryService } from '../service/category.service';

@Component({
  selector: 'app-categories-crud',
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
    IconFieldModule,
    InputIconModule,
    SelectModule,
    RadioButtonModule,
    CheckboxModule,
  ],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nueva"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="openNew()"
        />
        <p-button
          severity="secondary"
          [label]="bulkActionLabel()"
          [icon]="bulkActionIcon()"
          outlined
          (onClick)="toggleSelected()"
          [disabled]="!selected?.length"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar CSV"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="exportCSV()"
        />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="rows()"
      [(selection)]="selected"
      dataKey="id"
      [rowHover]="true"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 20, 30]"
      [tableStyle]="{ 'min-width': '64rem' }"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
      [showCurrentPageReport]="true"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Categorías (Géneros)</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              (input)="onGlobalFilter(dt, $event)"
              placeholder="Buscar..."
            />
          </p-iconfield>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
          <th>Nombre</th>
          <th>Activa</th>
          <th>Creada</th>
          <th>Actualizada</th>
          <th style="width: 8rem"></th>
        </tr>
      </ng-template>

      <ng-template #body let-c>
        <tr>
          <td style="width:3rem"><p-tableCheckbox [value]="c" /></td>
          <td>{{ c.nombre }}</td>
          <td>
            <p-tag
              [value]="c.activa ? 'ACTIVA' : 'INACTIVA'"
              [severity]="c.activa ? 'success' : 'danger'"
            ></p-tag>
          </td>
          <td>{{ c.createdAt ? (c.createdAt | date: 'short') : '-' }}</td>
          <td>{{ c.updatedAt ? (c.updatedAt | date: 'short') : '-' }}</td>
          <td class="text-right">
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="edit(c)"
            />
            <p-button
              [icon]="c.activa ? 'pi pi-ban' : 'pi pi-check'"
              [severity]="c.activa ? 'warn' : 'success'"
              [label]="c.activa ? 'Desactivar' : 'Activar'"
              [rounded]="true"
              [outlined]="true"
              (click)="toggleOne(c)"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="6" class="text-center py-6">Sin datos</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog
      [(visible)]="dialog"
      [style]="{ width: '420px' }"
      header="{{ editing ? 'Editar' : 'Nueva' }} categoría"
      [modal]="true"
    >
      <ng-template #content>
        <div class="flex flex-col gap-4">
          <div>
            <label class="block font-bold mb-2">Nombre *</label>
            <input
              pInputText
              [(ngModel)]="form.nombre"
              required
              autofocus
              fluid
            />
            <small class="text-red-500" *ngIf="submitted && !form.nombre"
              >Requerido</small
            >
          </div>

          <div class="flex align-items-center gap-2">
            <p-checkbox
              [(ngModel)]="form.activa"
              [binary]="true"
              inputId="activa"
            ></p-checkbox>
            <label for="activa">Activa</label>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
        />
        <p-button label="Guardar" icon="pi pi-check" (click)="save()" />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
    <p-toast />
  `,
  providers: [MessageService, ConfirmationService],
})
export class CategoriesCrudComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  rows = signal<Category[]>([]);
  selected: Category[] | null = null;

  dialog = false;
  editing = false;
  submitted = false;

  // formulario en memoria
  form: { id?: string; nombre?: string; activa: boolean } = { activa: true };

  constructor(
    private svc: CategoryService,
    private toast: MessageService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.svc.list().subscribe({
      next: (data) => this.rows.set(data),
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  openNew() {
    this.form = { activa: true };
    this.submitted = false;
    this.editing = false;
    this.dialog = true;
  }

  edit(row: Category) {
    this.form = { id: row.id, nombre: row.nombre, activa: !!row.activa };
    this.submitted = false;
    this.editing = true;
    this.dialog = true;
  }

  hideDialog() {
    this.dialog = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    if (!this.form.nombre) return;

    const body = { nombre: this.form.nombre, activa: !!this.form.activa };
    const req = this.form.id
      ? this.svc.update(this.form.id, body)
      : this.svc.create(body);

    req.subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Guardado',
          life: 2500,
        });
        this.dialog = false;
        this.fetch();
      },
    });
  }

  deleteSelected() {
    if (!this.selected?.length) return;
    this.confirm.confirm({
      message: `¿Eliminar ${this.selected.length} categorías seleccionadas?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // si no tienes endpoint batch, elimina una a una
        let done = 0;
        this.selected!.forEach((c) =>
          this.svc.remove(c.id).subscribe({
            next: () => {
              done++;
              if (done === this.selected!.length)
                this.afterDelete('Categorías eliminadas');
            },
          }),
        );
      },
    });
  }

  deleteOne(row: Category) {
    this.confirm.confirm({
      message: `¿Eliminar la categoría "${row.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
        this.svc
          .remove(row.id)
          .subscribe({ next: () => this.afterDelete('Categoría eliminada') }),
    });
  }

  private afterDelete(msg: string) {
    this.toast.add({
      severity: 'success',
      summary: 'OK',
      detail: msg,
      life: 2500,
    });
    this.selected = null;
    this.fetch();
  }
  // Acción por fila
  toggleOne(row: Category) {
    const accion = row.activa ? 'desactivar' : 'activar';
    this.confirm.confirm({
      message: `¿Deseas ${accion} la categoría "${row.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const req = row.activa
          ? this.svc.deactivate(row.id)
          : this.svc.activate(row.id);
        req.subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: `Categoría ${row.activa ? 'desactivada' : 'activada'}`,
              life: 2200,
            });
            this.fetch();
          },
        });
      },
    });
  }

  // Acción masiva: aplica a cada seleccionada según su estado actual
  toggleSelected() {
    if (!this.selected?.length) return;

    // Texto amigable según mezcla de estados
    const activas = this.selected.filter((c) => c.activa).length;
    const inactivas = this.selected.length - activas;
    const msg =
      activas && inactivas
        ? `Se activarán ${inactivas} y desactivarán ${activas} categorías. ¿Continuar?`
        : activas
          ? `Se desactivarán ${activas} categorías. ¿Continuar?`
          : `Se activarán ${inactivas} categorías. ¿Continuar?`;

    this.confirm.confirm({
      message: msg,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let done = 0;
        const total = this.selected!.length;

        this.selected!.forEach((c) => {
          const req = c.activa
            ? this.svc.deactivate(c.id)
            : this.svc.activate(c.id);
          req.subscribe({
            next: () => {
              done++;
              if (done === total) {
                this.toast.add({
                  severity: 'success',
                  summary: 'OK',
                  detail: 'Cambio de estado aplicado',
                  life: 2200,
                });
                this.selected = null;
                this.fetch();
              }
            },
          });
        });
      },
    });
  }

  // Etiquetas/iconos del botón masivo en toolbar
  bulkActionLabel() {
    if (!this.selected?.length) return 'Activar/Desactivar';
    const activas = this.selected.filter((c) => c.activa).length;
    const inactivas = this.selected.length - activas;
    if (activas && inactivas) return 'Aplicar cambios';
    return activas ? 'Desactivar seleccionadas' : 'Activar seleccionadas';
  }
  bulkActionIcon() {
    if (!this.selected?.length) return 'pi pi-refresh';
    const activas = this.selected.filter((c) => c.activa).length;
    const inactivas = this.selected.length - activas;
    if (activas && inactivas) return 'pi pi-refresh';
    return activas ? 'pi pi-ban' : 'pi pi-check';
  }
}
