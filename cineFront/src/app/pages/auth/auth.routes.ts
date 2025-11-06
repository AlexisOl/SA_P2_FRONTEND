import { Routes } from '@angular/router';
import { Access } from './access';
//import { Login } from './login';
import { Error } from './error';
import { LoginComponent } from './login';
import { RegisterClientesComponent } from './register-clientes/register-clientes';
import { RegisterComponent } from '../../user/register/register';
import { ProfileComponent } from '../../user/profile/profile';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent },
    { path: 'register-cliente', component: RegisterClientesComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'perfil', component: ProfileComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

] as Routes;
