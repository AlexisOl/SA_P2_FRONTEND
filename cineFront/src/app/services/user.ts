// src/app/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDTO } from '@/models/user.model';
//import { environment } from '@/enviroments/enviroment';



const BASE = environment.URL_GATEWAY+'/v1/users';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private http = inject(HttpClient);

    listar(
        opts: {
            q?: string;
            rol?: 'ADMIN' |'ADMIN_CINE'| 'CLIENTE' | 'EMPLEADO_CINE' | 'CLIENTE_ANUNCIOS';
            enabled?: boolean;
            page?: number;
            size?: number;
        } = {}
    ): Observable<UserDTO[]> {
        let params = new HttpParams();
        if (opts.q) params = params.set('q', opts.q);
        if (opts.rol) params = params.set('rol', opts.rol);
        if (typeof opts.enabled === 'boolean') params = params.set('enabled', String(opts.enabled));
        if (typeof opts.page === 'number') params = params.set('page', String(opts.page));
        if (typeof opts.size === 'number') params = params.set('size', String(opts.size));

        // El authInterceptor adjunta el Bearer automáticamente
        console.log(this.http.get<UserDTO[]>(BASE, { params }));
        const fullUrl = `${BASE}?${params.toString()}`;
  console.log('Llamando a:', fullUrl);
        
        return this.http.get<UserDTO[]>(BASE, { params });
    }

    detalle(id: string): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${BASE}/${id}`);
    }


    updatePartial(id: string, partial: Partial<UserDTO>) {
    return this.http.patch(`${BASE}/${id}`, partial, { observe: 'response' })
      .pipe(
        map((res: HttpResponse<any>) =>
          // si la API no devuelve body, regresamos la fusión local
          (res.body as UserDTO | null) ?? ({ id, ...partial } as UserDTO)
        ),
        catchError(() =>
          // fallback a PUT si tu endpoint es PUT
          this.http.put(`${BASE}/${id}`, partial, { observe: 'response' })
            .pipe(map((res: HttpResponse<any>) =>
              (res.body as UserDTO | null) ?? ({ id, ...partial } as UserDTO)
            ))
        )
      );
  }

  acreditarBanca(id: string, dto: { monto: number; motivo: string }) {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    return this.http
      .patch(`${BASE}/${id}/banca/acreditar`, dto, { observe: 'response' })
      .pipe(map((res: HttpResponse<any>) => res.status >= 200 && res.status < 300));
  }

  debitarBanca(id: string, dto: { monto: number; motivo: string }) {
    return this.http
      .patch(`${BASE}/${id}/banca/debitar`, dto, { observe: 'response' })
      .pipe(map((res: HttpResponse<any>) => res.status >= 200 && res.status < 300));
  }
}