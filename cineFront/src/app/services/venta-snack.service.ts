import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {CrearVentaSnackDirectaDTO, FiltroVentaSnackDTO, ResponseVentaSnackDTO} from '@/models/venta-snack.model';

const baseUrl = environment.URL_GATEWAY + '/api/ventas/venta-snacks';

@Injectable({
  providedIn: 'root'
})
export class VentaSnackService {

  constructor(
    private http: HttpClient
  ) { }


  comprarSnacksDirecto(ventaSnack: CrearVentaSnackDirectaDTO): Observable<ResponseVentaSnackDTO[]> {
    return this.http.post<ResponseVentaSnackDTO[]>(`${baseUrl}`, ventaSnack).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarVentasSnacks(filtro?: FiltroVentaSnackDTO): Observable<ResponseVentaSnackDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.ventaSnackId) {
        params = params.set('ventaSnackId', filtro.ventaSnackId);
      }
      if (filtro.ventaId) {
        params = params.set('ventaId', filtro.ventaId);
      }
      if (filtro.snackId) {
        params = params.set('snackId', filtro.snackId);
      }
      if (filtro.usuarioId) {
        params = params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.fechaInicio) {
        params = params.set('fechaInicio', filtro.fechaInicio);
      }
      if (filtro.fechaFin) {
        params = params.set('fechaFin', filtro.fechaFin);
      }
    }

    return this.http.get<ResponseVentaSnackDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerVentaSnack(ventaSnackId: string): Observable<ResponseVentaSnackDTO> {
    return this.http.get<ResponseVentaSnackDTO>(`${baseUrl}/${ventaSnackId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarVentasSnacksPorVenta(ventaId: string): Observable<ResponseVentaSnackDTO[]> {
    return this.http.get<ResponseVentaSnackDTO[]>(`${baseUrl}/venta/${ventaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarVentasSnacksPorUsuario(usuarioId: string): Observable<ResponseVentaSnackDTO[]> {
    return this.http.get<ResponseVentaSnackDTO[]>(`${baseUrl}/usuario/${usuarioId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarVentasPorSnack(snackId: string): Observable<ResponseVentaSnackDTO[]> {
    return this.http.get<ResponseVentaSnackDTO[]>(`${baseUrl}/snack/${snackId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}
