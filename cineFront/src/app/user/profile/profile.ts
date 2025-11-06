// src/app/pages/profile/profile.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '@/services/auth';
import { UsersService } from '@/services/user';
import { UserDTO } from '@/models/user.model';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsGT from '@angular/common/locales/es-GT';
import localeEsGTExtra from '@angular/common/locales/extra/es-GT';

// Registra los datos del locale
registerLocaleData(localeEsGT, 'es-GT', localeEsGTExtra);

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DatePipe,
    CardModule, InputTextModule, InputNumberModule, ButtonModule, TagModule, ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  styles: [`
    :host ::ng-deep {
      .profile-header-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none !important;
        overflow: hidden;
      }

      .profile-header-card .p-card-body {
        padding: 2rem;
      }

      .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: 4px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0 auto 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .info-box {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-radius: 12px;
        transition: all 0.3s ease;
      }

      .info-box:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
      }

      .info-box-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        opacity: 0.9;
      }

      .info-box-label {
        font-size: 0.875rem;
        opacity: 0.85;
        margin-bottom: 0.25rem;
      }

      .info-box-value {
        font-size: 1rem;
        font-weight: 600;
        word-break: break-all;
      }

      .balance-card {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        border: none !important;
        text-align: center;
      }

      .balance-card .p-card-body {
        padding: 2rem;
      }

      .balance-amount {
        font-size: 3rem;
        font-weight: bold;
        margin: 1rem 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .action-card {
        border-radius: 16px;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
      }

      .action-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .card-header-custom {
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
      }

      .card-header-custom h3 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .card-header-custom p {
        margin: 0.5rem 0 0 0;
        color: #6c757d;
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #495057;
      }

      .p-inputtext, .p-inputnumber input {
        border-radius: 8px;
        border: 2px solid #e9ecef;
        transition: all 0.3s ease;
      }

      .p-inputtext:focus, .p-inputnumber input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }

      .p-button {
        border-radius: 8px;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
      }

      .button-group {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .info-message {
        background: #e7f3ff;
        border-left: 4px solid #2196f3;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        gap: 0.75rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .balance-amount {
          font-size: 2rem;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          font-size: 2rem;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .button-group {
          flex-direction: column;
        }

        .button-group .p-button {
          width: 100%;
        }
      }
    }
  `],
  template: `
  <div class="max-w-7xl mx-auto p-3 md:p-6">

    <!-- Header principal -->
    <div class="mb-4">
      <h1 class="text-3xl md:text-4xl font-bold text-color mb-2">
        <i class="pi pi-user mr-2"></i>Mi Perfil
      </h1>
      <p class="text-color-secondary">Gestiona tu información personal y banca virtual</p>
    </div>

    <!-- Tarjeta de perfil con información general -->
    <p-card class="profile-header-card mb-4">
      <div class="text-center">
        <div class="user-avatar">{{ getInitials() }}</div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">{{ user()?.nombre || 'Usuario' }}</h2>
        <p-tag [value]="user()?.rol || 'CLIENTE'" [rounded]="true" severity="info"></p-tag>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <i class="pi pi-id-card info-box-icon"></i>
          <div class="info-box-label">ID de Usuario</div>
          <div class="info-box-value">{{ user()?.id || '—' }}</div>
        </div>

        <div class="info-box">
          <i class="pi pi-envelope info-box-icon"></i>
          <div class="info-box-label">Correo Electrónico</div>
          <div class="info-box-value">{{ user()?.email || '—' }}</div>
        </div>

        <div class="info-box">
          <i class="pi pi-credit-card info-box-icon"></i>
          <div class="info-box-label">DPI</div>
          <div class="info-box-value">{{ user()?.dpi || '—' }}</div>
        </div>

        <div class="info-box">
          <i class="pi pi-calendar info-box-icon"></i>
          <div class="info-box-label">Fecha de Registro</div>
          <div class="info-box-value">{{ user()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
        </div>

        <div class="info-box">
          <i class="pi pi-circle-fill info-box-icon"></i>
          <div class="info-box-label">Estado de Cuenta</div>
          <div class="mt-2">
            <p-tag [value]="user()?.enabled ? 'ACTIVA' : 'INACTIVA'"
                   [severity]="user()?.enabled ? 'success' : 'danger'"
                   [rounded]="true"/>
          </div>
        </div>
      </div>
    </p-card>

    <div class="grid" style="gap: 1.5rem;">

      <!-- Columna IZQ: Banca Virtual -->
      <div class="col-12 lg:col-6">
        <!-- Balance destacado -->
        <p-card class="balance-card mb-4">
          <i class="pi pi-wallet" style="font-size: 3rem;"></i>
          <h3 class="text-xl font-semibold mt-3 mb-0">Banca Virtual</h3>
          <div class="balance-amount">
            {{ (user()?.bancaVirtual ?? 0) | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}
          </div>
          <p class="text-sm opacity-90 m-0">Saldo disponible en tu cuenta</p>
        </p-card>

        <!-- Gestión de movimientos -->
        <p-card class="action-card">
          <div class="card-header-custom">
            <h3>
              <i class="pi pi-money-bill text-primary"></i>
              Movimientos
            </h3>
            <p>Acredita o debita fondos de tu cuenta</p>
          </div>

          <div class="p-4">
            <div class="form-field">
              <label class="form-label">
                <i class="pi pi-dollar"></i>
                Monto (GTQ)
              </label>
              <p-inputnumber class="w-full"
                             [useGrouping]="true"
                             mode="currency"
                             currency="GTQ"
                             locale="es-GT"
                             [min]="0.01"
                             placeholder="0.00"
                             [(ngModel)]="banca.monto" />
            </div>

            <div class="form-field">
              <label class="form-label">
                <i class="pi pi-comment"></i>
                Motivo del Movimiento
              </label>
              <input pInputText
                     class="w-full"
                     [(ngModel)]="banca.motivo"
                     placeholder="Ej: Depósito inicial, pago de servicio..." />
            </div>

            <div class="button-group mb-3">
              <p-button label="Acreditar"
                        icon="pi pi-plus-circle"
                        severity="success"
                        styleClass="flex-1"
                        [disabled]="!puedeMover() || loadingBanca"
                        [loading]="loadingBanca"
                        (onClick)="acreditar()" />
              <p-button label="Debitar"
                        icon="pi pi-minus-circle"
                        severity="danger"
                        styleClass="flex-1"
                        [disabled]="!puedeMover() || loadingBanca"
                        [loading]="loadingBanca"
                        (onClick)="debitar()" />
            </div>

            <div class="info-message">
              <i class="pi pi-info-circle text-primary"></i>
              <div class="text-sm">
                <strong>Nota:</strong> El monto debe ser mayor a 0 y debes incluir una descripción del movimiento.
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Columna DER: Datos personales -->
      <div class="col-12 lg:col-6">
        <p-card class="action-card">
          <div class="card-header-custom">
            <h3>
              <i class="pi pi-user-edit text-primary"></i>
              Datos Personales
            </h3>
            <p>Actualiza tu información personal</p>
          </div>

          <div class="p-4">
            <form [formGroup]="formNombre" (ngSubmit)="saveNombre()">
              <div class="form-field">
                <label class="form-label">
                  <i class="pi pi-user"></i>
                  Nombre Completo
                </label>
                <input pInputText
                       class="w-full mb-2"
                       formControlName="nombre"
                       placeholder="Ingresa tu nombre completo" />
                <small class="text-red-500 block"
                       *ngIf="formNombre.controls['nombre'].touched && formNombre.controls['nombre'].invalid">
                  <i class="pi pi-exclamation-circle mr-1"></i>
                  El nombre debe tener al menos 2 caracteres.
                </small>
              </div>

              <div class="button-group">
                <p-button type="submit"
                          label="Guardar Cambios"
                          icon="pi pi-check"
                          styleClass="w-full"
                          [disabled]="formNombre.invalid || savingNombre"
                          [loading]="savingNombre"/>
              </div>
            </form>
          </div>
        </p-card>
      </div>

    </div>

    <p-toast position="top-right"/>
  </div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private users = inject(UsersService);
  private fb = inject(FormBuilder);
  private toast = inject(MessageService);

  private _user = signal<UserDTO | null>(null);
  user = this._user.asReadonly();

  formNombre = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]]
  });
  savingNombre = false;

  banca = { monto: null as number | null, motivo: '' };
  loadingBanca = false;

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => {
      if (u) {
        this._user.set(u as any);
        this.formNombre.patchValue({ nombre: u.nombre || '' });
        console.log(u.bancaVirtual);
        
      }
    });
    this.refreshUser();
  }

  getInitials(): string {
    const nombre = this.user()?.nombre || this.user()?.email || 'U';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  private refreshUser() {
    this.auth.fetchAndCacheUser().subscribe(u => {
      if (u) {
        this._user.set(u as any);
        this.formNombre.patchValue({ nombre: u.nombre || '' });
      }
    });
  }

  saveNombre() {
    if (this.formNombre.invalid || !this.user() || this.savingNombre) return;
    const id = this.user()!.id;
    const nombre = (this.formNombre.value.nombre || '').trim();
    if (!nombre) return;

    this.savingNombre = true;
    this.users.updatePartial(id, { nombre }).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nombre actualizado correctamente',
          life: 3000
        });
        this.refreshUser();
        this.savingNombre = false;
      },
      error: (err) => {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'No se pudo actualizar el nombre',
          life: 4000
        });
        this.savingNombre = false;
      }
    });
  }

  puedeMover() {
    return !!this.user() &&
           !!this.banca.monto &&
           this.banca.monto > 0 &&
           !!(this.banca.motivo || '').trim();
  }

  acreditar() {
    if (!this.puedeMover()) return;
    this.loadingBanca = true;
    const id = this.user()!.id;
    this.users.acreditarBanca(id, {
      monto: this.banca.monto!,
      motivo: this.banca.motivo.trim()
    }).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Acreditación Exitosa',
          detail: `Se acreditaron ${this.banca.monto} GTQ a tu cuenta`,
          life: 3000
        });
        this.resetBanca();
        this.refreshUser();
      },
      error: (e) => {
        this.toast.add({
          severity: 'error',
          summary: 'Error al Acreditar',
          detail: e?.error?.message || 'No se pudo realizar la acreditación',
          life: 4000
        });
        this.loadingBanca = false;
      }
    });
  }

  debitar() {
    if (!this.puedeMover()) return;
    this.loadingBanca = true;
    const id = this.user()!.id;
    this.users.debitarBanca(id, {
      monto: this.banca.monto!,
      motivo: this.banca.motivo.trim()
    }).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: 'Débito Exitoso',
          detail: `Se debitaron ${this.banca.monto} GTQ de tu cuenta`,
          life: 3000
        });
        this.resetBanca();
        this.refreshUser();
      },
      error: (e) => {
        this.toast.add({
          severity: 'error',
          summary: 'Error al Debitar',
          detail: e?.error?.message || 'No se pudo realizar el débito',
          life: 4000
        });
        this.loadingBanca = false;
      }
    });
  }

  private resetBanca() {
    this.banca = { monto: null, motivo: '' };
    this.loadingBanca = false;
  }
}
