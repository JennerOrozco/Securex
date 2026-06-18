import { Routes } from '@angular/router';

export const notificationRoutes: Routes = [
  {
    path: 'apps',
    title: 'Aplicaciones',
    loadComponent: () => import('./apps/apps.component').then(m => m.AppsComponent)
  },
  {
    path: 'config/push-settings',
    title: 'Push Setting',
    loadComponent: () => import('./config/push-settings/push-settings.component').then(m => m.PushSettingsComponent)
  },
  {
    path: 'config/smtp-settings',
    title: 'SMTP Setting',
    loadComponent: () => import('./config/smtp-settings/smtp-settings.component').then(m => m.SmtpSettingsComponent),
    data: { mode: 'b2b' }
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
    loadComponent: () => import('./user-devices/user-devices.component').then(m => m.UserDevicesComponent)
  },
  {
    path: 'logs/notification-history',
    title: 'Historial de Notificaciones',
    loadComponent: () => import('./logs/notification-history/notification-history.component').then(m => m.NotificationsListComponent)
  },
  {
    path: 'logs/send-attemps',
    title: 'Intentos de Envio',
    loadComponent: () => import('./logs/send-attempts/send-attempts.component').then(m => m.SendAttemptsComponent),
  }
];
