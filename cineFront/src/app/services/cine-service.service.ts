import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { cine } from '../models/Cine';

@Injectable({
  providedIn: 'root'
})
export class CineServiceService {


  readonly URL = environment.URL_GATEWAY+"/cine";

  public cinesSignal =  signal<cine[]>([])



  constructor(private http: HttpClient) {
    this.obtenerHoteles()
   }



  obtenerHoteles() {
    return this.http.get<cine[]>(
      this.URL
    ).subscribe(
      (next:any) => {
        console.log(next);
        
        this.cinesSignal.set(next)
      },
      (error:any) => {
        console.log(error);
        
      }
    )
  }

  crearHotel(nuevoCine: cine){
    return this.http.post(this.URL, nuevoCine)
  }

  editarHotel(ediarcine:cine, id: String|undefined){
    return this.http.put(this.URL+"/"+id, ediarcine)

  }

  obtenerHotelEspecifico(id:string){
        return this.http.get<cine>(
      this.URL+"/"+id
    ).subscribe(
      (next:any) => {
        console.log(next);
        
        this.cinesSignal.set(next)
      },
      (error:any) => {
        console.log(error);
        
      }
    )
  }
}
