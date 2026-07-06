import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { ConfigService } from '@core/services/config.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { responseInterceptor } from './core/interceptors/response.interceptor';
import { CustomTitleStrategy } from './core/strategies/title.strategy';
import { MessageService, ConfirmationService } from 'primeng/api';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { xsrfInterceptor } from './core/interceptors/xsrf.interceptor';
import { timeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { paginatedResponseInterceptor } from './core/interceptors/paginated-response.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, paginatedResponseInterceptor, responseInterceptor, loadingInterceptor, xsrfInterceptor, timeoutInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      },
      overlayOptions: {
        appendTo: 'body',
        responsive: {
          breakpoint: '768px',
          direction: 'center'
        }
      },
      translation: {
        startsWith: 'Empieza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Es igual',
        notEquals: 'No es igual',
        noFilter: 'Sin filtro',
        lt: 'Menor que',
        lte: 'Menor o igual que',
        gt: 'Mayor que',
        gte: 'Mayor o igual que',
        dateIs: 'Fecha es',
        dateIsNot: 'Fecha no es',
        dateBefore: 'Fecha antes',
        dateAfter: 'Fecha después',
        clear: 'Limpiar',
        apply: 'Aplicar',
        matchAll: 'Coincidir todos',
        matchAny: 'Coincidir cualquiera',
        addRule: 'Agregar regla',
        removeRule: 'Eliminar regla',
        accept: 'Sí',
        reject: 'No',
        emptyMessage: 'Sin opciones disponibles',
        emptyFilterMessage: 'Sin resultados'
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfig(),
      deps: [ConfigService],
      multi: true
    }
  ]
};
