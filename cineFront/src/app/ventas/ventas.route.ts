import { Routes } from '@angular/router';
import {Asientos} from '@/ventas/asientos/asientos';
import {VentaSnack} from '@/ventas/venta-snack/venta-snack';
import {VentaBoletos} from '@/ventas/venta-boletos/venta-boletos';


export default [
  {path: 'asientos', component: Asientos},
  {path: 'snack', component: VentaSnack},
  {path: 'boletos', component: VentaBoletos}
] as Routes;
