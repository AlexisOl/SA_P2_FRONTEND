import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Movie, Page } from '@/interfaces/movie.interface';
import { environment } from 'src/environments/environment.development';

export interface PosterDto {
  id: string;
  url?: string; // puede venir como url/path/location
  path?: string;
  location?: string;
  activa: boolean;
  orden?: number;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.URL_GATEWAY}/api/v1`;

  list(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.BASE}/peliculas`);
  }

  getById(id: string) {
    return this.http.get<Movie>(
      `${this.BASE}/detalle-categoria/peliculas/${id}/categorias`,
    );
  }

  create(body: Partial<Movie>) {
    console.log(body);

    return this.http.post<Movie>(`${this.BASE}/peliculas`, body);
  }

  update(id: string, body: Partial<Movie>) {
    return this.http.put<Movie>(`${this.BASE}/peliculas/${id}`, body);
  }
  getCategorias() {
    return this.http.get<
      Array<{ id: string; nombre: string; activa: boolean }>
    >(`${this.BASE}/categorias`);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.BASE}/peliculas/${id}`);
  }

  activar(id: string) {
    return this.http.post<void>(`${this.BASE}/peliculas/${id}/activar`, {});
  }

  desactivar(id: string) {
    return this.http.post<void>(`${this.BASE}/peliculas/${id}/desactivar`, {});
  }

  getCategoriasDePelicula(peliculaId: string) {
    return this.http.get<Array<{ id: string; nombre: string }>>(
      `${this.BASE}/detalle-categoria/peliculas/${peliculaId}/categorias`,
    );
  }

  // categorías (detalle-categoria)
  listMovieCategories(movieId: string) {
    console.log('************* Categorias');

    return this.http.get<{ id: string; nombre: string; activa: boolean }[]>(
      `${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias`,
    );
  }
  attachCategory(movieId: string, categoriaId: string) {
    console.log('guardar----');

    console.log({ categoriaId });

    return this.http.post<void>(
      `${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias`,
      { categoriaId },
    );
  }
  detachCategory(movieId: string, categoriaId: string) {
    console.log('eliminar');
    console.log(categoriaId);

    return this.http.delete<void>(
      `${this.BASE}/detalle-categoria/peliculas/${movieId}/categorias/${categoriaId}`,
    );
  }

  deletePoster(posterId: string) {
    return this.http.delete<void>(`${this.BASE}/posters/${posterId}`);
  }

  //Nuevos poster
  getPostersByMovie(peliculaId: string) {
    return this.http.get<PosterDto[]>(
      `${this.BASE}/posters/peliculas/${peliculaId}/posters`,
    );
  }

  uploadPoster(peliculaId: string, file: File, orden = 1) {
    const fd = new FormData();
    fd.append('file', file);
    const params = new HttpParams().set('orden', String(orden));
    return this.http.post<any>(
      `${this.BASE}/posters/peliculas/${peliculaId}/posters`,
      fd,
      { params },
    );
  }

  activarPoster(posterId: string) {
    return this.http.post<void>(`${this.BASE}/posters/${posterId}/activar`, {});
  }

  desactivarPoster(posterId: string) {
    return this.http.post<void>(
      `${this.BASE}/posters/${posterId}/desactivar`,
      {},
    );
  }
}
