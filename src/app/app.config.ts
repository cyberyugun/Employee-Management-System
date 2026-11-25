import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

registerLocaleData(localeId);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'id-ID' },
  ],
};
