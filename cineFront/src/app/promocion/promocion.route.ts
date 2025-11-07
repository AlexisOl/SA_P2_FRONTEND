import { Routes } from '@angular/router';
import { Promociones } from '@/promocion/promociones/promociones';
import { authGuard } from '@/guards/auth.guard';
import { roleMatchGuard } from '@/guards/role.guard';

export default [
  {
    path: '',
    component: Promociones,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] },
  },
] as Routes;
