import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { SalasGlobal } from '@/Salas/salas-global/salas-global';
import { VistaAnuncios } from './vista-anuncios/vista-anuncios';


export default [
  {path: '', component: VistaAnuncios},


] as Routes;
