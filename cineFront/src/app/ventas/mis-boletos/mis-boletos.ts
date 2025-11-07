import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

// Services
import { BoletoService } from '@/services/boleto.service';
import { VentaService } from '@/services/venta.service';
import { AuthService } from '@/services/auth';

// Models
import { ResponseBoletoDetalladoDTO } from '@/models/boleto.model';
import { ResponseVentaDTO } from '@/models/ventas.model';

interface VentaOption {
  label: string;
  value: string;
  fecha: Date;
  total: number;
}

@Component({
  selector: 'app-mis-boletos',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    ChipModule,
    TagModule,
    SelectModule,
    SkeletonModule
  ],
  providers: [MessageService, BoletoService, VentaService, AuthService],
  templateUrl: './mis-boletos.html',
  styleUrl: './mis-boletos.scss',
})
export class MisBoletos implements OnInit {

  // Usuario
  usuarioId: string = '';

  // Ventas del usuario
  ventas: ResponseVentaDTO[] = [];
  ventasOptions: VentaOption[] = [];
  ventaSeleccionada: VentaOption | null = null;

  // Boletos
  boletos: ResponseBoletoDetalladoDTO[] = [];

  // Estados de carga
  cargandoVentas: boolean = false;
  cargandoBoletos: boolean = false;
  descargandoBoleto: { [key: string]: boolean } = {};

  constructor(
    private boletoService: BoletoService,
    private ventaService: VentaService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
        this.cargarVentasUsuario();
      }
    });

    this.authService.fetchAndCacheUser().subscribe(u => {
      if (u) {
        this.usuarioId = u.id;
        this.cargarVentasUsuario();
      }
    });
  }

  cargarVentasUsuario(): void {
    if (!this.usuarioId) return;

    this.cargandoVentas = true;
    this.ventaService.listarVentas({ usuarioId: this.usuarioId }).subscribe({
      next: (ventas) => {
        this.ventas = ventas.sort((a, b) => {
          return new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime();
        });

        this.ventasOptions = this.ventas.map(venta => ({
          label: `Compra ${new Date(venta.fechaVenta).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} - ${venta.montoTotal.toFixed(2)} GTQ`,
          value: venta.ventaId,
          fecha: new Date(venta.fechaVenta),
          total: venta.montoTotal
        }));

        // Seleccionar la venta más reciente automáticamente
        if (this.ventasOptions.length > 0) {
          this.ventaSeleccionada = this.ventasOptions[0];
          this.cargarBoletosDeVenta();
        }

        this.cargandoVentas = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus compras'
        });
        this.cargandoVentas = false;
      }
    });
  }

  onVentaChange(): void {
    if (this.ventaSeleccionada) {
      this.cargarBoletosDeVenta();
    } else {
      this.boletos = [];
    }
  }

  cargarBoletosDeVenta(): void {
    if (!this.ventaSeleccionada) return;

    this.cargandoBoletos = true;
    this.boletoService.listarBoletosPorVenta(this.ventaSeleccionada.value).subscribe({
      next: (boletos) => {
        this.boletos = boletos;
        this.cargandoBoletos = false;

        if (boletos.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Sin boletos',
            detail: 'No se encontraron boletos para esta compra'
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar boletos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los boletos'
        });
        this.cargandoBoletos = false;
      }
    });
  }

  async descargarBoleto(boleto: ResponseBoletoDetalladoDTO): Promise<void> {
    const boletoId = boleto.boletoId;
    this.descargandoBoleto[boletoId] = true;

    try {
      const elemento = document.getElementById(`boleto-${boletoId}`);
      if (!elemento) {
        throw new Error('Elemento no encontrado');
      }

      // Crear canvas del ticket
      const canvas = await html2canvas(elemento, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convertir a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `boleto-${boleto.codigoBoleto}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: 'Descarga exitosa',
            detail: 'Boleto descargado correctamente'
          });
        }
        this.descargandoBoleto[boletoId] = false;
      }, 'image/png');

    } catch (error) {
      console.error('Error al descargar boleto:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo descargar el boleto'
      });
      this.descargandoBoleto[boletoId] = false;
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularDuracionFormato(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  }

  getEstadoBoleto(fechaInicio: string): { texto: string; severity: string } {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);

    if (ahora > inicio) {
      return { texto: 'Usado', severity: 'secondary' };
    } else if (ahora.getTime() > inicio.getTime() - 2 * 60 * 60 * 1000) {
      return { texto: 'Próximo', severity: 'warning' };
    } else {
      return { texto: 'Válido', severity: 'success' };
    }
  }

  getSeverity(fechaInicio: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);

    if (ahora > inicio) {
      return 'secondary';
    } else if (ahora.getTime() > inicio.getTime() - 2 * 60 * 60 * 1000) {
      return 'warn' ;
    } else {
      return  'success' ;
    }
  }

}
