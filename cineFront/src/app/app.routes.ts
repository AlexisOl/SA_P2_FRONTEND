import { Routes } from '@angular/router';

export const routes: Routes = [

    
    {path: 'login', loadChildren: () => import('./Auth/auth.routes').then(a => a.authRoutes)},

    {path: 'cine', loadChildren: () => import('./Cine/cine.routes').then(c => c.cineRoutes),
       //  canActivate: [empleadoGuard]
    },

    
    { path: '**',redirectTo: 'login', pathMatch:'full'},

];
