// src/app/pages/movie-form.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';

import { MessageService, ConfirmationService } from 'primeng/api';
import { MovieService } from '../services/movie.service';
import { CategoryService } from '../services/category';
import { Category, Movie } from '@/interfaces/movie.interface';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    InputTextModule, TextareaModule, InputNumberModule, CheckboxModule,
    SelectModule, ButtonModule, ToastModule, ConfirmDialogModule,
    TableModule, FileUploadModule, TagModule, DatePickerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast /><p-confirmDialog />

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">{{ isEdit() ? 'Editar' : 'Nueva' }} película</h2>
        <div class="flex gap-2">
          <p-button label="Guardar" icon="pi pi-save" (onClick)="save()" />
          <p-button label="Regresar" icon="pi pi-arrow-left" severity="secondary" (onClick)="back()" />
        </div>
      </div>

      <div class="flex gap-2 mb-4">
        <p-button label="Datos"       [severity]="activeTab==='datos' ? 'primary' : 'secondary'" (onClick)="activeTab='datos'"/>
        <p-button label="Categorías"  [severity]="activeTab==='categorias' ? 'primary' : 'secondary'" (onClick)="activeTab='categorias'"/>
        <p-button label="Pósters"     [severity]="activeTab==='posters' ? 'primary' : 'secondary'" (onClick)="activeTab='posters'"/>
      </div>

      <!-- Datos -->
      <!-- TAB DATOS (ALINEADO) -->
<div *ngIf="activeTab === 'datos'" class="formgrid grid">

  <!-- Fila 1: Título | Sinopsis -->
  <div class="field col-12 md:col-6">
    <label for="titulo" class="block mb-2 font-semibold">Título *</label>
    <input pInputText id="titulo" name="titulo" [(ngModel)]="form.titulo" class="w-full"/>
    <small class="p-error block mt-1" *ngIf="submitted && !form.titulo">El título es requerido</small>
  </div>

  <div class="field col-12 md:col-6">
    <label for="sinopsis" class="block mb-2 font-semibold">Sinopsis *</label>
    <textarea pTextarea id="sinopsis" name="sinopsis" rows="4" [(ngModel)]="form.sinopsis" class="w-full"></textarea>
    <small class="p-error block mt-1" *ngIf="submitted && !form.sinopsis">La sinopsis es requerida</small>
  </div>

  <!-- Fila 2: Duración | Clasificación | Fecha | Activa -->
  <div class="field col-12 md:col-3">
    <label for="duracion" class="block mb-2 font-semibold">Duración (min) *</label>
    <p-inputNumber inputId="duracion" name="duracion" [(ngModel)]="form.duracion" [min]="1" [max]="500" class="w-full"/>
    <small class="p-error block mt-1" *ngIf="submitted && !form.duracion">Requerido</small>
  </div>

  <div class="field col-12 md:col-3">
    <label for="clasificacion" class="block mb-2 font-semibold">Clasificación *</label>
    <p-select inputId="clasificacion" name="clasificacion" [(ngModel)]="form.clasificacion"
              [options]="clasificaciones" optionLabel="label" optionValue="value"
              placeholder="Seleccione" class="w-full"/>
    <small class="p-error block mt-1" *ngIf="submitted && !form.clasificacion">Requerido</small>
  </div>

  <div class="field col-12 md:col-3">
    <label for="fechaEstreno" class="block mb-2 font-semibold">Fecha de estreno *</label>
    <p-datepicker inputId="fechaEstreno" name="fechaEstreno" [(ngModel)]="fechaEstrenoDate"
                  dateFormat="yy-mm-dd" [showIcon]="true" class="w-full"/>
    <small class="p-error block mt-1" *ngIf="submitted && !fechaEstrenoDate">Requerido</small>
  </div>

  <div class="field col-12 md:col-3 flex align-items-end">
    <div class="flex align-items-center gap-2">
      <p-checkbox name="activa" [(ngModel)]="form.activa" [binary]="true" inputId="activa"></p-checkbox>
      <label for="activa" class="font-semibold">Película activa</label>
    </div>
  </div>

  <!-- Fila 3: Director | Cast -->
  <div class="field col-12 md:col-6">
    <label for="director" class="block mb-2 font-semibold">Director</label>
    <input pInputText id="director" name="director" [(ngModel)]="form.director" class="w-full"/>
  </div>

  <div class="field col-12 md:col-6">
    <label class="block mb-2 font-semibold">Reparto (cast)</label>

    <div class="flex flex-wrap gap-2 mb-3" *ngIf="castArr.length">
      <div class="flex align-items-center gap-1" *ngFor="let actor of castArr; let i = index">
        <p-tag [value]="actor" severity="secondary"/>
        <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeCast(i)"/>
      </div>
    </div>

    <div class="flex gap-2">
      <input pInputText name="castInput" [(ngModel)]="castInput"
             placeholder="Escribe un nombre y presiona Enter o coma"
             (keydown.enter)="addCastFromKey($event)"
             (keydown)="onCastComma($event)" (blur)="addCastFromBlur()"
             class="flex-1"/>
      <p-button label="Añadir" icon="pi pi-plus"
                (onClick)="addCastFromButton()" [disabled]="!castInput?.trim()"/>
    </div>
  </div>

