// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
  catchError,
  map,
} from 'rxjs';
import {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
  UserDTO,
} from '@/models/user.model';
import { environment } from 'src/environments/environment';
//import { environment } from '@/enviroments/environment';

const BASE_URL = environment.URL_GATEWAY;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storageKey = 'accessToken';

  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // ---------- Auth ----------
  register(dto: RegisterDTO) {
  // Si tu API sí devuelve el usuario, esto sigue funcionando.
  // Si devuelve vacío, res.body será null y lo toleramos.
  return this.http.post<UserDTO>(`${BASE_URL}/v1/auth/register`, dto, {
    observe: 'response'
  }).pipe(
    map((res: HttpResponse<UserDTO>) => res.body ?? null)
  );
}

  login(dto: LoginDTO) {
    return this.http
      .post<LoginResponse>(`${BASE_URL}/v1/auth/login`, dto, {
        // opcional: forzar content-type si algún interceptor lo cambia
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  loginAndLoadUser(dto: LoginDTO) {
    return this.login(dto).pipe(switchMap(() => this.fetchAndCacheUser()));
  }

  forgotPassword(email: string) {
    return this.http.post(`${BASE_URL}/v1/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${BASE_URL}/v1/auth/reset-password`, {
      token,
      newPassword,
    });
  }

  // ---------- Token ----------
  get token(): string | null {
    return localStorage.getItem(this.storageKey);
  }
  setToken(t: string) {
    localStorage.setItem(this.storageKey, t);
  }
  clearToken() {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  /** Atajo público para obtener y cachear el usuario actual a partir del JWT. */
  getMe(): Observable<UserDTO | null> {
    return this.fetchAndCacheUser();
  }

  private decodeJwt<T = any>(token: string): T | null {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload)) as T;
    } catch {
      return null;
    }
  }

  // ---------- Usuario actual ----------
  private getUserIdFromToken(): string | null {
    const t = this.token;
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1] || ''));
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }

  /** Pide /v1/users/{sub} y cachea en currentUser$ */
  fetchAndCacheUser(): Observable<UserDTO | null> {
    const id = this.getUserIdFromToken();
    if (!id) {
      this.currentUserSubject.next(null);
      return of(null);
    }
    return this.http.get<UserDTO>(`${BASE_URL}/v1/users/${id}`).pipe(
      tap((u) => this.currentUserSubject.next(u)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      }),
    );
  }

  // ---------- Errores ----------
  handleError(err: HttpErrorResponse) {
    const msg = err?.error?.message || err.message || 'Error inesperado';
    return throwError(() => new Error(msg));
  }

  // src/app/services/auth.service.ts (añade estas helpers)
  get roleFromToken():
    | 'ADMIN'
    | 'CLIENTE'
    | 'EMPLEADO_REST'
    | 'EMPLEADO_HOTEL'
    | null {
    const t = this.token;
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1] || ''));
      return payload?.rol ?? null;
    } catch {
      return null;
    }
  }

  hasRole(...roles: string[]): boolean {
    const r = this.roleFromToken;
    return !!r && roles.includes(r);
  }
}
