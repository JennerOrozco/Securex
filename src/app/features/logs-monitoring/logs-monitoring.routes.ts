import { Routes } from '@angular/router';

export const logsMonitoringRoutes: Routes = [
  {
    path: 'security-audit',
    title: 'Auditoría de Seguridad',
    loadComponent: () => import('./security-audit/security-audit.component').then(m => m.SecurityAuditComponent)
  },
  {
    path: 'login-attempts',
    title: 'Intentos de Acceso',
    loadComponent: () => import('./login-attempts/login-attempts.component').then(m => m.LoginAttemptsComponent)
  },
  {
    path: 'password-resets',
    title: 'Restablecimientos de Contraseña',
    loadComponent: () => import('./reseteos-clave/password-resets.component').then(m => m.PasswordResetsComponent)
  },
  {
    path: 'refresh-tokens',
    title: 'Tokens de Refresco',
    loadComponent: () => import('./refresh-tokens/refresh-tokens.component').then(m => m.RefreshTokensComponent)
  },
  {
    path: 'api-status',
    title: 'Estado de APIs',
    loadComponent: () => import('./api-status/api-status.component').then(m => m.ApiStatusComponent)
  }
];
