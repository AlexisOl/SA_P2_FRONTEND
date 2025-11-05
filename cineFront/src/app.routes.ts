import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import {LandingComponent} from '@/pages/landing/components/landing/landing.component';
import { CategoriesCrudComponent } from '@/peliculas/categoria/categoria';

export const appRoutes: Routes = [

    { path:'', component: LandingComponent},
    {
        path: 'home',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'cine', loadChildren: () => import('./app/Cine/cine.routes') },
            { path: 'promocion', loadChildren: () => import('./app/promocion/promocion.route') },
            { path: 'calificacion', loadChildren: () => import('./app/calificaciones/calificacion.route') },
        ]
    },
    {
        path: 'peliculas',
        component: AppLayout,
        children: [
            //{ path: '', component: Dashboard },
            //{ path: '', component: CategoriesCrudComponent },
            { path: '', loadChildren: () => import('./app/peliculas/peliculas.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'cine', loadChildren: () => import('./app/Cine/cine.routes') },
        ]
    },



    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' },

];
