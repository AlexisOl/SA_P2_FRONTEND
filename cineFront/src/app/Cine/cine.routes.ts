import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { SalasGlobal } from '@/Salas/salas-global/salas-global';
import { Snacks } from './snacks/snacks';
import { authGuard } from '@/guards/auth.guard';
import { roleMatchGuard } from '@/guards/role.guard';

export default [
  {
    path: '',
    component: CinesVistaGlobalComponent,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] },
  },
  // vista especifica de las salas
  {
    path: ':id',
    component: SalasGlobal,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] },
  },
  { path: ':id/snacks', component: Snacks },
] as Routes;
