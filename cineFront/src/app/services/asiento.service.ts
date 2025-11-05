import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {environment} from '../../environments/environment';
import {CrearAsientoDTO, ResponseAsientoDTO} from '@/models/asiento.model';

const baseUrl = environment.URL_GATEWAY + '/api/ventas/asientos';

@Injectable({
  providedIn: 'root'
})
export class AsientoService {

  constructor(
    private http: HttpClient
  ) { }

  crearAsiento(asiento: CrearAsientoDTO): Observable<ResponseAsientoDTO> {
    return this.http.post<ResponseAsientoDTO>(`${baseUrl}`, asiento).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  listarAsientosPorSala(salaId: string): Observable<ResponseAsientoDTO[]> {
    return this.http.get<ResponseAsientoDTO[]>(`${baseUrl}/sala/${salaId}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  obtenerAsiento(id: string): Observable<ResponseAsientoDTO> {
    return this.http.get<ResponseAsientoDTO>(`${baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}
