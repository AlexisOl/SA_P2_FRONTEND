import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { ReportePeliculasPorSalaComponent } from './reporte-peliculas-por-sala/reporte-peliculas-por-sala';


export default [
  //{path: '', component: CategoriesCrudComponent},
  {path: 'reportes-peliculas-sala', component: ReportePeliculasPorSalaComponent},
  //{path: 'nueva', component: MovieFormComponent},
  //{path: ':id/editar', component: MovieFormComponent},
  //{ path: ':peliculaId/horarios', component: HorariosPageComponent },
  

  
] as Routes;
