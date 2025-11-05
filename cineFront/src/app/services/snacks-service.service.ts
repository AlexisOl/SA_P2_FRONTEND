import { cine, snacks } from '@/models/Cine';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SnacksService {
  
  readonly URL = environment.URL_GATEWAY+"/snacks";




  constructor(private http: HttpClient) {
   }




     public listarSalaaEspecifica(cine:String):Observable<snacks[]> {
    return  this.http.get<snacks[]>(
      this.URL+'/'+cine
    )
    
  }
    listarSnacksId(id: String) {
    return this.http.get(
      this.URL+"/cine/"+id
    )}


     public crearSnackHotel(sala: any):Observable<snacks> {
      return  this.http.post<snacks>(
        this.URL, sala
      )
    }

}
