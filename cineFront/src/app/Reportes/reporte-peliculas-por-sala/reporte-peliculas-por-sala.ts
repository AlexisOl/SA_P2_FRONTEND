import {Component, OnInit, inject, signal, computed, effect,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

import { HorarioService } from '@/services/horario';
import { MovieService } from '@/peliculas/services/movie.service';
import { SalaServicio } from '@/services/sala-servicio.service';
import { CineServiceService } from '@/services/cine-service.service';

import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HorarioVM } from '@/models/horario';
import { MovieVM } from '@/interfaces/movie.interface';



interface RowVM {
  cineId: string;
  cineNombre: string;
  salaId: string;
  salaNombre: string;
  peliculaId: string;
  peliculaTitulo: string;
  inicio: string;
  fin: string;
  idioma: string;
  formato: string;
  precio?: number;
}

@Component({
  selector: 'app-reporte-peliculas-por-sala',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    ButtonModule,
    TagModule,
    CardModule,
    DividerModule,
    ToastModule,
    TableModule,
    DatePickerModule,
    SelectModule,
  ],
  providers: [MessageService],
  styles: [
    `
      :host ::ng-deep .reporte-toolbar .p-select,
      :host ::ng-deep .reporte-toolbar .p-datepicker {
        width: 100%;
      }
      .nowrap {
        white-space: nowrap;
      }
    `,
  ],
  templateUrl: './reporte-peliculas-por-sala.html',
})
export class ReportePeliculasPorSalaComponent implements OnInit {
  private horariosSvc = inject(HorarioService);
  private moviesSvc = inject(MovieService);
  private salasSvc = inject(SalaServicio);
  private cinesSvc = inject(CineServiceService);
  private toast = inject(MessageService);

  // helpers
  nombreCine = (id?: string) => (id && this.cineMap[id]) ?? id ?? '-';
  nombreSala = (id?: string) => (id && this.salaMap[id]) ?? id ?? '-';

  // filtros
  filtros = {
    desde: null as Date | null,
    hasta: null as Date | null,
    soloActivos: true,
    cinemaId: '' as string | '',
    salaId: '' as string | '',
  };

  // catálogos
  cines: Array<{ id: string; nombre: string }> = [];
  salas: Array<{ id: string; nombre: string }> = [];

  // estado
  loading = false;

  // salida tabular
  private _rows = signal<RowVM[]>([]);
  rows = this._rows.asReadonly();

  // mapas auxiliares
  private cineMap: Record<string, string> = {};
  private salaMap: Record<string, { nombre: string; cinemaId: string }> = {};
  private movieMap: Record<string, MovieVM> = {};

  constructor() {
    // “Escucha” el signal del servicio y arma el mapa
    effect(() => {
      // si tu servicio expone cinesSignal()
      const arr = this.cinesSvc.cinesSignal?.() ?? [];
      this.cines = (arr || []).map((c: any) => ({
        id: String(c.id),
        nombre: String(c.nombre ?? c.id),
      }));
      this.cineMap = {};
      for (const c of this.cines) this.cineMap[c.id] = c.nombre;
    });
  }

  ngOnInit(): void {
    // dispara la carga al iniciar (el service pobla el signal)
    this.cinesSvc.obtenerHoteles?.();
  }

  /** Intenta tomar el catálogo desde signal; si viene vacío,
   *  cae a un método HTTP del servicio (listarCines | listar | getAll). */
  private loadCines() {
    const fromSignal = (this.cinesSvc as any).cinesSignal?.() ?? [];
    if (Array.isArray(fromSignal) && fromSignal.length) {
      this.cines = fromSignal.map((c: any) => ({
        id: String(c.id),
        nombre: String(c.nombre ?? c.id),
      }));
      this.cineMap = Object.fromEntries(
        this.cines.map((c) => [c.id, c.nombre]),
      );
      return;
    }

    // fallback a HTTP (ajusta el nombre si tu servicio expone otro)
    const http$ =
      (this.cinesSvc as any).listarCines?.() ??
      (this.cinesSvc as any).listar?.() ??
      (this.cinesSvc as any).getAll?.();

    if (http$) {
      (http$ as any).subscribe((arr: any[]) => {
        const list = (arr || []).map((c) => ({
          id: String(c.id),
          nombre: String(c.nombre ?? c.id),
        }));
        this.cines = list;
        this.cineMap = Object.fromEntries(list.map((c) => [c.id, c.nombre]));
      });
    }
  }

