import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';

import { registerLocaleData } from '@angular/common';
import localeEsGT from '@angular/common/locales/es-GT';
registerLocaleData(localeEsGT);


bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
