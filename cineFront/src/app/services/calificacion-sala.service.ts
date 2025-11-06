import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {
  CrearCalificacionSalaDTO,
  FiltroCalificacionSalaDTO, PromedioCalificacionSalaResponse,
  ResponseCalificacionSalaDTO
} from '@/models/calificacion-sala.model';

const baseUrl = environment.URL_GATEWAY + '/api/calificaciones/salas';

@Injectable({
  providedIn: 'root'
})
export class CalificacionSalaService {

  constructor(
    private http: HttpClient
  ) { }


  crearCalificacion(calificacion: CrearCalificacionSalaDTO): Observable<ResponseCalificacionSalaDTO> {
    return this.http.post<ResponseCalificacionSalaDTO>(`${baseUrl}`, calificacion).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  listarCalificaciones(filtro?: FiltroCalificacionSalaDTO): Observable<ResponseCalificacionSalaDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.usuarioId) {
        params = params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.salaId) {
        params = params.set('salaId', filtro.salaId);
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

    return this.http.get<ResponseCalificacionSalaDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerCalificacion(id: string): Observable<ResponseCalificacionSalaDTO> {
    return this.http.get<ResponseCalificacionSalaDTO>(`${baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerPromedioCalificacion(salaId: string): Observable<PromedioCalificacionSalaResponse> {
    return this.http.get<PromedioCalificacionSalaResponse>(`${baseUrl}/promedio/${salaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarCalificacionesPorUsuario(usuarioId: string): Observable<ResponseCalificacionSalaDTO[]> {
    const filtro: FiltroCalificacionSalaDTO = { usuarioId };
    return this.listarCalificaciones(filtro);
  }


  listarCalificacionesPorSala(salaId: string): Observable<ResponseCalificacionSalaDTO[]> {
    const filtro: FiltroCalificacionSalaDTO = { salaId };
    return this.listarCalificaciones(filtro);
  }


  listarCalificacionesPorRango(puntuacionMinima: number, puntuacionMaxima: number): Observable<ResponseCalificacionSalaDTO[]> {
    const filtro: FiltroCalificacionSalaDTO = { puntuacionMinima, puntuacionMaxima };
    return this.listarCalificaciones(filtro);
  }


    listarCalificacionesPorRangoFecha(fechaInicio: string, fechaFin: string): Observable<ResponseCalificacionSalaDTO[]> {
    const filtro: FiltroCalificacionSalaDTO = { fechaInicio, fechaFin };
    return this.listarCalificaciones(filtro);
  }
}
