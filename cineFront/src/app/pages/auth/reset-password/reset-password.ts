// src/app/auth/reset-password.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '@/services/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
  <div class="w-full max-w-md mx-auto p-5 card">
    <h2 class="text-2xl font-bold mb-3">Restablecer contraseña</h2>
    <p class="text-color-secondary mb-4">
      Ingresa tu nueva contraseña. El enlace incluye tu token automáticamente.
    </p>

    <ng-container *ngIf="token; else noToken">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
  <div>
    <label class="font-semibold block mb-1">Nueva contraseña</label>
    <p-password formControlName="newPassword"
                class="w-full"
                [toggleMask]="true"
                [feedback]="false"
                [ngClass]="{'p-invalid': invalid('newPassword')}" />
    <small class="text-color-secondary block">
      Mín 8, con mayúscula, minúscula, número y símbolo.
    </small>
    <small class="text-red-500" *ngIf="invalid('newPassword')">
      No cumple los requisitos.
    </small>
  </div>

  <div>
    <label class="font-semibold block mb-1">Confirmar contraseña</label>
    <p-password formControlName="confirm"
                class="w-full"
                [toggleMask]="true"
                [feedback]="false"
                [ngClass]="{'p-invalid': invalid('confirm')}" />
    <small class="text-red-500" *ngIf="invalid('confirm')">
      Las contraseñas no coinciden.
    </small>
  </div>

  <p-button type="submit" label="Restablecer" icon="pi pi-check"
            [disabled]="form.invalid || loading"
            [loading]="loading"></p-button>
</form>
    </ng-container>

    <ng-template #noToken>
      <div class="surface-100 rounded-md p-4">
        <p class="text-red-500 font-medium mb-2">Token no presente en la URL.</p>
        <p class="text-color-secondary">
          Abre el enlace del correo o vuelve a solicitar el restablecimiento.
        </p>
      </div>
    </ng-template>

    <p-toast />
  </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(MessageService);

  token: string | null = null;
  loading = false;

  form = this.fb.group({
    newPassword: ['', [Validators.required, this.passwordStrong]],
    confirm: ['', [Validators.required]]
  }, { validators: [this.matchPasswords] });

  ngOnInit(): void {
    // Token desde el path param: /auth/reset-password/:token
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      // mensaje de ayuda
      this.toast.add({ severity: 'error', summary: 'Token faltante',
        detail: 'El enlace no contiene token. Abre el link desde tu correo.' });
    }
  }

  invalid(ctrl: string) {
    const c = this.form.get(ctrl)!;
    return (c.touched && c.invalid) || (ctrl === 'confirm' && this.form.errors?.['mismatch'] && c.touched);
  }

  private passwordStrong(control: AbstractControl): ValidationErrors | null {
    const v = (control.value || '') as string;
    const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
    return ok ? null : { weak: true };
  }

  private matchPasswords(group: AbstractControl): ValidationErrors | null {
    const p1 = group.get('newPassword')?.value;
    const p2 = group.get('confirm')?.value;
    return p1 && p2 && p1 === p2 ? null : { mismatch: true };
  }

  submit() {
    if (!this.token) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const { newPassword } = this.form.value as { newPassword: string; };

    this.auth.resetPassword(this.token, newPassword)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Contraseña actualizada',
            detail: 'Ya puedes iniciar sesión con tu nueva contraseña.' });
          this.form.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const detail = err?.error?.message || err.message || 'No se pudo restablecer';
          this.toast.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }
}