</div>

      <!-- Categorías -->
      <div *ngIf="activeTab==='categorias'">
        <ng-container *ngIf="isEdit(); else needSaveFirst">
          <div class="flex gap-2 mb-3">
            <p-select name="categoriaSeleccionada" [(ngModel)]="categoriaSeleccionada"
                      [options]="categorias()" optionLabel="nombre" optionValue="id"
                      placeholder="Selecciona una categoría" styleClass="w-20rem"/>
            <p-button label="Agregar" icon="pi pi-plus" (onClick)="addCategory()" [disabled]="!categoriaSeleccionada"/>
          </div>

          <p-table [value]="categoriasPelicula()" dataKey="id" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template pTemplate="header">
              <tr><th>Nombre</th><th>Estado</th><th style="width:8rem"></th></tr>
            </ng-template>
            <ng-template pTemplate="body" let-cat>
              <tr>
                <td>{{ cat.nombre }}</td>
                <td><p-tag [value]="cat.activa ? 'ACTIVA' : 'INACTIVA'" [severity]="cat.activa ? 'success' : 'danger'"/></td>
                <td class="text-right">
                  <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeCategory(cat.categoriaId || cat.id)"/>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage"><tr><td colspan="3" class="text-center py-4">Sin categorías</td></tr></ng-template>
          </p-table>
        </ng-container>
      </div>

      <!-- Pósters -->
      <div *ngIf="activeTab==='posters'">
        <ng-container *ngIf="isEdit(); else needSaveFirst">
          <div class="flex gap-2 align-items-end mb-3">
            <p-fileUpload mode="basic" name="file" chooseLabel="Seleccionar imagen" (onSelect)="onFileSelected($event)"
                          [auto]="false" [customUpload]="true" (uploadHandler)="onUpload()" [maxFileSize]="5242880"/>
            <p-inputNumber name="posterOrden" [(ngModel)]="posterOrden" [min]="1" [max]="3" placeholder="Orden (1-3)"/>
            <p-button label="Subir" icon="pi pi-upload" (onClick)="triggerUpload()" [disabled]="!fileToUpload"/>
          </div>

          <p-table [value]="posters()" dataKey="id" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template pTemplate="header">
              <tr><th>Vista</th><th>URL</th><th>Orden</th><th>Estado</th><th style="width:12rem"></th></tr>
            </ng-template>
            <ng-template pTemplate="body" let-p>
              <tr>
                <td><img [src]="p.url" alt="poster" width="48" class="border-round-sm"/></td>
                <td class="text-overflow-ellipsis" style="max-width:22rem">{{ p.url }}</td>
                <td>{{ p.orden }}</td>
                <td><p-tag [value]="p.activa ? 'ACTIVO' : 'INACTIVO'" [severity]="p.activa ? 'success' : 'danger'"/></td>
                <td class="text-right">
                  <p-button [label]="p.activa ? 'Desactivar' : 'Activar'" [icon]="p.activa ? 'pi pi-ban' : 'pi pi-check'" [text]="true" (onClick)="togglePoster(p)"/>
                  <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="deletePoster(p)"/>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage"><tr><td colspan="5" class="text-center py-4">Sin pósters</td></tr></ng-template>
          </p-table>
        </ng-container>
      </div>

      <ng-template #needSaveFirst>
        <p-tag severity="info" value="Guarda primero la película para gestionar categorías y pósters."/>
      </ng-template>
    </div>
  `
})
export class MovieFormComponent implements OnInit {
  id: string | null = null;
  submitted = false;
  activeTab: 'datos' | 'categorias' | 'posters' = 'datos';

  form: Partial<Movie> = {
    titulo: '', sinopsis: '', duracion: undefined, cast: [],
    director: '', clasificacion: undefined, activa: true, fechaEstreno: ''
  };

  castInput = '';
  fechaEstrenoDate: Date | null = null;

  clasificaciones = [
    { label: 'A', value: 'A' }, { label: 'B12', value: 'B12' },
    { label: 'B15', value: 'B15' }, { label: 'C', value: 'C' },
  ];

  categorias = signal<Category[]>([]);
  categoriasPelicula = signal<Category[]>([]);
  categoriaSeleccionada: string | null = null;

  posters = signal<{ id: string; url: string; activa: boolean; orden: number }[]>([]);
  posterOrden = 1;
  fileToUpload: File | null = null;

  isEdit = computed(() => !!this.id);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: MovieService,
    private catSvc: CategoryService,
    private toast: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('[MovieForm] id ->', this.id);

    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'datos' || tab === 'categorias' || tab === 'posters') this.activeTab = tab as any;

    this.catSvc.list().subscribe({ next: cats => this.categorias.set(cats) });

    if (this.id) {
      this.svc.getById(this.id).subscribe({
        next: m => { console.log('[MovieForm] movie ->', m); this.applyMovieToForm(m); this.loadMovieRelations(); },
        error: err => { console.error('[MovieForm] getById error', err);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la película', life: 3000 });
        }
      });
    }
  }

  private applyMovieToForm(m: Movie) {
    this.form = {
      titulo: m.titulo ?? '',
      sinopsis: m.sinopsis ?? '',
      duracion: typeof m.duracion === 'number' ? m.duracion : Number(m.duracion ?? 0),
      cast: Array.isArray(m.cast) ? m.cast : [],
      director: m.director ?? '',
      clasificacion: (m.clasificacion ?? '') as any,
      activa: !!m.activa,
      fechaEstreno: m.fechaEstreno ?? ''
    };
    this.fechaEstrenoDate = m.fechaEstreno ? new Date(m.fechaEstreno) : null;
  }

  private loadMovieRelations() {
    if (!this.id) return;
    this.svc.listMovieCategories(this.id).subscribe({ next: x => this.categoriasPelicula.set(x) });
    this.svc.listPosters(this.id).subscribe({ next: p => this.posters.set(p) });
  }

  back() { this.router.navigate(['/peliculas']); }

  save() {
    this.submitted = true;
    if (!this.form.titulo || !this.form.duracion || !this.form.clasificacion || !this.fechaEstrenoDate || !this.form.sinopsis) {
      this.toast.add({ severity: 'warn', summary: 'Atención', detail: 'Completa los campos requeridos', life: 2500 });
      return;
    }
    const payload: Partial<Movie> = {
      titulo: this.form.titulo!.trim(),
      sinopsis: this.form.sinopsis!.trim(),
      duracion: this.form.duracion!,
      cast: this.form.cast ?? [],
      director: this.form.director ?? '',
      clasificacion: this.form.clasificacion!,
      activa: !!this.form.activa,
      fechaEstreno: this.toIsoDate(this.fechaEstrenoDate!)
    };

    const req = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: (res) => {
        this.toast.add({ severity: 'success', summary: 'OK', detail: 'Película guardada', life: 2200 });
        if (!this.id) {
          // ✅ navega a la ruta correcta y abre la pestaña de categorías
          this.router.navigate(['/peliculas', (res as Movie).id, 'editar'], { queryParams: { tab: 'categorias' } });
        } else {
          this.activeTab = 'categorias';
          this.loadMovieRelations();
        }
      }
    });
  }

  get castArr(): string[] {
    const a = this.form.cast as any;
    return Array.isArray(a) ? (a as string[]) : [];
  }
  private pushCastToken(token: string) {
    const val = token.trim(); if (!val) return;
    if (!Array.isArray(this.form.cast)) this.form.cast = [];
    if (!this.castArr.some(v => v.toLowerCase() === val.toLowerCase())) (this.form.cast as string[]).push(val);
  }
  addCastFromKey(ev: Event) { ev.preventDefault(); this.pushCastToken(this.castInput); this.castInput = ''; }
  onCastComma(ev: KeyboardEvent) { if (ev.key === ',') { ev.preventDefault(); this.pushCastToken(this.castInput); this.castInput = ''; } }
  addCastFromBlur() { if (this.castInput?.trim()) { this.pushCastToken(this.castInput); this.castInput = ''; } }
  addCastFromButton() { this.pushCastToken(this.castInput); this.castInput = ''; }
  removeCast(i: number) { if (Array.isArray(this.form.cast)) (this.form.cast as string[]).splice(i, 1); }

  addCategory() {
    if (!this.id || !this.categoriaSeleccionada) return;
    this.svc.attachCategory(this.id, this.categoriaSeleccionada).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Categoría agregada', life: 1800 });
        this.categoriaSeleccionada = null; this.loadMovieRelations(); }
    });
  }
  removeCategory(catId: string) {
    if (!this.id) return;
    this.confirm.confirm({
      message: '¿Quitar la categoría?', header: 'Confirmar',
      accept: () => this.svc.detachCategory(this.id!, catId).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Categoría removida', life: 1800 }); this.loadMovieRelations(); }
      })
    });
  }

  onFileSelected(e: any) { const files: File[] = e?.files || e?.currentFiles || []; this.fileToUpload = files[0] || null; }
  triggerUpload() {
    if (!this.id || !this.fileToUpload) return;
    this.svc.uploadPoster(this.id, this.fileToUpload, this.posterOrden || 1).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Póster subido', life: 1800 });
        this.fileToUpload = null; this.posterOrden = 1; this.loadMovieRelations(); }
    });
  }
  onUpload() {}

  togglePoster(p: any) {
    const req = p.activa ? this.svc.deactivatePoster(p.id) : this.svc.activatePoster(p.id);
    req.subscribe({ next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: `Póster ${p.activa ? 'desactivado' : 'activado'}`, life: 1800 }); this.loadMovieRelations(); } });
  }
  deletePoster(p: any) {
    this.confirm.confirm({
      message: '¿Eliminar póster?', header: 'Confirmar',
      accept: () => this.svc.deletePoster(p.id).subscribe({
        next: () => { this.toast.add({ severity: 'success', summary: 'OK', detail: 'Póster eliminado', life: 1800 }); this.loadMovieRelations(); }
      })
    });
  }

  private toIsoDate(d: Date) {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
}