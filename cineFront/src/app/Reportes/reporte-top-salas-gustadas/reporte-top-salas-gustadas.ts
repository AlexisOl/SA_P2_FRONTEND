import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PDF
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

import { firstValueFrom, Observable } from 'rxjs';
import { RippleModule } from 'primeng/ripple';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CalificacionSalaService } from '@/services/calificacion-sala.service';
import { SalaServicio } from '@/services/sala-servicio.service';
import { CineServiceService } from '@/services/cine-service.service';

interface Calificacion {
  calificacionId: string;
  usuarioId: string;
  salaId: string;
  puntuacion: number; // 1..5
  comentario: string | null;
  fecha: string; // ISO
}
interface SalaOpt {
  id: string;
  nombre: string;
}
interface TopSalaRow {
  salaId: string;
  salaNombre: string;
  promedio: number;
  total: number;
  // para el detalle
  calificaciones: Calificacion[];
}

@Component({
  selector: 'app-reporte-top-salas-gustadas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    RatingModule,
    DividerModule,
    ToastModule,
    RippleModule,
  ],
  providers: [MessageService],
  styles: [
    `
      .toolbar {
        border-radius: 12px;
      }
      .nowrap {
        white-space: nowrap;
      }
      :host ::ng-deep .p-rating .p-rating-item .p-rating-icon {
        font-size: 1rem;
      }
    `,
  ],
  templateUrl: "./reporte-top-salas-gustadas.html" ,
})
export class ReporteTopSalasGustadasComponent implements OnInit {
  // servicios
  private calificacionesSvc = inject(CalificacionSalaService);
  private salasSvc = inject(SalaServicio);
  private cinesSvc = inject(CineServiceService);
  private toast = inject(MessageService);

  // filtros
  filtros = {
    desde: null as Date | null,
    hasta: null as Date | null,
    salaId: '' as string | '',
  };

  // catálogos
  salas: SalaOpt[] = [];

  // estado
  loading = false;
  private _rows = signal<TopSalaRow[]>([]);
  rows = this._rows.asReadonly();

  // Mapas auxiliares
  private salaMap: Record<string, string> = {}; // salaId -> nombre

  expandedRows: { [key: string]: boolean } = {};

  ngOnInit(): void {
    // Si ya tienes cines/salas cacheadas en signals, puedes reutilizarlas.
    // Aquí intentamos cargar todas las salas disponibles para el selector:
    this.cargarSalasCatalogo();
  }

  // ====== UI helpers ======
  badge(prom: number): {
    text: string;
    sev: 'success' | 'info' | 'warn' | 'danger' | 'secondary';
  } {
    if (prom >= 4.5) return { text: 'Excelente', sev: 'success' };
    if (prom >= 4.0) return { text: 'Muy buena', sev: 'success' };
    if (prom >= 3.0) return { text: 'Buena', sev: 'info' };
    if (prom >= 2.0) return { text: 'Regular', sev: 'warn' };
    return { text: 'Baja', sev: 'danger' };
  }

