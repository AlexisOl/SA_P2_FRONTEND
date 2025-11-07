import { Routes } from '@angular/router';
import { Asientos } from '@/ventas/asientos/asientos';
import { VentaSnack } from '@/ventas/venta-snack/venta-snack';
import { VentaBoletos } from '@/ventas/venta-boletos/venta-boletos';
import { authGuard } from '@/guards/auth.guard';
import { roleMatchGuard } from '@/guards/role.guard';

export default [
  {
    path: 'asientos',
    component: Asientos,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] },
  },
  { path: 'snack', component: VentaSnack },
  { path: 'boletos', component: VentaBoletos },
] as Routes;
