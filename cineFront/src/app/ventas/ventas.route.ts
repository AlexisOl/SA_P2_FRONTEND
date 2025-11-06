import { Routes } from '@angular/router';
import {Asientos} from '@/ventas/asientos/asientos';
import {VentaSnack} from '@/ventas/venta-snack/venta-snack';


export default [
  {path: 'asientos', component: Asientos},
  {path: 'snack', component: VentaSnack}
] as Routes;
