import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { SalasGlobal } from '@/Salas/salas-global/salas-global';
import { Snacks } from './snacks/snacks';


export default [
  {path: '', component: CinesVistaGlobalComponent},
  // vista especifica de las salas
  {path: ':id', component: SalasGlobal},
  {path: ':id/snacks', component: Snacks},


] as Routes;
