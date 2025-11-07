import { CineServiceService } from '@/services/cine-service.service';
import { ReporteService } from '@/services/reporte.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-ingresos-anuncios',
  imports: [ButtonModule, CommonModule, DialogModule, FormsModule, TableModule],
  templateUrl: './ingresos-anuncios.html',
  styleUrl: './ingresos-anuncios.scss',
})
export class IngresosAnuncios implements OnInit{


  cineId!: string;
  reporte = [];
  reporteFiltrado = [];
  loading = false;
  cines=[]
  cineServicio = inject(CineServiceService)

  constructor(private servicioReportes: ReporteService) {}

  ngOnInit() {
    
    // opcional: cargar un cine por defecto
    this.filtrarPorCine();
  }

  filtrarPorCine() {

    if (!this.cineId) return;

    this.loading = true;
    this.servicioReportes.listarReporteCineAnunciosEspecifico(this.cineId).subscribe({
      next: (data: any) => {
        this.reporte = data;
        this.reporteFiltrado = [...this.reporte];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.reporte = [];
        this.reporteFiltrado = [];
      }
    });
  }
}
