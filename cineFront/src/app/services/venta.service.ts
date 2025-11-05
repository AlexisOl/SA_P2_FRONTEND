import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {CrearVentaDTO, EditarVentaDTO, FiltroVentaDTO, ResponseVentaDTO} from '@/models/ventas.model';

const baseUrl = environment.URL_GATEWAY + '/api/ventas/ventas';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(
    private http: HttpClient
  ) { }


  crearVenta(venta: CrearVentaDTO): Observable<ResponseVentaDTO> {
    return this.http.post<ResponseVentaDTO>(`${baseUrl}`, venta).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  editarVenta(ventaId: string, venta: EditarVentaDTO): Observable<ResponseVentaDTO> {
    return this.http.put<ResponseVentaDTO>(`${baseUrl}/${ventaId}`, venta).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  anularVenta(ventaId: string): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${ventaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarVentas(filtro?: FiltroVentaDTO): Observable<ResponseVentaDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.usuarioId) {
        params = params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.funcionId) {
        params = params.set('funcionId', filtro.funcionId);
      }
      if (filtro.estado) {
        params = params.set('estado', filtro.estado);
      }
      if (filtro.fechaInicio) {
        params = params.set('fechaInicio', filtro.fechaInicio);
      }
      if (filtro.fechaFin) {
        params = params.set('fechaFin', filtro.fechaFin);
      }
    }

    return this.http.get<ResponseVentaDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerVenta(ventaId: string): Observable<ResponseVentaDTO> {
    return this.http.get<ResponseVentaDTO>(`${baseUrl}/${ventaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}
