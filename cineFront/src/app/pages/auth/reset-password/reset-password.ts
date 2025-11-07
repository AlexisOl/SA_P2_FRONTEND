// src/app/pages/auth/reset-password/reset-password.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '@/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="w-full max-w-md mx-auto p-6">
      <h2 class="text-2xl font-bold mb-3">Restablecer contraseña</h2>
      <p class="text-color-secondary mb-4">
        Ingresa tu nueva contraseña para completar el proceso.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Nueva contraseña -->
        <div>
          <label class="font-semibold block mb-1">Nueva contraseña</label>
          <div class="relative">
            <input
              pInputText
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              class="w-full pr-10"
            />
            <i
              class="pi cursor-pointer text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
              [ngClass]="showPassword ? 'pi-eye-slash' : 'pi-eye'"
              (click)="showPassword = !showPassword"
            ></i>
          </div>
        </div>

        <!-- Confirmar contraseña -->
        <div>
          <label class="font-semibold block mb-1">Confirmar contraseña</label>
          <div class="relative">
            <input
              pInputText
              [type]="showConfirm ? 'text' : 'password'"
              formControlName="confirm"
              class="w-full pr-10"
            />
            <i
              class="pi cursor-pointer text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
              [ngClass]="showConfirm ? 'pi-eye-slash' : 'pi-eye'"
              (click)="showConfirm = !showConfirm"
            ></i>
          </div>
        </div>

        <p-button
          type="submit"
          label="Actualizar contraseña"
          icon="pi pi-check"
          [disabled]="form.invalid || loading || !token"
        ></p-button>
      </form>

      <p-toast></p-toast>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);

  token = '';
  loading = false;

  showPassword = false;
  showConfirm = false;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token') || '';
      console.log('Token actual desde URL:', this.token);
      this.form.reset();
      this.showPassword = false;
      this.showConfirm = false;
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirm } = this.form.value;
    if (password !== confirm) {
      this.toast.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Las contraseñas no coinciden',
      });
      return;
    }

    this.loading = true;
    console.log('token a enviar:', this.token);

    this.auth.resetPassword(this.token, password!).subscribe({
      next: () => {
        this.loading = false;
        this.toast.add({
          severity: 'success',
          summary: 'Contraseña actualizada',
          detail: 'Ahora puedes iniciar sesión con tu nueva contraseña',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Token inválido o expirado',
        });
      },
    });
  }
}