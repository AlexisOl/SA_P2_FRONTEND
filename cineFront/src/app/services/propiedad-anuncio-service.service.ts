import { PropiedadAnuncio } from '@/models/Anuncios';
import { bloqueoAnuncio, snacks } from '@/models/Cine';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PropiedadAnuncioServiceService {
  
    readonly URL = environment.URL_GATEWAY+"/propiedadAnuncio";




  constructor(private http: HttpClient) {
   }




     public listarSalaaEspecifica(cine:String):Observable<PropiedadAnuncio[]> {
    return  this.http.get<PropiedadAnuncio[]>(
      this.URL+'/'+cine
    )
    
  }


    public generarBloqueo(sala: any):Observable<any> {
      return  this.http.post<any>(
        this.URL+"/GenerarBloqueo", sala
      )
    }

    listarAnunciosFecha(fechaInicio: String, fechaFin: String) {
    return this.http.get(
      this.URL+"/anunciosActualesMaterial/"+fechaInicio+"/"+fechaFin
    )}


     public crearPropiedad(sala: any):Observable<PropiedadAnuncio> {
      return  this.http.post<PropiedadAnuncio>(
        this.URL, sala
      )
    }

         public crearBloqueoCine(sala: any):Observable<bloqueoAnuncio> {
          return  this.http.post<bloqueoAnuncio>(
            this.URL+"/GenerarBloqueo", sala
          )
        }
}
