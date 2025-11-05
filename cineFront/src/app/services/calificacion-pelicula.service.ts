import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {
  CrearCalificacionPeliculaDTO,
  FiltroCalificacionPeliculaDTO, PromedioCalificacionResponse,
  ResponseCalificacionPeliculaDTO
} from '@/models/calificacion-pelicula.model';

const baseUrl = environment.URL_GATEWAY + '/api/calificaciones/peliculas';

@Injectable({
  providedIn: 'root'
})
export class CalificacionPeliculaService {

  constructor(
    private http: HttpClient
  ) { }


  crearCalificacion(calificacion: CrearCalificacionPeliculaDTO): Observable<ResponseCalificacionPeliculaDTO> {
    return this.http.post<ResponseCalificacionPeliculaDTO>(`${baseUrl}`, calificacion).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarCalificaciones(filtro?: FiltroCalificacionPeliculaDTO): Observable<ResponseCalificacionPeliculaDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.usuarioId) {
        params = params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.peliculaId) {
        params = params.set('peliculaId', filtro.peliculaId);
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

    return this.http.get<ResponseCalificacionPeliculaDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerCalificacion(id: string): Observable<ResponseCalificacionPeliculaDTO> {
    return this.http.get<ResponseCalificacionPeliculaDTO>(`${baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerPromedioCalificacion(peliculaId: string): Observable<PromedioCalificacionResponse> {
    return this.http.get<PromedioCalificacionResponse>(`${baseUrl}/promedio/${peliculaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarCalificacionesPorUsuario(usuarioId: string): Observable<ResponseCalificacionPeliculaDTO[]> {
    const filtro: FiltroCalificacionPeliculaDTO = { usuarioId };
    return this.listarCalificaciones(filtro);
  }


  listarCalificacionesPorPelicula(peliculaId: string): Observable<ResponseCalificacionPeliculaDTO[]> {
    const filtro: FiltroCalificacionPeliculaDTO = { peliculaId };
    return this.listarCalificaciones(filtro);
  }

  listarCalificacionesPorRango(puntuacionMinima: number, puntuacionMaxima: number): Observable<ResponseCalificacionPeliculaDTO[]> {
    const filtro: FiltroCalificacionPeliculaDTO = { puntuacionMinima, puntuacionMaxima };
    return this.listarCalificaciones(filtro);
  }
}
