import { Routes } from '@angular/router';
import {CalificacionPelicula} from '@/calificaciones/calificacion-pelicula/calificacion-pelicula';
import {CalificacionSala} from '@/calificaciones/calificacion-sala/calificacion-sala';
import {CalificacionSnack} from '@/calificaciones/calificacion-snack/calificacion-snack';


export default [
  {path: 'pelicula', component: CalificacionPelicula},
  {path: 'sala', component: CalificacionSala},
  {path: 'snack', component: CalificacionSnack},
] as Routes;
