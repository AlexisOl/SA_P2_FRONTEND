import { Component, OnInit, inject, signal } from '@angular/core';
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

import { BoletoService } from '@/services/boleto.service';
import { SalaServicio } from '@/services/sala-servicio.service';
import { CineServiceService } from '@/services/cine-service.service';

import { firstValueFrom, Observable } from 'rxjs';
import { ReporteBoletosGeneralDTO, ReporteBoletosSalaDTO } from '@/models/boleto.model';
import {cine, sala} from '@/models/Cine';
import {isArray} from 'chart.js/helpers';

interface SalaOpt {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-reporte-boletos-vendidos',
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './reporte-boletos-vendidos.html',
  styleUrl: './reporte-boletos-vendidos.scss',
})
export class ReporteBoletosVendidos implements  OnInit {

  private boletosSvc = inject(BoletoService);
  private salasSvc = inject(SalaServicio);
  private cinesSvc = inject(CineServiceService);
  private toast = inject(MessageService);

  // Filtros
  filtros = {
    desde: null as Date | null,
    hasta: null as Date | null,
    salaId: '' as string | '',
  };

  // Catálogos
  salas: sala[] = [];

  // Estado
  loading = false;
  private _reporte = signal<ReporteBoletosGeneralDTO | null>(null);
  reporte = this._reporte.asReadonly();

  // Mapas auxiliares
  private salaMap: Record<string, string> = {};

  // Expansión de filas
  expandedRowKeys: Record<string, boolean> = {};

  ngOnInit(): void {
    this.cargarSalasCatalogo();
  }
  salaSeleccionada: sala | null = null;
  cineSeleccionado: cine | null = null;
  cines: cine[] = [];

  onCineChange(event: any): void {
    this.salaSeleccionada = null;

    this.salas = [];
    console.log('Seleccionado', this.cineSeleccionado, event.value);
    if (event.value) {
      console.log('cargar salas');
      this.cargarSalasPorCine(event.value);
    }
  }

  onSalaChange(event: any): void {
console.log('Seleccionado', this.salaSeleccionada, event.value);
  }


  cargarSalasPorCine(cineId: string): void {
    this.salasSvc.listarSalasId(cineId).subscribe({
      next: (res) => {
        this.salas =  res as sala[];

        if (isArray(res) && res.length == 0) {
          this.toast.add({
            severity: 'info',
            summary: 'Información',
            detail: 'Este cine no tiene salas registradas'
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar salas:', error);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las salas'
        });
      }
    });
  }

  // ====== Acciones ======
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
    this._reporte.set(null);
    this.expandedRowKeys = {};

    const fechaInicio = this.toApiLocal(this.filtros.desde);
    const fechaFin = this.toApiLocal(this.filtros.hasta);
    const salaId = this.filtros.salaId || undefined;

    this.boletosSvc.generarReporteBoletos(fechaInicio, fechaFin, salaId).subscribe({
      next: (reporte) => {
        // Enriquecer nombres de sala si faltan
        if (reporte.detallesPorSala) {
          reporte.detallesPorSala = reporte.detallesPorSala.map((sala) => ({
            ...sala,
            nombreSala: sala.nombreSala || this.salaMap[sala.salaId] || sala.salaId,
          }));
        }

        this._reporte.set(reporte);
        this.loading = false;

        this.toast.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `${reporte.totalBoletosVendidos} boletos vendidos encontrados`,
        });
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
      salaId: '',
    };
    this._reporte.set(null);
    this.expandedRowKeys = {};
  }

  // ====== Helpers ======
  private toApiLocal(d: Date): string {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().slice(0, 19);
  }

