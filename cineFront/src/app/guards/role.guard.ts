// src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment, Route } from '@angular/router';
import { AuthService } from '@/services/auth';

export const roleMatchGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = (route.data as any)?.roles ?? [];
  if (!allowed.length) return true;
  if (auth.hasRole(...allowed)) return true;
  router.navigate(['/auth/access']); // Access Denied
  return false;
};