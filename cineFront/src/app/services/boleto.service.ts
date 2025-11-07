import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {ReporteBoletosGeneralDTO, ResponseBoletoDetalladoDTO, ResponseBoletoDTO} from '@/models/boleto.model';

const baseUrl = environment.URL_GATEWAY + '/api/ventas/boletos';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {

  constructor(
    private http: HttpClient
  ) { }

  listarBoletosPorVenta(idVenta: string): Observable<ResponseBoletoDetalladoDTO[]> {
    return this.http.get<ResponseBoletoDetalladoDTO[]>(`${baseUrl}/venta/${idVenta}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerBoletoPorCodigo(codigoBoleto: string): Observable<ResponseBoletoDTO> {
    return this.http.get<ResponseBoletoDTO>(`${baseUrl}/codigo/${codigoBoleto}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  generarReporteBoletos(fechaInicio: string, fechaFin: string, salaId?: string): Observable<ReporteBoletosGeneralDTO> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (salaId) {
      params = params.set('salaId', salaId);
    }

    return this.http.get<ReporteBoletosGeneralDTO>(`${baseUrl}/reporte`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}
