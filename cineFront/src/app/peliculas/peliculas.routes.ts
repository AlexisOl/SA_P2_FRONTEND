import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { CategoriesCrudComponent } from './categoria/categoria';
//import { MoviesListComponent } from './movie-list/movie-list';
import { MovieFormComponent } from './movie-form/movie-form';
import { MoviesCrudComponent } from './movies-crud/movies-crud';
import { HorariosPageComponent } from './horario-page/horario-page';
import { HorariosGestionComponent } from './horarios-gestion/horarios-gestion';
import { MoviesListComponent } from './movie-list/movie-list';
import { MovieDetailComponent } from './movie-detail/movie-detail';
import { authGuard } from '@/guards/auth.guard';
import { roleMatchGuard } from '@/guards/role.guard';
//import { MoviesListComponent } from './movie-list/movie-list';
//import { HorariosAdminComponent } from './horario-admin/horario-admin';
//import {  MoviesCrudComponent } from './movie-form/movie-form';

export default [
  { path: 'categorias', component: CategoriesCrudComponent },
  {
    path: '',
    component: MoviesCrudComponent, 
    pathMatch: 'full', 
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] }
    // Gestión de películas
  }, //gestion de peliculas admin

  {
    path: 'listado',
    component: MoviesListComponent,
  },
  { path: 'horarios', component: HorariosGestionComponent,
    canMatch: [authGuard, roleMatchGuard],
    data: { roles: ['ADMIN'] } },
  { path: ':id', component: MovieDetailComponent },
] as Routes;
