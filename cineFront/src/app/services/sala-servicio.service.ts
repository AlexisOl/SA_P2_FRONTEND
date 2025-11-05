import { sala } from '@/models/Cine';
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SalaServicio {
  
  readonly URL = environment.URL_GATEWAY+"/salas";

  public cinesSignal =  signal<sala[]>([])



  constructor(private http: HttpClient) {

   }


     public listarSalaaEspecifica(cine:String):Observable<sala[]> {
    return  this.http.get<sala[]>(
      this.URL+'/'+cine
    )
    
  }
    listarSalasId(id: String) {
    return this.http.get(
      this.URL+"/cine/"+id
    )}


     public crearSalaHotel(sala: any):Observable<sala> {
      return  this.http.post<sala>(
        this.URL, sala
      )
    }

 cambiarVisibilidad(id: String){
     return this.http.put(this.URL+"/visible/"+id,{})
 
   }
   cambiarVisibilidadComentarios(id: String){
     return this.http.put(this.URL+"/comentarios/"+id, {})
 
   }
   
   cambiarVisibilidadCalificaciones( id: String){
     return this.http.put(this.URL+"/calificaicones/"+id,{})
 
   }


}
