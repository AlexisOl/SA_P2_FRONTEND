import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { ReportePeliculasPorSalaComponent } from './reporte-peliculas-por-sala/reporte-peliculas-por-sala';
import { ReporteTopSalasGustadasComponent } from './reporte-top-salas-gustadas/reporte-top-salas-gustadas';
import { IngresosAnuncios } from './ingresos-anuncios/ingresos-anuncios';


export default [
  //{path: '', component: CategoriesCrudComponent},
  {path: 'reportes-peliculas-sala', component: ReportePeliculasPorSalaComponent},
  {path: 'reportes-top-salas', component: ReporteTopSalasGustadasComponent},
  {path: 'reportes-anuncios', component: IngresosAnuncios},

  
] as Routes;
