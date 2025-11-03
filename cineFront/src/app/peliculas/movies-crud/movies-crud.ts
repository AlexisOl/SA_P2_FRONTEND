// src/app/pages/movies-crud.component.ts
import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';

import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfirmationService, MessageService } from 'primeng/api';
import type { ButtonSeverity } from 'primeng/button';
import { MovieService } from '../services/movie.service';
import { Category, Movie } from '@/interfaces/movie.interface';
import { CategoryService } from '../services/category';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-movies-crud',
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
    TextareaModule,
    TagModule,
    RippleModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    InputNumberModule,
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
          [label]="bulkLabel()"
          [icon]="bulkIcon()"
          [severity]="bulkSeverity()"
          outlined
          (onClick)="toggleSelected()"
          [disabled]="!selected?.length"
        />
      </ng-template>

      <ng-template #end>
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            (input)="onGlobal(dt, $event)"
            placeholder="Buscar título..."
          />
        </p-iconfield>
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
      [globalFilterFields]="['titulo', 'director', 'clasificacion']"
      [tableStyle]="{ 'min-width': '78rem' }"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} películas"
      [showCurrentPageReport]="true"
    >
      <ng-template #header>
        <tr>
          <th style="width:3rem"><p-tableHeaderCheckbox /></th>
          <th style="width:4.5rem">Póster</th>
          <th pSortableColumn="titulo">Título <p-sortIcon field="titulo" /></th>
          <th>Director</th>
          <th>Duración</th>
          <th>Clasificación</th>
          <th>Estreno</th>
          <th>Estado</th>
          <th style="width:18rem"></th>
        </tr>
      </ng-template>

      <ng-template #body let-m>
        <tr>
          <td><p-tableCheckbox [value]="m" /></td>
          <td>
            <img
              [src]="firstPoster(m)"
              alt="poster"
              style="width:56px;height:56px;object-fit:cover"
              class="rounded"
            />
          </td>
          <td>{{ m.titulo }}</td>
          <td class="text-color-secondary">{{ m.director }}</td>
          <td>{{ m.duracion }} min</td>
          <td>{{ m.clasificacion }}</td>
          <td>{{ m.fechaEstreno }}</td>
          <td>
            <p-tag
              [value]="m.activa ? 'ACTIVA' : 'INACTIVA'"
              [severity]="m.activa ? 'success' : 'danger'"
            />
          </td>
          <td class="text-right">
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="edit(m)"
            />
            <p-button
              [icon]="m.activa ? 'pi pi-ban' : 'pi pi-check'"
              [severity]="m.activa ? 'warn' : 'success'"
              [label]="m.activa ? 'Desactivar' : 'Activar'"
              [rounded]="true"
              [outlined]="true"
              class="mr-2"
              (click)="toggleOne(m)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="remove(m)"
            />
            <p-button
              label="Categoría"
              icon="pi pi-tags"
              [outlined]="true"
              class="mr-2"
              (click)="openCategorias(m)"
            />
            <p-button label="Pósters" icon="pi pi-image" [outlined]="true" class="mr-2"
          (click)="openPosters(m)" />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="9" class="text-center py-6">Sin datos</td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog Crear/Editar -->
    <!-- Dialog Crear/Editar -->
    <p-dialog
      [(visible)]="dialog"
      [style]="{ width: '720px' }"
      [modal]="true"
      header="{{ editing ? 'Editar' : 'Nueva' }} película"
    >
      <ng-template #content>
        <!-- p-fluid aplica 100% width a inputs compatibles -->
        <div
          class="grid formgrid p-fluid"
          style="row-gap:1rem; column-gap:1rem"
        >
          <!-- Fila 1: Clasificación / Título -->
          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Clasificación *</label>
            <p-select
              class="w-full"
              [(ngModel)]="form.clasificacion"
              [options]="clasificaciones"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
            />
            <small class="text-red-500" *ngIf="submitted && !form.clasificacion"
              >Requerido</small
            >
          </div>

          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Título *</label>
            <input
              pInputText
              class="w-full"
              [(ngModel)]="form.titulo"
              required
            />
            <small class="text-red-500" *ngIf="submitted && !form.titulo"
              >Requerido</small
            >
          </div>

          <!-- Fila 2: Duración / Fecha -->
          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Duración (min) *</label>
            <p-inputnumber
              class="w-full"
              [(ngModel)]="form.duracion"
              [min]="1"
              [useGrouping]="false"
            ></p-inputnumber>
            <small class="text-red-500" *ngIf="submitted && !form.duracion"
              >Requerido</small
            >
          </div>

          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Fecha de estreno *</label>
            <p-datepicker
              class="w-full"
              [(ngModel)]="fechaEstrenoModel"
              [showIcon]="true"
            ></p-datepicker>
            <small class="text-red-500" *ngIf="submitted && !fechaEstrenoModel"
              >Requerido</small
            >
          </div>

          <!-- Fila 3: Activa / Director -->
          <div class="col-12 md:col-6 flex align-items-end gap-3">
            <div>
              <label class="block font-bold mb-2">Activa</label>
              <p-toggleswitch [(ngModel)]="form.activa"></p-toggleswitch>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <label class="block font-bold mb-2">Director *</label>
            <input pInputText class="w-full" [(ngModel)]="form.director" />
            <small class="text-red-500" *ngIf="submitted && !form.director"
              >Requerido</small
            >
          </div>

          <!-- Fila 4: Sinopsis (full) -->
          <div class="col-12">
            <label class="block font-bold mb-2">Sinopsis *</label>
            <textarea
              pTextarea
              class="w-full"
              rows="3"
              [(ngModel)]="form.sinopsis"
            ></textarea>
            <small class="text-red-500" *ngIf="submitted && !form.sinopsis"
              >Requerido</small
            >
          </div>

          <!-- Fila 5: Cast (full) -->
          <div class="col-12">
            <label class="block font-bold mb-2">Reparto (cast)</label>
            <input
              pInputText
              class="w-full"
              [(ngModel)]="castInput"
              placeholder="Ej: Nombre1, Nombre2"
            />
            <small class="text-color-secondary">Separados por coma</small>
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
    <!-- Dialog Definir Categoría -->
    <p-dialog
      [(visible)]="dialogCategorias"
      [style]="{ width: '520px' }"
      [modal]="true"
      header="Definir categoría"
    >
      <ng-template #content>
        <div class="pt-2">
          <label class="block font-bold mb-2">Selecciona categorías</label>

          <div
            *ngIf="!loadingCategorias; else catsLoading"
            class="flex flex-col gap-2"
          >
            <div *ngIf="categoriasTodas?.length; else noCats">
              <!-- Checkboxes con binding a selectedCategoriaIds -->
              <div
                *ngFor="let c of categoriasTodas"
                class="flex items-center gap-2 border rounded p-2"
              >
                <p-checkbox
                  name="cats"
                  [value]="c.id"
                  [(ngModel)]="selectedCategoriaIds"
                >
                </p-checkbox>
                <span>{{ c.nombre }}</span>
                <p-tag
                  value="Activa"
                  severity="success"
                  *ngIf="c.activa"
                ></p-tag>
              </div>

              <div class="flex justify-end mt-3 gap-2">
                <p-button
                  label="Aplicar cambios"
                  icon="pi pi-check"
                  (click)="applyCategorias()"
                />
              </div>
            </div>

            <ng-template #noCats>
              <p-tag value="No hay categorías activas" severity="info"></p-tag>
            </ng-template>
          </div>

          <ng-template #catsLoading>
            <small class="text-color-secondary">Cargando categorías…</small>
          </ng-template>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cerrar"
          icon="pi pi-check"
          (click)="dialogCategorias = false"
        />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="dialogPosters" [style]="{ width: '720px' }" [modal]="true"
          header="Administrar pósters">
  <ng-template #content>
    <div class="flex flex-col gap-4">

      <!-- Existentes -->
      <div>
        <label class="block font-bold mb-2">Pósters actuales</label>
        <div *ngIf="posterExistentes?.length; else sinExistentes"
             class="grid grid-nogutter" style="gap:10px">
          <div *ngFor="let url of posterExistentes; let i = index" class="p-2 border-round surface-100"
               style="width:140px">
            <img [src]="url" alt="poster" style="width:120px;height:160px;object-fit:cover" class="rounded" />
          </div>
        </div>
        <ng-template #sinExistentes>
          <p-tag value="Sin pósters" severity="info"></p-tag>
        </ng-template>
      </div>

      <!-- Subir nuevos -->
      <div>
        <label class="block font-bold mb-2">Agregar pósters</label>
        <div class="flex items-center gap-3">
          <input type="file" accept="image/*" multiple (change)="onPosterFiles($event)" />
          <small class="text-color-secondary">
            Puedes seleccionar varias imágenes. Máx: {{ maxPostersPorPelicula }} por película (ajusta si aplica).
          </small>
        </div>

        <!-- Previews locales -->
        <div *ngIf="posterPreviews.length" class="mt-3 grid grid-nogutter" style="gap:10px">
          <div *ngFor="let p of posterPreviews; let i = index" class="p-2 border-round surface-100"
               style="width:140px">
            <img [src]="p" alt="preview" style="width:120px;height:160px;object-fit:cover" class="rounded" />
            <div class="mt-2 text-center">
              <p-button icon="pi pi-times" size="small" severity="danger" [text]="true"
                        (click)="removeLocalPoster(i)" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </ng-template>

  <ng-template #footer>
    <p-button label="Cerrar" icon="pi pi-times" text (click)="closePosters()" />
    <p-button label="Subir" icon="pi pi-upload"
              [disabled]="!posterFiles.length || !posterMovieId"
              (click)="uploadPosters()" />
  </ng-template>
