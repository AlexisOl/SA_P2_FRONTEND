import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {CrearPromocionDTO, EditarPromocionDTO, FiltroPromocionDTO, ResponsePromocionDTO} from '@/models/promocion';

const baseUrl = environment.URL_GATEWAY + '/api/promociones/promociones';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {

  constructor(private http: HttpClient) { }

  /**
   * Crear una nueva promoción
   */
  crearPromocion(dto: CrearPromocionDTO): Observable<ResponsePromocionDTO> {
    return this.http.post<ResponsePromocionDTO>(`${baseUrl}`, dto).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Editar una promoción existente
   */
  editarPromocion(promocionId: string, dto: EditarPromocionDTO): Observable<ResponsePromocionDTO> {
    return this.http.put<ResponsePromocionDTO>(`${baseUrl}/${promocionId}`, dto).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Activar una promoción
   */
  activarPromocion(promocionId: string): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${promocionId}/activar`, null).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Desactivar una promoción
   */
  desactivarPromocion(promocionId: string): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${promocionId}/desactivar`, null).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Listar promociones con filtros opcionales
   */
  listarPromociones(filtro?: FiltroPromocionDTO): Observable<ResponsePromocionDTO[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.cineId) params = params.set('cineId', filtro.cineId);
      if (filtro.salaId) params = params.set('salaId', filtro.salaId);
      if (filtro.peliculaId) params = params.set('peliculaId', filtro.peliculaId);
      if (filtro.clienteId) params = params.set('clienteId', filtro.clienteId);
      if (filtro.tipo) params = params.set('tipo', filtro.tipo);
      if (filtro.activa !== undefined && filtro.activa !== null) {
        params = params.set('activa', filtro.activa.toString());
      }
      if (filtro.fecha) params = params.set('fecha', filtro.fecha);
    }

    return this.http.get<ResponsePromocionDTO[]>(`${baseUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Obtener una promoción por ID
   */
  obtenerPromocionPorId(promocionId: string): Observable<ResponsePromocionDTO> {
    return this.http.get<ResponsePromocionDTO>(`${baseUrl}/${promocionId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  /**
   * Obtener la mejor promoción según filtros
   */
  obtenerMejorPromocion(filtro?: Partial<FiltroPromocionDTO>): Observable<ResponsePromocionDTO | null> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.cineId) params = params.set('cineId', filtro.cineId);
      if (filtro.salaId) params = params.set('salaId', filtro.salaId);
      if (filtro.peliculaId) params = params.set('peliculaId', filtro.peliculaId);
      if (filtro.clienteId) params = params.set('clienteId', filtro.clienteId);
      if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    }

    return this.http.get<ResponsePromocionDTO>(`${baseUrl}/mejor`, { params }).pipe(
      map(response => response || null),
      catchError((error: HttpErrorResponse) => {
        // Si es 204 No Content, devolver null
        if (error.status === 204) {
          return [null];
        }
        return throwError(() => error);
      })
    );
  }
}
