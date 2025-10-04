import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { provideSweetAlert2 } from "@sweetalert2/ngx-sweetalert2";
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(),
  provideAnimationsAsync(),
  providePrimeNG({
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark'
      }
    }
  }),
    provideSweetAlert2({
            fireOnInit: false,
            dismissOnDestroy: true,
        }),

  ]
};