</p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
    <p-toast />
  `,
  providers: [MessageService, ConfirmationService],
})
export class MoviesCrudComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  rows = signal<Movie[]>([]);
  selected: Movie[] | null = null;

  dialog = false;
  editing = false;
  submitted = false;
  form: Partial<Movie> = { activa: true };
  fechaEstrenoModel: Date | null = null;
  castInput = '';

  dialogCategorias = false;
  currentMovieId: string | null = null;

  categoriasAsignadas: Array<{ id: string; nombre: string }> = [];
  categoriasTodas: Array<{ id: string; nombre: string; activa: boolean }> = [];
  categoriaSeleccionada: string | null = null;

  clasificaciones = [
    { label: 'A', value: 'A' },
    { label: 'B7', value: 'B7' },
    { label: 'B12', value: 'B12' },
    { label: 'C15', value: 'C15' },
    { label: 'C18', value: 'C18' },
  ];

  // IDs seleccionados en el UI (checkboxes)
  selectedCategoriaIds: string[] = [];

  // Foto anterior (asignadas antes de editar) para calcular diferencias
  _prevCategoriaIds: string[] = [];

  // ---- diálogo de Pósters
  dialogPosters = false;
  posterMovieId: string | null = null;

  // Pósters ya existentes (urls) y previsualizaciones locales
  posterExistentes: string[] = [];
  posterFiles: File[] = [];
  posterPreviews: string[] = []; // object URLs

  maxPostersPorPelicula = 3; // si tu backend limita a 3; ajusta si es distinto

  constructor(
    private svc: MovieService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    private categoriaS: CategoryService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.svc.list().subscribe({ next: (data) => this.rows.set(data) });
  }

  onGlobal(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  firstPoster(m: Movie) {
    return m.posters?.length
      ? m.posters[0]
      : 'https://primefaces.org/cdn/primeng/images/demo/product/placeholder-image.png';
  }

  // ---- crear / editar
  openNew() {
    this.form = { activa: true };
    this.fechaEstrenoModel = null;
    this.castInput = '';
    this.editing = false;
    this.submitted = false;
    this.dialog = true;
  }

  edit(row: Movie) {
    this.form = { ...row };
    this.fechaEstrenoModel = row.fechaEstreno
      ? new Date(row.fechaEstreno)
      : null;
    this.castInput = (row.cast || []).join(', ');
    this.editing = true;
    this.submitted = false;
    this.dialog = true;
  }

  hideDialog() {
    this.dialog = false;
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    if (
      !this.form.titulo ||
      !this.form.sinopsis ||
      !this.form.duracion ||
      !this.form.clasificacion ||
      !this.fechaEstrenoModel
    )
      return;

    const payload: Movie = {
      id: this.form.id,
      titulo: this.form.titulo!,
      sinopsis: this.form.sinopsis!,
      duracion: Number(this.form.duracion),
      posters: [], // se gestionan por endpoint aparte
      cast: this.castInput
        ? this.castInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      director: this.form.director || '',
      clasificacion: this.form.clasificacion!,
      activa: !!this.form.activa,
      fechaEstreno: this.fechaEstrenoModel.toISOString().slice(0, 10),
    };

    const req = payload.id
      ? this.svc.update(payload.id, payload)
      : this.svc.create(payload);
    req.subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Película guardada',
          life: 2500,
        });
        this.dialog = false;
        this.fetch();
      },
    });
  }

  // ---- activar / desactivar
  toggleOne(row: Movie) {
    const accion = row.activa ? 'desactivar' : 'activar';
    this.confirm.confirm({
      message: `¿Deseas ${accion} la película "${row.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const req = row.activa
          ? this.svc.desactivar(row.id!)
          : this.svc.activar(row.id!);
        req.subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: `Película ${accion}a`,
              life: 2200,
            });
            this.fetch();
          },
        });
      },
    });
  }

  // ---- masivo
  toggleSelected() {
    if (!this.selected?.length) return;
    const activas = this.selected.filter((x) => x.activa).length;
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
        let done = 0,
          total = this.selected!.length;
        this.selected!.forEach((m) => {
          const req = m.activa
            ? this.svc.desactivar(m.id!)
            : this.svc.activar(m.id!);
          req.subscribe({
            next: () => {
              done++;
              if (done === total) {
                this.toast.add({
                  severity: 'success',
                  summary: 'OK',
                  detail: 'Cambio aplicado',
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
  bulkLabel() {
    if (!this.selected?.length) return 'Activar/Desactivar';
    const a = this.selected.filter((x) => x.activa).length;
    const i = this.selected.length - a;
    return a && i
      ? 'Aplicar cambios'
      : a
        ? 'Desactivar seleccionadas'
        : 'Activar seleccionadas';
  }
  bulkIcon() {
    if (!this.selected?.length) return 'pi pi-refresh';
    const a = this.selected.filter((x) => x.activa).length;
    const i = this.selected.length - a;
    return a && i ? 'pi pi-refresh' : a ? 'pi pi-ban' : 'pi pi-check';
  }
  bulkSeverity(): ButtonSeverity {
    if (!this.selected?.length) return 'secondary';
    const a = this.selected.filter((x) => x.activa).length;
    const i = this.selected.length - a;
    return a && i ? 'secondary' : a ? 'warn' : 'success';
  }

  // ---- eliminar (opcional)
  remove(row: Movie) {
    this.confirm.confirm({
      message: `¿Eliminar la película "${row.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.svc.remove(row.id!).subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: 'Película eliminada',
              life: 2200,
            });
            this.fetch();
          },
        });
      },
    });
  }

  // ---- categoría: estado UI
  loadingCategorias = false;

  // Abrir dialog y cargar datos

  openCategorias(m: Movie) {
    this.currentMovieId = m.id!;
    this.loadingCategorias = true;

    this.selectedCategoriaIds = [];
    this._prevCategoriaIds = [];

    forkJoin({
      asignadas: this.svc.listMovieCategories(m.id!),
      todas: this.svc.getCategorias(),
    }).subscribe({
      next: ({ asignadas, todas }) => {
        // Normaliza arrays
        this.categoriasAsignadas = (asignadas ?? []).map((a) => ({
          id: (a as any).id ?? (a as any).categoriaId ?? null,
          nombre: (a as any).nombre ?? (a as any).name ?? '',
        }));

        this.categoriasTodas = (todas ?? [])
          .map((t) => ({
            id:
              (t as any).id ??
              (t as any).categoriaId ??
              (t as any).uuid ??
              null,
            nombre: (t as any).nombre ?? (t as any).name ?? '',
            activa: !!(t as any).activa,
          }))
          .filter((x) => x.activa);

        // Mapa nombre->id para resolver casos donde asignadas no traen id
        const byNombre = new Map(
          this.categoriasTodas.map((c) => [
            c.nombre.trim().toLowerCase(),
            c.id,
          ]),
        );

        // Construye los IDs seleccionados: usa id si viene, si no, resuelve por nombre
        this.selectedCategoriaIds = this.categoriasAsignadas
          .map(
            (a) => a.id || byNombre.get(a.nombre.trim().toLowerCase()) || null,
          )
          .filter((x): x is string => !!x);

        // Guarda foto anterior para calcular diffs al aplicar
        this._prevCategoriaIds = [...this.selectedCategoriaIds];

        // Debug útil
        console.log('asignadas:', this.categoriasAsignadas);
        console.log('todas:', this.categoriasTodas);
        console.log('selectedCategoriaIds:', this.selectedCategoriaIds);

        this.loadingCategorias = false;
        this.dialogCategorias = true;
      },
      error: () => {
        this.loadingCategorias = false;
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar categorías',
          life: 2500,
        });
      },
    });
  }

  applyCategorias() {
    if (!this.currentMovieId) return;

    const prev = new Set(this._prevCategoriaIds);
    const now = new Set(this.selectedCategoriaIds);

    // A agregar: en "now" pero no en "prev"
    const toAdd: string[] = [];
    now.forEach((id) => {
      if (!prev.has(id)) toAdd.push(id);
    });

    // A quitar: en "prev" pero no en "now"
    const toRemove: string[] = [];
    prev.forEach((id) => {
      if (!now.has(id)) toRemove.push(id);
    });

    if (!toAdd.length && !toRemove.length) {
      this.toast.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No hay cambios en categorías',
        life: 2000,
      });
      return;
    }

    // Ejecutar en paralelo
    const attaches = toAdd.map((id) =>
      this.svc.attachCategory(this.currentMovieId!, id),
    );
    const detaches = toRemove.map((id) =>
      this.svc.detachCategory(this.currentMovieId!, id),
    );

    forkJoin([
      ...(attaches.length ? [forkJoin(attaches)] : []),
      ...(detaches.length ? [forkJoin(detaches)] : []),
    ]).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Categorías actualizadas',
          life: 2200,
        });
        // Refrescar asignadas para reflejar el estado final
        this.svc.listMovieCategories(this.currentMovieId!).subscribe({
          next: (asig) => {
            this.categoriasAsignadas = asig ?? [];
            // Actualizar foto anterior al nuevo estado
            this._prevCategoriaIds = [...this.selectedCategoriaIds];
          },
        });
      },
    });
  }

  // Asignar
  asignarCategoria() {
    if (!this.currentMovieId || !this.categoriaSeleccionada) return;
    this.svc
      .attachCategory(this.currentMovieId, this.categoriaSeleccionada)
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: 'OK',
            detail: 'Categoría asignada',
            life: 2200,
          });
          // refrescar lista asignadas
          this.svc.listMovieCategories(this.currentMovieId!).subscribe({
            next: (asig) => (this.categoriasAsignadas = asig ?? []),
          });
          this.categoriaSeleccionada = null;
        },
      });
  }

  // Quitar
  quitarCategoria(categoriaId: string) {
    if (!this.currentMovieId) return;
    this.confirm.confirm({
      message: '¿Quitar esta categoría?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.svc.detachCategory(this.currentMovieId!, categoriaId).subscribe({
          next: () => {
            this.toast.add({
              severity: 'success',
              summary: 'OK',
              detail: 'Categoría quitada',
              life: 2200,
            });
            this.categoriasAsignadas = this.categoriasAsignadas.filter(
              (c) => c.id !== categoriaId,
            );
          },
        });
      },
    });
  }

  openPosters(m: Movie) {
  this.posterMovieId = m.id!;
  this.posterExistentes = Array.isArray(m.posters) ? [...m.posters] : [];
  this.posterFiles = [];
  this.resetPreviews();
  this.dialogPosters = true;
}

closePosters() {
  this.dialogPosters = false;
  this.posterMovieId = null;
  this.posterFiles = [];
  this.resetPreviews();
}

// crear/limpiar previews
private resetPreviews() {
  // liberar URLs previas
  this.posterPreviews.forEach(u => URL.revokeObjectURL(u));
  this.posterPreviews = [];
}

onPosterFiles(evt: Event) {
  const input = evt.target as HTMLInputElement;
  const list = input.files ? Array.from(input.files) : [];
  if (!list.length) return;

  // Si tienes límite total (existentes + nuevos), respeta el máximo:
  const ya = this.posterExistentes.length;
  const espacio = Math.max(this.maxPostersPorPelicula - ya, 0);
  const files = espacio > 0 ? list.slice(0, espacio) : [];

  this.posterFiles = files;
  this.resetPreviews();
  this.posterPreviews = this.posterFiles.map(f => URL.createObjectURL(f));
}

removeLocalPoster(i: number) {
  this.posterFiles.splice(i, 1);
  const [url] = this.posterPreviews.splice(i, 1);
  if (url) URL.revokeObjectURL(url);
}



uploadPosters() {
  if (!this.posterMovieId || !this.posterFiles.length) return;

  const calls = this.posterFiles.map(f => this.svc.uploadPoster(this.posterMovieId!, f, 1));
  forkJoin(calls).subscribe({
    next: (results) => {
      // results será array de respuestas; aplánalo si cada respuesta trae string[] con urls
      const added = results.flat(); 
      //this.posterExistentes = [...this.posterExistentes, ...added];
      this.fetch();
      this.toast.add({ severity: 'success', summary: 'OK', detail: 'Pósters subidos', life: 2200 });
      this.posterFiles = [];
      this.resetPreviews();
    },
    error: () => this.toast.add({ severity:'error', summary:'Error', detail:'No se pudo subir los pósters', life:2500 })
  });
}
}
