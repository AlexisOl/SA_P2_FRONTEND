import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { AuthService } from "@/services/auth";
import { ActivatedRoute } from "@angular/router";
import { CalificacionSalaService } from "@/services/calificacion-sala.service";

@Component({
  selector: 'app-reportes-generales',
  imports: [ButtonModule, CommonModule, DialogModule, FormsModule, TableModule,],
  templateUrl: './reportes-generales.html',
  styleUrl: './reportes-generales.scss',
})
export class ReportesGenerales implements OnInit {
  idCine!: string;
  calificacionSalaService = inject(CalificacionSalaService);
  authServicio = inject(AuthService);

  saldoEmpresa: any[] = [];
  saldoFiltrado: any[] = [];
  loading: boolean = false;

  // Variables para los inputs
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.idCine = this.route.snapshot.paramMap.get('id')!;
    this.cargarTodos();
  }
  cargarTodos() {
    this.loading = true;
    this.calificacionSalaService.listarCalificacionesPorRangoFecha("2025-11-01T00:00:00", "2025-11-19T23:59:59").subscribe({
      next: (elementos: any) => {
        this.saldoEmpresa = elementos;
        console.log(elementos);

        this.saldoFiltrado = [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Filtrar por rango de fechas
  filtrarPorRango() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    this.loading = true;

    const inicio = this.formatDateTime(this.fechaInicio);
    const fin = this.formatDateTime(this.fechaFin);

    this.calificacionSalaService.listarCalificacionesPorRangoFecha(inicio, fin).subscribe({
      next: (elementos: any[]) => {
        this.saldoFiltrado = elementos;
        this.loading = false;
      },
      error: () => {
        this.saldoFiltrado = [];
        this.loading = false;
      }
    });
  }


  // para hacer pdfs
  generarFacturaPDF() {
    const datosParaPDF = this.saldoFiltrado.length ? this.saldoFiltrado : this.saldoEmpresa
    console.log(datosParaPDF);

    const documentDefinition: any = {
      content: [
        { text: 'Saldo de la empresa ', style: 'header' },
        { text: `Fecha: ${new Date().toLocaleDateString()}` },
        { text: `------------------------------------` },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['Id de la sala', 'Fecha', 'Comentario'],
              ...datosParaPDF.map((valores: any) => {
                console.log(valores.comentario);
                
                return [
                  valores.salaId,
                  this.formatFechaHoraPDF(valores.fecha),
                   valores.comentario]
              }),
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    pdfMake.createPdf(documentDefinition).download('factura.pdf');
  }

  //formato
  public formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr.includes(':')) return dateTimeStr;

    const [date, time] = dateTimeStr.split('T');
    const [hours, minutes] = time.split(':');

    // Asegurar segundos
    return `${date}T${hours}:${minutes}:00`;
  }


    public formatFechaHoraPDF(dateTimeStr: string): string {
    if (!dateTimeStr.includes(':')) return dateTimeStr;

    const [date, time] = dateTimeStr.split('T');
    const [hours, minutes] = time.split(':');

    // Asegurar segundos
    return `${date} ${hours}:${minutes}`;
  }


  limpiarFiltro() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.saldoFiltrado = [];
  }
}