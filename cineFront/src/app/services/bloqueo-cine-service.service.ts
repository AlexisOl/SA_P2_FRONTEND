import { bloqueoAnuncio, snacks } from '@/models/Cine';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BloqueoCineServiceService {
  

    readonly URL = environment.URL_GATEWAY+"/bloqueoAnuncios";




  constructor(private http: HttpClient) {
   }




     public listarSalaaEspecifica(cine:String):Observable<bloqueoAnuncio[]> {
    return  this.http.get<bloqueoAnuncio[]>(
      this.URL+'/'+cine
    )
    
  }


    public verBloqueoActualCine(id: String) {
    return this.http.get(
      this.URL+"/verBloqueoActual/"+id
    )}


     public crearBloqueoCine(sala: any):Observable<bloqueoAnuncio> {
      return  this.http.post<bloqueoAnuncio>(
        this.URL, sala
      )
    }
}
