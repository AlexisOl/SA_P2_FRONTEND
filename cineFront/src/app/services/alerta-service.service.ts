import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertaServiceService {
  
  generacionAlerta(titulo:string, texto: string, icono: 'success' | 'error' | 'warning' | 'info' | 'question'){
      return Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: 'cerrar'
      })
  }
}
