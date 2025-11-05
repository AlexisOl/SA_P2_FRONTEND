import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { PosterDto } from './movie.service';
@Injectable({
  providedIn: 'root',
})
export class PosterService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.URL_GATEWAY}/api/v1`;

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
