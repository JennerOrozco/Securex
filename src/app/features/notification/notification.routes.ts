import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AppService } from '@core/services/app.service';
import { map } from 'rxjs/operators';

export const notificationRoutes: Routes = [
  {
    path: 'apps',
    title: 'Aplicaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'notif-apps',
    }
  },
  {
    path: 'config/push-settings',
    title: 'Push Setting',
    loadComponent: () => import('./config/push-settings/push-settings.component').then(m => m.PushSettingsComponent)
  },
  {
    path: 'config/smtp-settings',
    title: 'SMTP Setting',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'smtp-settings',
      fnCatalogs: () => {
        const appService = inject(AppService);
        return {
          apps: () => appService.getAppsWithCompanies().pipe(
            map((res: any) => res.data || res || [])
          )
        };
      },
    }
  },
  {
    path: 'config/notification-test',
    title: 'Notification Test',
    loadComponent: () => import('./config/notification-test/notification-test.component').then(m => m.NotificationTestComponent),
    data: { mode: 'b2b' }
  },
  {
    path: 'user-devices',
    title: 'Dispositivos de Usuario',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'user-devices',
    }
  },
  {
    path: 'logs/notification-history',
    title: 'Historial de Notificaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'notif-history',
    }
  },
  {
    path: 'logs/send-attemps',
    title: 'Intentos de Envio',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'send-attempts',
    }
  }
];