  onChangeCine(cineId: string) {
    // reset sala
    this.filtros.salaId = '';
    this.salas = [];
    if (!cineId) return;
    this.salasSvc.listarSalasId(cineId).subscribe((arr) => {
      const data = arr as any[];
      const norm = (data || []).map((s) => ({
        id: String(s.id),
        nombre: String(s.nombre ?? s.id),
      }));
      this.salas = norm;
      for (const s of norm)
        this.salaMap[s.id] = { nombre: s.nombre, cinemaId: cineId };
    });
  }
  setQuickRange(preset: 'today' | '7d' | 'month') {
    const now = new Date();
    const start = new Date(now);
    if (preset === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (preset === '7d') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    this.filtros.desde = start;
    this.filtros.hasta = now;
  }

  generar() {
    if (!this.filtros.desde || !this.filtros.hasta) {
      this.toast.add({
        severity: 'warn',
        summary: 'Faltan fechas',
        detail: 'Selecciona el rango Desde/Hasta',
      });
      return;
    }
    if (this.filtros.desde.getTime() >= this.filtros.hasta.getTime()) {
      this.toast.add({
        severity: 'warn',
        summary: 'Rango inválido',
        detail: 'Desde debe ser menor que Hasta',
      });
      return;
    }

    this.loading = true;
    this._rows.set([]);

    const params: any = {
      desde: this.toApiLocal(this.filtros.desde),
      hasta: this.toApiLocal(this.filtros.hasta),
      soloActivos: this.filtros.soloActivos,
    };
    if (this.filtros.cinemaId) params.cinemaId = this.filtros.cinemaId;

    forkJoin({
      horarios: this.horariosSvc.list(params),
      peliculas: this.moviesSvc.list(),
    })
      .pipe(
        switchMap(({ horarios, peliculas }) => {
          // Mapa de películas
          this.movieMap = {};
          (peliculas || []).forEach((m: any) => {
            this.movieMap[String(m.id)] = {
              id: String(m.id),
              titulo: String(m.titulo ?? m.id),
              posters: m.posters ?? [],
              clasificacion: m.clasificacion,
            };
          });

          // Normaliza horarios
          let base: HorarioVM[] = (horarios || []).map((h: any) => ({
            id: String(h.id),
            peliculaId: String(h.peliculaId),
            cinemaId: String(h.cinemaId),
            salaId: String(h.salaId),
            idioma: String(h.idioma ?? ''),
            formato: String(h.formato ?? ''),
            inicio: String(h.inicio),
            fin: String(h.fin),
            precio: h.precio,
            activo: !!h.activo,
          }));

          if (this.filtros.salaId)
            base = base.filter((h) => h.salaId === this.filtros.salaId);

          // Trae nombres de salas de todos los cines involucrados
          const cineIds = Array.from(new Set(base.map((h) => h.cinemaId)));
          if (!cineIds.length) return of({ base, salasPorCine: [] as any[] });

          const calls = cineIds.map((id) => this.salasSvc.listarSalasId(id));
          return forkJoin<any[]>(calls).pipe(
            switchMap((salasArrs: any[][]) => {
              salasArrs.forEach((arr, i) => {
                const cineId = cineIds[i];
                (arr || []).forEach((s) => {
                  this.salaMap[String(s.id)] = {
                    nombre: String(s.nombre ?? s.id),
                    cinemaId: cineId,
                  };
                });
              });
              return of({ base, salasPorCine: salasArrs });
            }),
          );
        }),
      )
      .subscribe({
        next: ({ base }) => {
          // Aplana a filas para la tabla
          const rows: RowVM[] = (base as HorarioVM[]).map((h) => {
            const cineNombre = this.cineMap[h.cinemaId] ?? h.cinemaId;
            const salaInfo = this.salaMap[h.salaId] ?? {
              nombre: h.salaId,
              cinemaId: h.cinemaId,
            };
            const mov = this.movieMap[h.peliculaId];
            return {
              cineId: h.cinemaId,
              cineNombre,
              salaId: h.salaId,
              salaNombre: salaInfo.nombre,
              peliculaId: h.peliculaId,
              peliculaTitulo: mov?.titulo ?? h.peliculaId,
              inicio: h.inicio,
              fin: h.fin,
              idioma: h.idioma,
              formato: h.formato,
              precio: h.precio,
            };
          });

          // Orden inicial por Cine -> Sala -> Inicio
          rows.sort((a, b) => {
            const k1 = a.cineNombre + a.salaNombre + a.inicio;
            const k2 = b.cineNombre + b.salaNombre + b.inicio;
            return k1.localeCompare(k2);
          });

          this._rows.set(rows);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'No se pudo generar el reporte',
          });
        },
      });
  }

  limpiar() {
    this.filtros = {
      desde: null,
      hasta: null,
      soloActivos: true,
      cinemaId: '',
      salaId: '',
    };
    this.salas = [];
    this._rows.set([]);
  }

  // Fecha local en ISO sin Z (yyyy-MM-ddTHH:mm:ss)
  private toApiLocal(d: Date | null): string {
    if (!d) return '';
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().slice(0, 19);
  }

  private fmtFecha(d: string): string {
    const dt = new Date(d);
    // dd/MM/yyyy HH:mm
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  }

  private fmtQ(v?: number): string {
    if (v == null) return '—';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(v);
  }

  generarPDF() {
    const data = this.rows(); // filas ya aplanadas
    if (!data.length) {
      this.toast.add({
        severity: 'info',
        summary: 'PDF',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    // Encabezado de filtros usados
    const filtroCine = this.filtros.cinemaId
      ? (this.cineMap[this.filtros.cinemaId] ?? this.filtros.cinemaId)
      : 'Todos';
    const filtroSala = this.filtros.salaId
      ? (this.salaMap[this.filtros.salaId]?.nombre ?? this.filtros.salaId)
      : 'Todas';
    const filtroDesde = this.filtros.desde
      ? this.fmtFecha(this.filtros.desde.toISOString())
      : '—';
    const filtroHasta = this.filtros.hasta
      ? this.fmtFecha(this.filtros.hasta.toISOString())
      : '—';

    const body = [
      // Header de tabla
      [
        { text: 'Cine', bold: true },
        { text: 'Sala', bold: true },
        { text: 'Película', bold: true },
        { text: 'Inicio', bold: true },
        { text: 'Fin', bold: true },
        { text: 'Idioma', bold: true },
        { text: 'Formato', bold: true },
        { text: 'Precio', bold: true, alignment: 'right' },
      ],
      // Filas
      ...data.map((r) => [
        r.cineNombre,
        r.salaNombre,
        r.peliculaTitulo,
        this.fmtFecha(r.inicio),
        this.fmtFecha(r.fin),
        r.idioma || '',
        r.formato || '',
        { text: this.fmtQ(r.precio), alignment: 'right' },
      ]),
    ];

    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [32, 40, 32, 40],
      content: [
        { text: 'Reporte: Películas proyectadas por sala', style: 'h1' },
        {
          columns: [
            {
              width: '*',
              text:
                `Rango: ${filtroDesde}  a  ${filtroHasta}\n` +
                `Cine: ${filtroCine}   |   Sala: ${filtroSala}\n` +
                `Estado: ${this.filtros.soloActivos ? 'Solo activos' : 'Todos'}`,
            },
            {
              width: 'auto',
              text: `Generado: ${this.fmtFecha(new Date().toISOString())}`,
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: [110, 80, '*', 95, 75, 55, 60, 80],
            body,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f3f4f6' : null,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
        },
      ],
      styles: {
        h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      },
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: 'Comer & Dormir — Reportes', opacity: 0.6 },
          {
            text: `${currentPage} / ${pageCount}`,
            alignment: 'right',
            opacity: 0.6,
          },
        ],
        margin: [32, 10, 32, 0],
        fontSize: 9,
      }),
    };

    (pdfMake as any)
      .createPdf(documentDefinition)
      .download('reporte-peliculas-por-sala.pdf');
  }
}
