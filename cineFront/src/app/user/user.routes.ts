import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { ProfileComponent } from './profile/profile';
import { RegisterComponent } from './register/register';
import { authGuard } from '@/guards/auth.guard';
import { roleMatchGuard } from '@/guards/role.guard';

//import { HorariosAdminComponent } from './horario-admin/horario-admin';
//import {  MoviesCrudComponent } from './movie-form/movie-form';

export default [
  { path: 'perfil', component: ProfileComponent },
  //{ path: 'horarios', component: HorariosPageComponent },
  {
    path: 'register',
    component: RegisterComponent,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] },
  },
] as Routes;
