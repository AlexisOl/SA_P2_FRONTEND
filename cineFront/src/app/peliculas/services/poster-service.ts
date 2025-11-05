import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class PosterService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.URL_GATEWAY}/api/v1`;

  listPosters(movieId: string) {
    return this.http.get<
      { id: string; url: string; activa: boolean; orden: number }[]
    >(`${this.BASE}/posters/peliculas/${movieId}/posters`);
  }
  uploadPoster(movieId: string, file: File, orden = 1) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: string; url: string }>(
      `${this.BASE}/posters/peliculas/${movieId}/posters`,
      form,
      { params: new HttpParams().set('orden', orden) },
    );
  }
  activatePoster(posterId: string) {
    return this.http.post<void>(`${this.BASE}/posters/${posterId}/activar`, {});
  }
  deactivatePoster(posterId: string) {
    return this.http.post<void>(`${this.BASE}/posters/${posterId}/desactivar`, {});
  }
  deletePoster(posterId: string) {
    return this.http.delete<void>(`${this.BASE}/posters/${posterId}`);
  }
}
