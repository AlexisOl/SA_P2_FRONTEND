import { Routes } from '@angular/router';
import { CinesVistaGlobalComponent } from '@/Cine/cines-vista-global/cines-vista-global.component';
import { CategoriesCrudComponent } from './categoria/categoria';
import { MoviesListComponent } from './movie-list/movie-list';
import { MovieFormComponent } from './movie-form/movie-form';
//import {  MoviesCrudComponent } from './movie-form/movie-form';


export default [
  {path: 'categorias', component: CategoriesCrudComponent},
  {path: '', component: MoviesListComponent},
  {path: 'nueva', component: MovieFormComponent},
  {path: ':id/editar', component: MovieFormComponent},
  
] as Routes;
