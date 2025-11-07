import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
   readonly URL = environment.URL_GATEWAY+"/api/reportes";




  constructor(private http: HttpClient) {
   }


     public listarReporteCineAnunciosEspecifico(cine:String):Observable<any[]> {
    return  this.http.get<any[]>(
      this.URL+'/'+cine
    )
    
  }


}
