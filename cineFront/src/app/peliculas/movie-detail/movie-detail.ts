import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { MovieService } from '@/peliculas/services/movie.service';
import { HorarioService } from '@/services/horario';
import { SalaServicio } from '@/services/sala-servicio.service';
import { CineServiceService } from '@/services/cine-service.service';

type Clasificacion = 'A' | 'B' | 'B12' | 'B15' | 'C';

interface MovieVM {
  id: string;
  titulo: string;
  sinopsis: string;
  duracion: number;
  posters?: string[];
  cast?: string[];
  director?: string;
  clasificacion?: Clasificacion;
  activa?: boolean;
  fechaEstreno?: string;
}

interface HorarioVM {
  id: string;
  cinemaId: string;
  salaId: string;
  idioma: string;
  formato: string;
  inicio: string;
  fin: string;
  precio?: number;
  activo: boolean;
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, DividerModule],
  template: `
  <div class="container mx-auto p-4 lg:p-6">

    <!-- ENCABEZADO -->
    <div class="grid" style="row-gap:16px; column-gap:16px;">
      <div class="col-12 md:col-4">
        <div class="rounded-lg overflow-hidden shadow-2">
          <img
            [src]="posterPrincipal()"
            alt="poster"
            style="width:100%; height: 420px; object-fit: cover;"
          />
        </div>
      </div>

      <div class="col-12 md:col-8">
        <div class="flex items-center gap-2 mb-2">
          <h2 class="m-0 text-3xl font-bold">{{ movie()?.titulo }}</h2>
          <p-tag *ngIf="movie()?.clasificacion"
                 [value]="movie()?.clasificacion!"
                 [severity]="clasifSeverity(movie()?.clasificacion!)" />
          <p-tag *ngIf="movie()?.activa" value="EN CARTELERA" severity="success" />
        </div>

        <p class="text-color-secondary mb-3">{{ movie()?.sinopsis }}</p>

        <div class="flex flex-wrap gap-3 mb-2">
          <span class="flex items-center gap-2">
            <i class="pi pi-clock"></i>
            {{ movie()?.duracion }} min
          </span>
          <span class="flex items-center gap-2" *ngIf="movie()?.fechaEstreno">
            <i class="pi pi-calendar"></i>
            {{ movie()?.fechaEstreno | date:'mediumDate' }}
          </span>
          <span class="flex items-center gap-2" *ngIf="movie()?.director">
            <i class="pi pi-user"></i>
            Dir. {{ movie()?.director }}
          </span>
        </div>

        <!-- Cast -->
        <div *ngIf="(movie()?.cast?.length || 0) > 0" class="mb-2">
          <span class="font-semibold mr-2">Reparto:</span>
          <ng-container *ngFor="let c of movie()?.cast; let i = index">
            <span>{{ c }}</span><span *ngIf="i < (movie()?.cast!.length||1)-1">,&nbsp;</span>
          </ng-container>
        </div>

        <!-- Categorías -->
        <div *ngIf="categorias().length" class="mt-3">
          <span class="font-semibold mr-2">Categorías:</span>
          <div class="inline-flex flex-wrap gap-2">
            <p-tag *ngFor="let cat of categorias()" [value]="cat.nombre" severity="info" />
          </div>
        </div>
      </div>
    </div>

    <p-divider class="my-5"></p-divider>

    <!-- HORARIOS POR CINE -->
    <h3 class="text-2xl font-semibold mb-3">Horarios disponibles</h3>

    <ng-container *ngIf="grupos().length; else sinHorarios">
      <div class="flex flex-col gap-5">
        <div *ngFor="let g of grupos()" class="card shadow-1 p-3 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h4 class="m-0 text-xl font-bold">{{ nombreCine(g.cineId) }}</h4>
          </div>

          <div class="grid" style="row-gap:12px; column-gap:12px;">
            <div class="col-12 md:col-6 lg:col-4" *ngFor="let h of g.items">
              <div class="surface-100 rounded-lg p-3 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">{{ nombreSala(g.cineId, h.salaId) }}</span>
                  <p-tag [value]="h.formato" severity="secondary"></p-tag>
                </div>
                <div class="text-color-secondary text-sm">
                  Idioma: <span class="font-medium text-color">{{ h.idioma }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <i class="pi pi-clock"></i>
                    {{ h.inicio | date:'short' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="pi pi-arrow-right"></i>
                    {{ h.fin | date:'shortTime' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-semibold" *ngIf="h.precio != null">
                    {{ h.precio | currency:'GTQ' }}
                  </span>
                  <p-tag [value]="h.activo ? 'ACTIVO' : 'INACTIVO'"
                         [severity]="h.activo ? 'success' : 'danger'"></p-tag>
                </div>
                <!-- Acción futura (compra/selección) -->
                <!-- <p-button label="Seleccionar" icon="pi pi-ticket" (onClick)="irAComprar(h)" /> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #sinHorarios>
      <div class="surface-100 rounded-md p-4 text-center text-color-secondary">
        No hay horarios activos para esta película.
      </div>
    </ng-template>

  </div>
  `
})
export class MovieDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private movies = inject(MovieService);
  private horariosSvc = inject(HorarioService);
  private salasSvc = inject(SalaServicio);
  private cinesSvc = inject(CineServiceService);

  // Estado
  movie = signal<MovieVM | null>(null);
  categorias = signal<Array<{id: string; nombre: string}>>([]);

  grupos = signal<Array<{ cineId: string; items: HorarioVM[] }>>([]);

  // Mapas de nombres
  private cineMap: Record<string, string> = {};
  private salaMaps: Record<string, Record<string, string>> = {}; // por cine

  ngOnInit(): void {
    // Asegura catálogo de cines (para nombres)
    this.cinesSvc.obtenerHoteles?.();
    const cines = this.cinesSvc.cinesSignal?.() ?? [];
    for (const c of cines) {
      if (c?.id) this.cineMap[String(c.id)] = String(c.nombre ?? c.id);
    }

    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargarPelicula(id);
    this.cargarCategorias(id);
    this.cargarHorarios(id);
  }

  // ---------- Cargas ----------
  private cargarPelicula(id: string) {
    // No hay getById directo de la película pura; tomamos el listado y filtramos
    this.movies.list().subscribe((arr: any[]) => {
      const m = (arr || []).find(x => String(x.id) === String(id));
      if (m) this.movie.set(m as MovieVM);
    });
  }

  private cargarCategorias(id: string) {
    this.movies.getCategoriasDePelicula(id).subscribe({
      next: (cats) => this.categorias.set(cats || []),
      error: () => this.categorias.set([])
    });
  }

  private cargarHorarios(peliculaId: string) {
    this.horariosSvc.list({ peliculaId, soloActivos: true }).subscribe({
      next: (items: any[]) => {
        const limpios: HorarioVM[] = (items || []).map(h => ({
          id: String(h.id),
          cinemaId: String(h.cinemaId),
          salaId: String(h.salaId),
          idioma: String(h.idioma ?? ''),
          formato: String(h.formato ?? ''),
          inicio: String(h.inicio),
          fin: String(h.fin),
          precio: h.precio,
          activo: !!h.activo
        }));

        // Agrupar por cine
        const bucket: Record<string, HorarioVM[]> = {};
        for (const h of limpios) (bucket[h.cinemaId] ||= []).push(h);

        // Ordenar por hora
        for (const k of Object.keys(bucket)) {
          bucket[k].sort((a, b) => a.inicio.localeCompare(b.inicio));
        }

        // Construir grupos
        const grupos = Object.entries(bucket).map(([cineId, arr]) => ({ cineId, items: arr }));
        this.grupos.set(grupos);

        // Precargar nombres de salas por cine (caché simple)
        for (const g of grupos) this.cargarSalasDeCine(g.cineId);
      },
      error: () => this.grupos.set([])
    });
  }

  private cargarSalasDeCine(cineId: string) {
    if (this.salaMaps[cineId]) return;
    this.salasSvc.listarSalasId(cineId)
  .subscribe((resp: any) => {
    const salas: any[] = Array.isArray(resp) ? resp : (resp?.content ?? []);
    this.salaMaps[cineId] = {};
    for (const s of salas) {
      this.salaMaps[cineId][String(s.id)] = String(s.nombre ?? s.id);
    }
  });
  }

  // ---------- Helpers de UI ----------
  posterPrincipal(): string {
    const p = this.movie()?.posters;
    return (p && p.length) ? p[0] : 'https://placehold.co/600x800?text=Sin+poster';
    // cambia placeholder si prefieres
  }

  clasifSeverity(c: Clasificacion): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (c) {
      case 'A': return 'success';
      case 'B':
      case 'B12':
      case 'B15': return 'warn';
      case 'C': return 'danger';
      default: return 'secondary';
    }
  }

  nombreCine(id?: string): string {
    if (!id) return '-';
    return this.cineMap[id] ?? id;
  }

  nombreSala(cineId?: string, salaId?: string): string {
    if (!cineId || !salaId) return '-';
    return this.salaMaps[cineId]?.[salaId] ?? salaId;
  }

  // Ejemplo de navegación futura
  // irAComprar(h: HorarioVM) {
  //   this.router.navigate(['/comprar', h.id]);
  // }
}