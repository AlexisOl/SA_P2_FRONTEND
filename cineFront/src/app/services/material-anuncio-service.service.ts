import { anuncios } from '@/models/Anuncios';
import { snacks } from '@/models/Cine';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MaterialAnuncioServiceService {
  
    readonly URL = environment.URL_GATEWAY+"/materialAnuncio";




  constructor(private http: HttpClient) {
   }




  public listarAnuncioEspecifico(id:String):Observable<any[]> {
    return  this.http.get<any[]>(
      this.URL+'/'+id
    )
    
  }
    listarAnunciosGlobales() {
    return this.http.get(
      this.URL
    )}


crearAnuncio(
    dto: anuncios,
    texto?: string,
    imagen?: File,
    video?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('crearAnuncioDTO', new Blob([JSON.stringify(dto)], {
      type: 'application/json'
    }));

    if (texto) {
      formData.append('texto', texto);
    }
    if (imagen) {
      formData.append('linkimagen', imagen, imagen.name);
    }
    if (video) {
      formData.append('linkvideo', video, video.name);
    }

    return this.http.post(this.URL, formData);
  }
}
