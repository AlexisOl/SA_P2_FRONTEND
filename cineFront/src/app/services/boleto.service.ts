import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {ResponseBoletoDTO} from '@/models/boleto.model';

const baseUrl = environment.URL_GATEWAY + '/api/ventas/boletos';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {

  constructor(
    private http: HttpClient
  ) { }

  listarBoletosPorVenta(idVenta: string): Observable<ResponseBoletoDTO[]> {
    return this.http.get<ResponseBoletoDTO[]>(`${baseUrl}/venta/${idVenta}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerBoletoPorCodigo(codigoBoleto: string): Observable<ResponseBoletoDTO> {
    return this.http.get<ResponseBoletoDTO>(`${baseUrl}/codigo/${codigoBoleto}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}
