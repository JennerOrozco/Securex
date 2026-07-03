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
      title: 'Aplicaciones',
      subtitle: 'Aplicaciones registradas en el servicio de notificaciones',
      resourceName: 'Aplicación',
      permission: 'securex.notifications.apps',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(NotificationSettingsService).getAppsGql(page, limit, filter, sort),
      cols: () => import('./apps/apps.config').then(m => m.APPS_COLS)
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
      title: 'Dispositivos de Usuario',
      subtitle: 'Dispositivos registrados para recibir notificaciones Push',
      resourceName: 'Dispositivo',
      permission: 'securex.notifications.devices',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteMessage: '¿Seguro que deseas eliminar este dispositivo? El usuario dejará de recibir notificaciones push en él.',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(NotificationSettingsService).getUserDevicesGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(NotificationSettingsService).deleteUserDeviceGql(id),
      cols: () => import('./user-devices/user-devices.config').then(m => m.USER_DEVICES_COLS)
    }
  },
  {
    path: 'logs/notification-history',
    title: 'Historial de Notificaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      title: 'Historial de Notificaciones',
      subtitle: 'Registro de todas las notificaciones creadas',
      resourceName: 'Notificación',
      permission: 'securex.notifications.history',
      defaultSortKey: 'created_at',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Eliminar Notificación',
      deleteMessage: '¿Estás seguro que deseas eliminar este registro histórico?',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(NotificationSettingsService).getNotificationsHistoryGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(NotificationSettingsService).deleteNotificationHistoryGql(id),
      cols: () => import('./logs/notification-history/notification-history.config').then(m => m.NOTIFICATION_HISTORY_COLS)
    }
  },
  {
    path: 'logs/send-attemps',
    title: 'Intentos de Envio',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      title: 'Intentos de Envío de Notificaciones',
      subtitle: 'Registro de intentos y control de límites (Rate Limiting)',
      resourceName: 'Intento de Envío',
      permission: 'securex.notifications.send-attempts',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Eliminar Intento',
      deleteMessage: '¿Estás seguro que deseas eliminar este registro?',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(NotificationSettingsService).getSendAttemptsGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(NotificationSettingsService).deleteSendAttemptGql(id),
      cols: () => import('./logs/send-attempts/send-attempts.config').then(m => m.SEND_ATTEMPTS_COLS)
    }
  }
];