  private async cargarSalasCatalogo() {
    this.cinesSvc.obtenerCInesLIst()
      .subscribe({
        next: data => {
          this.cines = data;
        }, error: err => {
          console.error('Error al cargar cines:', err);
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cines'
          });
        }
      });
  }

  calcularPromedioPorSala(): number {
    const rep = this.reporte();
    if (!rep || !rep.detallesPorSala || rep.detallesPorSala.length === 0) {
      return 0;
    }
    return rep.totalDineroRecaudado / rep.detallesPorSala.length;
  }

  toggleRow(sala: ReporteBoletosSalaDTO) {
    const key = sala.salaId;
    this.expandedRowKeys[key] = !this.expandedRowKeys[key];
  }

  onRowExpand(e: any) {
    console.log('[onRowExpand]', e?.data?.salaId);
  }

  onRowCollapse(e: any) {
    console.log('[onRowCollapse]', e?.data?.salaId);
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  // ====== PDF ======
  generarPDF() {
    const rep = this.reporte();
    if (!rep || !rep.detallesPorSala || rep.detallesPorSala.length === 0) {
      this.toast.add({
        severity: 'info',
        summary: 'PDF',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    const filtroSala = this.filtros.salaId
      ? (this.salaMap[this.filtros.salaId] ?? this.filtros.salaId)
      : 'Todas';
    const filtroDesde = this.filtros.desde
      ? this.fmtFecha(this.filtros.desde.toISOString())
      : '—';
    const filtroHasta = this.filtros.hasta
      ? this.fmtFecha(this.filtros.hasta.toISOString())
      : '—';

    // Construir el contenido del PDF
    const content: any[] = [
      { text: 'Reporte: Boletos Vendidos', style: 'h1' },
      {
        columns: [
          {
            width: '*',
            text:
              `Rango: ${filtroDesde}  a  ${filtroHasta}\n` +
              `Sala: ${filtroSala}`,
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
        columns: [
          {
            width: '*',
            text: [
              { text: 'Total Boletos: ', bold: true },
              rep.totalBoletosVendidos.toString(),
            ],
          },
          {
            width: '*',
            text: [
              { text: 'Total Recaudado: ', bold: true },
              this.fmtQ(rep.totalDineroRecaudado),
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 15],
      },
    ];

    // Agregar detalle por cada sala
    rep.detallesPorSala.forEach((sala, index) => {
      if (index > 0) {
        content.push({ text: '', margin: [0, 10, 0, 10] });
      }

      content.push({
        text: `Sala: ${sala.nombreSala || sala.salaId}`,
        style: 'h2',
        margin: [0, 10, 0, 5],
      });

      content.push({
        columns: [
          {
            width: '*',
            text: `Boletos: ${sala.totalBoletos}`,
          },
          {
            width: '*',
            text: `Recaudado: ${this.fmtQ(sala.totalDinero)}`,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 5],
      });

      // Tabla de usuarios
      if (sala.usuarios && sala.usuarios.length > 0) {
        const bodyUsuarios: any[] = [
          [
            { text: 'Usuario', bold: true },
            { text: 'Email', bold: true },
            { text: 'Boletos', bold: true, alignment: 'right' },
            { text: 'Total', bold: true, alignment: 'right' },
          ],
        ];

        sala.usuarios.forEach((u) => {
          bodyUsuarios.push([
            u.usuarioId? u.usuarioId : 'N/A' ,
            u.emailUsuario ? u.emailUsuario : 'N/A' ,
            { text: u.cantidadBoletosComprados.toString(), alignment: 'right' },
            { text: this.fmtQ(u.totalGastado), alignment: 'right' },
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: ['*', '*', 80, 100],
            body: bodyUsuarios,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f3f4f6' : null,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
          margin: [0, 5, 0, 0],
        });
      } else {
        content.push({
          text: 'Sin compradores en este periodo',
          italics: true,
          color: '#6c757d',
          margin: [0, 5, 0, 0],
        });
      }
    });

    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 40, 40, 40],
      content,
      styles: {
        h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
        h2: { fontSize: 14, bold: true, color: '#495057' },
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
        margin: [40, 10, 40, 0],
        fontSize: 9,
      }),
    };

    (pdfMake as any)
      .createPdf(documentDefinition)
      .download('reporte-boletos-vendidos.pdf');
  }

  private fmtFecha(d: string): string {
    const dt = new Date(d);
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

}
