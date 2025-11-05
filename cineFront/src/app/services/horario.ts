import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

export interface Horario {
  id: string;
  peliculaId: string;
  cinemaId: string;
  salaId: string;
  idioma: string;
  formato: string;
  inicio: string;   // ISO
  fin: string;      // ISO
  precio: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HorarioCreate {
  peliculaId: string;
  cinemaId: string;
  salaId: string;
  idioma: string;
  formato: string;
  inicio: string; // ISO
  fin: string;    // ISO
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private base = `${environment.URL_GATEWAY}/api/v1/horarios`;
  constructor(private http: HttpClient) {}

  list(opts: { peliculaId?: string; cinemaId?: string; desde?: string; hasta?: string; soloActivos?: boolean }): Observable<Horario[]> {
    let params = new HttpParams();
    if (opts.peliculaId) params = params.set('peliculaId', opts.peliculaId);
    if (opts.cinemaId)  params = params.set('cinemaId',  opts.cinemaId);
    if (opts.desde)     params = params.set('desde',     opts.desde);
    if (opts.hasta)     params = params.set('hasta',     opts.hasta);
    if (opts.soloActivos !== undefined) params = params.set('soloActivos', String(opts.soloActivos));
    //params = params.set('soloActivos', String(opts.soloActivos ?? false));
    console.log(params.toString);
    
    return this.http.get<Horario[]>(this.base, { params });
  }

  create(body: HorarioCreate) {
    return this.http.post<Horario>(this.base, body);
  }

  update(id: string, body: Partial<HorarioCreate> & { activo?: boolean }) {
    console.log('update');
    console.log(body);
    
    
    return this.http.put<Horario>(`${this.base}/${id}`, body);
  }

  desactivar(id: string) {
    return this.http.post<void>(`${this.base}/${id}/desactivar`, {});
  }
}