import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AppService } from '@core/services/app.service';
import { map } from 'rxjs/operators';

export const notificationRoutes: Routes = [
  {
    path: 'apps',
    title: 'Aplicaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'notif-apps',
      permission: 'securex.notifications.apps',
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
      title: 'Configuración SMTP',
      subtitle: 'Configuraciones de los servidores de correo saliente (SMTP)',
      resourceName: 'Configuración SMTP',
      lazy: true,
      defaultSortKey: 'id',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(NotificationSettingsService).getSmtpSettingsGql(page, limit, filter, sort),
      fnCreate: (data: any) => inject(NotificationSettingsService).saveSmtpSetting(null, data),
      fnUpdate: (id: number, data: any) => inject(NotificationSettingsService).saveSmtpSetting(id, data),
      fnDelete: (id: number) => inject(NotificationSettingsService).deleteSmtpSetting(id),
      fnCatalogs: () => {
        const appService = inject(AppService);
        return {
          apps: () => appService.getAppsWithCompanies().pipe(
            map((res: any) => res.data || res || [])
          )
        };
      },
      cols: () => import('./config/smtp-settings/smtp-settings.config').then(m => m.SMTP_SETTINGS_COLS),
      formFieldsFn: () => import('./config/smtp-settings/smtp-settings.config').then(m => m.createSmtpSettingsForm)
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
      permission: 'securex.notifications.devices',
    }
  },
  {
    path: 'logs/notification-history',
    title: 'Historial de Notificaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'notif-history',
      permission: 'securex.notifications.history',
    }
  },
  {
    path: 'logs/send-attemps',
    title: 'Intentos de Envio',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'send-attempts',
      permission: 'securex.notifications.send-attempts',
    }
  }
];
