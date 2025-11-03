import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Movie {
  id: string;
  titulo: string;
  sinopsis: string;
  duracion: number;
  posters: string[];      // URLs
  cast: string[];
  director: string;
  clasificacion: string;  // A, B12, etc.
  activa: boolean;
  fechaEstreno: string;   // YYYY-MM-DD
}

export interface Page<T> {
  content: T[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly BASE = 'http://localhost:8082/api/v1'; // o `${environment.apiUrl}/api/v1/peliculas`

  list(page = 0, size = 10, search = '', sort = 'createdAt,desc'): Observable<Page<Movie>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.BASE}/peliculas`, { params }).pipe(
      map(res => {
        // Fallback si el backend devuelve arreglo plano sin paginar
        console.log('Listando...------------');
        
        if (Array.isArray(res)) {
          const start = page * size;
          const sliced = res.slice(start, start + size);
          return { content: sliced as Movie[], totalElements: res.length } as Page<Movie>;
        }
        // Caso paginado esperado: { content, totalElements, ... }
        return res as Page<Movie>;
      })
    );
  }

  getById(id: string) {
    return this.http.get<Movie>(`${this.BASE}/detalle-categoria/peliculas/${id}/categorias`);
  }

  create(body: Partial<Movie>) {
    console.log(body);
    
    return this.http.post<Movie>(`${this.BASE}/peliculas`, body);
  }

  update(id: string, body: Partial<Movie>) {
    return this.http.put<Movie>(`${this.BASE}/peliculas/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.BASE}/peliculas/${id}`);
  }

  activar(id: string) {
    return this.http.post<void>(`${this.BASE}/${id}/peliculas/activar`, {});
  }

  desactivar(id: string) {
    return this.http.post<void>(`${this.BASE}/${id}/desactivar`, {});
  }


  // categorías (detalle-categoria)
  listMovieCategories(movieId: string) {
    console.log('************* Categorias');
    
    return this.http.get<{ id: string; nombre: string; activa: boolean; }[]>(
      `${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias`
    );
  }
  attachCategory(movieId: string, categoriaId: string) {
    console.log('guardar----');
    
    console.log({categoriaId});
    
    return this.http.post<void>(`${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias`, { categoriaId });
  }
  detachCategory(movieId: string, categoriaId: string) {
    console.log('eliminar');
    console.log(categoriaId);
    
    return this.http.delete<void>(`${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias/${categoriaId}`);
  }

  // posters
  listPosters(movieId: string) {
    return this.http.get<{ id: string; url: string; activa: boolean; orden: number; }[]>(
      `${this.BASE}/posters/peliculas/${movieId}/posters`
    );
  }
  uploadPoster(movieId: string, file: File, orden = 1) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: string; url: string }>(
      `${this.BASE}/posters/peliculas/${movieId}/posters`,
      form,
      { params: new HttpParams().set('orden', orden) }
    );
  }
  activatePoster(posterId: string) { return this.http.post<void>(`/api/v1/posters/${posterId}/activar`, {}); }
  deactivatePoster(posterId: string) { return this.http.post<void>(`/api/v1/posters/${posterId}/desactivar`, {}); }
  deletePoster(posterId: string) { return this.http.delete<void>(`/api/v1/posters/${posterId}`); }
}