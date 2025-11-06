// src/app/auth/forgot-password.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '@/services/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
  <div class="w-full max-w-md mx-auto p-5 card">
    <h2 class="text-2xl font-bold mb-3">Recuperar contraseña</h2>
    <p class="text-color-secondary mb-4">
      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
    </p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="font-semibold block mb-1">Email</label>
        <input pInputText type="email" formControlName="email" class="w-full"
               [ngClass]="{'p-invalid': invalid('email')}" placeholder="tucorreo@ejemplo.com" />
        <small class="text-red-500" *ngIf="invalid('email')">Correo inválido.</small>
      </div>

      <p-button type="submit" label="Enviar enlace" icon="pi pi-send"
                [disabled]="form.invalid || loading" [loading]="loading"></p-button>
    </form>

    <p-toast />
  </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(MessageService);

  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  invalid(c: string) {
    const ctrl = this.form.get(c)!;
    return ctrl.touched && ctrl.invalid;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const email = this.form.value.email as string;

    this.auth.forgotPassword(email)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Solicitud enviada',
            detail: 'Revisa tu correo para continuar.' });
          this.form.reset();
        },
        error: (err) => {
          const detail = err?.error?.message || err.message || 'No se pudo enviar el correo';
          this.toast.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }
}