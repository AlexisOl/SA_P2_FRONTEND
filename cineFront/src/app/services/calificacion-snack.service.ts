import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {
  CrearCalificacionSnackDTO,
  FiltroCalificacionSnackDTO, PromedioCalificacionSnackResponse,
  ResponseCalificacionSnackDTO
} from '@/models/calificacion-snack.model';


const baseUrl = environment.URL_GATEWAY + '/api/calificaciones/snacks';

@Injectable({
  providedIn: 'root'
})
export class CalificacionSnackService {

  constructor(
    private http: HttpClient
  ) { }


  crearCalificacion(calificacion: CrearCalificacionSnackDTO): Observable<ResponseCalificacionSnackDTO> {
    return this.http.post<ResponseCalificacionSnackDTO>(`${baseUrl}`, calificacion).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  listarCalificaciones(filtro?: FiltroCalificacionSnackDTO): Observable<ResponseCalificacionSnackDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.usuarioId) {
        params = params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.snackId) {
        params = params.set('snackId', filtro.snackId);
      }
      if (filtro.puntuacionMinima !== undefined && filtro.puntuacionMinima !== null) {
        params = params.set('puntuacionMinima', filtro.puntuacionMinima.toString());
      }
      if (filtro.puntuacionMaxima !== undefined && filtro.puntuacionMaxima !== null) {
        params = params.set('puntuacionMaxima', filtro.puntuacionMaxima.toString());
      }
      if (filtro.fechaInicio) {
        params = params.set('fechaInicio', filtro.fechaInicio);
      }
      if (filtro.fechaFin) {
        params = params.set('fechaFin', filtro.fechaFin);
      }
    }

    return this.http.get<ResponseCalificacionSnackDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerCalificacion(id: string): Observable<ResponseCalificacionSnackDTO> {
    return this.http.get<ResponseCalificacionSnackDTO>(`${baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerPromedioCalificacion(snackId: string): Observable<PromedioCalificacionSnackResponse> {
    return this.http.get<PromedioCalificacionSnackResponse>(`${baseUrl}/promedio/${snackId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarCalificacionesPorUsuario(usuarioId: string): Observable<ResponseCalificacionSnackDTO[]> {
    const filtro: FiltroCalificacionSnackDTO = { usuarioId };
    return this.listarCalificaciones(filtro);
  }

  listarCalificacionesPorSnack(snackId: string): Observable<ResponseCalificacionSnackDTO[]> {
    const filtro: FiltroCalificacionSnackDTO = { snackId };
    return this.listarCalificaciones(filtro);
  }


  listarCalificacionesPorRango(puntuacionMinima: number, puntuacionMaxima: number): Observable<ResponseCalificacionSnackDTO[]> {
    const filtro: FiltroCalificacionSnackDTO = { puntuacionMinima, puntuacionMaxima };
    return this.listarCalificaciones(filtro);
  }
}
