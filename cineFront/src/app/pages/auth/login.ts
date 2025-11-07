// src/app/pages/auth/login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
//import { AuthService } from '@/services/auth;
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@/services/auth';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    ToastModule,
    RouterModule,
  ],
  providers: [MessageService],
  templateUrl: './login.html',
})
export class LoginComponent {
  email = '';
  password = '';
  checked = false; // “remember me” (si quieres, úsalo luego para elegir storage)
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: MessageService,
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.toast.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Ingresa email y contraseña',
      });
      return;
    }
    console.log(this.password + this.email);

    this.loading = true;
    this.auth
      .loginAndLoadUser({ email: this.email, password: this.password })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (user) => {
          console.log('Usuario autenticado:', user);
          this.toast.add({
            key: 'login',
            severity: 'success',
            summary: 'Bienvenido',
            detail: 'Inicio de sesión correcto',
            life: 2500,
          });
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          const detalle =
            err?.error?.message ||
            (err.status === 0
              ? 'No se pudo conectar con el servidor'
              : err.status === 400
                ? 'Credenciales inválidas'
                : err.statusText || 'Error desconocido');

          this.toast.add({
            key: 'login',
            severity: 'error',
            summary: 'Error de inicio de sesión',
            detail: detalle,
            life: 3000,
          });
        },
      });
  }
}
