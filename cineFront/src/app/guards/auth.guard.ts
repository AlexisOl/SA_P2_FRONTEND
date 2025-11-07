// src/app/guards/auth.guard.ts
import { AuthService } from '@/services/auth';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.token) return true;
    router.navigate(['/auth/login']);
    return false;
};