  // ====== Acciones ======
  generar() {
    if (!this.filtros.desde || !this.filtros.hasta) {
      this.toast.add({
        severity: 'warn',
        summary: 'Faltan fechas',
        detail: 'Selecciona Desde y Hasta',
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

    // 1) Intentamos usar un endpoint con intervalo. Si no existe, caemos a traer todo y filtrar.
    const fechaInicio = this.toApiLocal(this.filtros.desde);
    const fechaFin = this.toApiLocal(this.filtros.hasta);
    const salaId = this.filtros.salaId || undefined;

    const endpointConRango = (this.calificacionesSvc as any).listarPorIntervalo;
    const obs$ = endpointConRango
      ? (this.calificacionesSvc as any).listarPorIntervalo({
          fechaInicio,
          fechaFin,
          salaId,
        })
      : this.calificacionesSvc.listarCalificaciones(); // fallback

    obs$.subscribe({
      next: (arr: any[]) => {
        // 2) Normaliza + filtra por rango si fue fallback
        let base: Calificacion[] = (arr || []).map((c: any) => ({
          calificacionId: String(
            c.calificacionId ?? c.id ?? crypto.randomUUID(),
          ),
          usuarioId: String(c.usuarioId),
          salaId: String(c.salaId),
          puntuacion: Number(c.puntuacion),
          comentario: c.comentario ?? null,
          fecha: String(c.fecha),
        }));

        if (!endpointConRango) {
          // filtra por intervalo localmente
          const i = new Date(this.filtros.desde!).getTime();
          const f = new Date(this.filtros.hasta!).getTime();
          base = base.filter((c) => {
            const t = new Date(c.fecha).getTime();
            return t >= i && t <= f;
          });
          if (salaId) base = base.filter((c) => c.salaId === salaId);
        }

        // 3) Agrupa por sala y calcula promedio + total
        const bucket = new Map<string, Calificacion[]>();
        for (const c of base) {
          if (salaId && c.salaId !== salaId) continue;
          if (!bucket.has(c.salaId)) bucket.set(c.salaId, []);
          bucket.get(c.salaId)!.push(c);
        }

        // 4) arma filas y trae nombres de sala si faltan
        const rows: TopSalaRow[] = [];
        bucket.forEach((list, sid) => {
          const total = list.length;
          const prom = total
            ? list.reduce((a, b) => a + b.puntuacion, 0) / total
            : 0;
          rows.push({
            salaId: sid,
            salaNombre: this.salaMap[sid] ?? sid,
            promedio: Number(prom.toFixed(2)),
            total,
            calificaciones: list.sort(
              (a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
            ),
          });
        });

        // Orden por promedio DESC, luego total DESC
        rows.sort((a, b) => b.promedio - a.promedio || b.total - a.total);

        // top 5
        const top5 = rows.slice(0, 5);

        // Si faltan nombres de sala, intenta resolverlos perezosamente
        this.resolveSalaNames(top5).finally(() => {
          this._rows.set(top5);
          this.loading = false;
        });
      },
      error: (e: { error: { message: any } }) => {
        this.loading = false;
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: e?.error?.message || 'No se pudo generar el reporte',
        });
      },
    });
  }

  limpiar() {
    this.filtros = { desde: null, hasta: null, salaId: '' };
    this._rows.set([]);
  }

  // ====== Helpers ======
  private toApiLocal(d: Date): string {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString();
  }

  /** Carga catálogo de salas para el <select>.
   *  Si tu SalaServicio expone otro método (listarTodas, getAll, etc.), cámbialo aquí. */
  private async cargarSalasCatalogo() {
    // Tipa el observable como arreglo
    const http$ = ((this.salasSvc as any).listarTodas?.() ??
      (this.salasSvc as any).listar?.() ??
      (this.salasSvc as any).getAll?.()) as Observable<any[]> | null;

    if (http$) {
      const arr = await firstValueFrom(http$); // arr: any[]
      const list = Array.isArray(arr)
        ? arr.map((s) => ({
            id: String(s.id),
            nombre: String(s.nombre ?? s.id),
          }))
        : [];
      this.salas = list;
      this.salaMap = list.reduce((acc: Record<string, string>, s) => {
        acc[s.id] = s.nombre;
        return acc;
      }, {});
      return;
    }

    // Fallback: cines -> salas por cine
    this.cinesSvc.obtenerHoteles?.();
    const cines = this.cinesSvc.cinesSignal?.() ?? [];

    const multi = await Promise.all(
      (cines || []).map((c: any) =>
        firstValueFrom(
          this.salasSvc.listarSalasId(String(c.id)) as unknown as Observable<
            any[]
          >,
        ),
      ),
    ); // multi: any[][]

    const flat = multi.flat();
    const list = Array.isArray(flat)
      ? flat.map((s: any) => ({
          id: String(s.id),
          nombre: String(s.nombre ?? s.id),
        }))
      : [];

    const uniq = new Map(list.map((s) => [s.id, s]));
    this.salas = Array.from(uniq.values());
    this.salaMap = this.salas.reduce((acc: Record<string, string>, s) => {
      acc[s.id] = s.nombre;
      return acc;
    }, {});
  }

  /** Completa los nombres de sala que falten. Intenta usar salasSvc.getById?. */
  private async resolveSalaNames(rows: TopSalaRow[]) {
    const pending: string[] = rows
      .filter((r) => !this.salaMap[r.salaId] || r.salaNombre === r.salaId)
      .map((r) => r.salaId);

    if (!pending.length) return;

    const getter =
      (this.salasSvc as any).getById || (this.salasSvc as any).obtenerPorId;
    if (!getter) return;

    await Promise.all(
      pending.map(async (id) => {
        try {
          const s = await getter.call(this.salasSvc, id).toPromise();
          const nombre = String(s?.nombre ?? id);
          this.salaMap[id] = nombre;
          const row = rows.find((r) => r.salaId === id);
          if (row) row.salaNombre = nombre;
        } catch {}
      }),
    );
  }

  // estado de filas expandidas por clave (usa dataKey = salaId)
  expandedRowKeys: Record<string, boolean> = {};

  toggleRow(row: TopSalaRow) {
    const key = row.salaId;
    this.expandedRowKeys[key] = !this.expandedRowKeys[key];
    console.log('[toggleRow]', {
      key,
      expanded: this.expandedRowKeys[key],
      califs: row.calificaciones,
    });
  }
  onRowExpand(e: any) {
    console.log('[onRowExpand]', e?.data?.salaId);
  }
  onRowCollapse(e: any) {
    console.log('[onRowCollapse]', e?.data?.salaId);
  }
  generarPDF() {
    const rows = this.rows();
    if (!rows.length) {
      this.toast.add({
        severity: 'info',
        summary: 'PDF',
        detail: 'No hay datos para exportar.',
      });
      return;
    }
    const doc = this.buildDocDefinitionTopOnly(rows);
    pdfMake.createPdf(doc as any).download(`Top_5_Salas_${this.hoyYmd()}.pdf`);
  }

  private buildDocDefinitionTopOnly(rows: TopSalaRow[]) {
    // Encabezado de la tabla
    const header: any[] = [
      { text: 'Sala', style: 'th' },
      { text: 'Promedio estrellas', style: 'th', alignment: 'center' },
      { text: 'Total calificaciones', style: 'th', alignment: 'center' },
    ];

    // Filas (solo top; ya viene limitado a 5 en tu lógica)
    const body: any[] = [header];
    for (const r of rows) {
      body.push([
        { text: r.salaNombre, style: 'td' },
        {
          text: ` (${r.promedio.toFixed(2)}/5)`,
          style: 'td',
          alignment: 'center',
        },
        { text: String(r.total), style: 'td', alignment: 'center' },
      ]);
    }

    return {
      content: [
        { text: 'Top 5 Salas más gustadas', style: 'title' },
        {
          columns: [
            {
              text: `Rango: ${this.fmtFecha(this.filtros.desde)}  —  ${this.fmtFecha(this.filtros.hasta)}`,
              style: 'meta',
            },
            {
              text: `Sala (filtro): ${this.filtros.salaId ? this.salaMap[this.filtros.salaId] || this.filtros.salaId : 'Todas'}`,
              style: 'meta',
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: ['*', 120, 150],
            body,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f1f3f5' : null,
            hLineWidth: (i: number, node: any) => (i === 1 ? 1.2 : 0.5),
            vLineWidth: () => 0,
            hLineColor: () => '#999',
          },
        },
      ],
      styles: {
        title: { fontSize: 20, bold: true, margin: [0, 0, 0, 6] },
        meta: { fontSize: 10, color: '#555' },
        th: { bold: true, fontSize: 11, color: '#333', margin: [0, 6, 0, 6] },
        td: { fontSize: 10, margin: [0, 6, 0, 6] },
      },
      defaultStyle: { fontSize: 10 },
      pageMargins: [40, 40, 40, 40],
    };
  }

  // Helpers de formato
  private stars(val: number) {
    // Redondeo al 0.5 si quieres: const n = Math.round(val * 2) / 2;
    const n = Math.round(val); // 0..5 entero
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
  private fmtFecha(d: Date | null): string {
    if (!d) return '-';
    const dd = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return dd.toISOString().slice(0, 16).replace('T', ' ');
  }
  private hoyYmd(): string {
    const d = new Date();
    const z = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
}
