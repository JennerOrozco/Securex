import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        title: 'Dashboard',
        loadComponent: () => import('./features/inicio/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        title: 'Perfil',
        loadComponent: () => import('./features/perfil/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'security/users',
        title: 'Usuarios',
        loadComponent: () => import('./features/seguridad/gestion-usuarios/usuarios/component').then(m => m.SecurityUserCrudComponent)
      },
      {
        path: 'security/roles',
        title: 'Roles',
        loadComponent: () => import('./features/seguridad/roles-permisos/roles/component').then(m => m.SecurityRoleCrudComponent)
      },
      {
        path: 'catalog/apps',
        title: 'Aplicaciones',
        loadComponent: () => import('./features/catalogos-generales/aplicaciones/apps.component').then(m => m.AppsComponent)
      },
      {
        path: 'security/permissions',
        title: 'Permisos',
        loadComponent: () => import('./features/seguridad/roles-permisos/permisos/component').then(m => m.SecurityPermissionCrudComponent)
      },
      {
        path: 'catalog/companies',
        title: 'Compañías',
        loadComponent: () => import('./features/catalogos-generales/companias/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'catalog/branches',
        title: 'Sucursales',
        loadComponent: () => import('./features/catalogos-generales/sucursales/branches.component').then(m => m.BranchesComponent)
      },
      {
        path: 'security/company-permissions',
        title: 'Permisos por Compañía',
        loadComponent: () => import('./features/seguridad/roles-permisos/permisos-compania/company-permissions.component').then(m => m.CompanyPermissionsComponent)
      },
      {
        path: 'security/admin-users',
        title: 'Usuarios (Admin)',
        loadComponent: () => import('./features/seguridad/gestion-usuarios/usuarios-admin/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'security/access',
        title: 'Accesos',
        loadComponent: () => import('./features/seguridad/gestion-usuarios/accesos/admin-access.component').then(m => m.AdminAccessComponent)
      },
      {
        path: 'security/admin-permissions',
        title: 'Permisos (Admin)',
        loadComponent: () => import('./features/seguridad/roles-permisos/permisos-admin/admin-permissions.component').then(m => m.AdminPermissionsComponent)
      },
      {
        path: 'system-logs/security-audit',
        title: 'Auditoría',
        loadComponent: () => import('./features/logs-sistema/logs-auditoria/security-audit.component').then(m => m.SecurityAuditComponent)
      },
      {
        path: 'system-logs/login-attempts',
        title: 'Intentos de Acceso',
        loadComponent: () => import('./features/logs-sistema/intentos-acceso/login-attempts.component').then(m => m.LoginAttemptsComponent)
      },
      {
        path: 'system-logs/password-resets',
        title: 'Restablecimientos de Contraseña',
        loadComponent: () => import('./features/logs-sistema/reseteos-clave/password-resets.component').then(m => m.PasswordResetsComponent)
      },
      {
        path: 'system-logs/refresh-tokens',
        title: 'Tokens de Refresco',
        loadComponent: () => import('./features/logs-sistema/tokens-refresco/refresh-tokens.component').then(m => m.RefreshTokensComponent)
      },
      {
        path: 'security/webauthn-credentials',
        title: 'Credenciales WebAuthn',
        loadComponent: () => import('./features/seguridad/gestion-usuarios/credenciales-webauthn/user-webauthn-credentials.component').then(m => m.UserWebauthnCredentials)
      },
      {
        path: 'system-logs/api-status',
        title: 'Estado de APIs',
        loadComponent: () => import('./features/logs-sistema/estado-apis/api-status.component').then(m => m.ApiStatusComponent)
      },
      {
        path: 'notifications/apps',
        title: 'Aplicaciones',
        loadComponent: () => import('./features/notificaciones/apps/apps.component').then(m => m.AppsComponent)
      },
      {
        path: 'notifications/push-settings',
        title: 'Configuraciones Push',
        loadComponent: () => import('./features/notificaciones/config-push/push-settings').then(m => m.PushSettingsComponent)
      },
      {
        path: 'notifications/smtp-settings',
        title: 'Configuraciones SMTP',
        loadComponent: () => import('./features/notificaciones/config-smtp/smtp-settings').then(m => m.SmtpSettingsComponent)
      },
      {
        path: 'notifications/test',
        title: 'Probar Notificaciones',
        loadComponent: () => import('./features/notificaciones/probar-envio/notification-test').then(m => m.NotificationTestComponent)
      },
      {
        path: 'notifications/history',
        title: 'Historial de Notificaciones',
        loadComponent: () => import('./features/notificaciones/historial-notificaciones/notifications-list').then(m => m.NotificationsListComponent)
      },
      {
        path: 'notifications/devices',
        title: 'Dispositivos de Usuario',
        loadComponent: () => import('./features/notificaciones/dispositivos-usuario/user-devices').then(m => m.UserDevicesComponent)
      },
      {
        path: 'notifications/send-attempts',
        title: 'Intentos de Envío',
        loadComponent: () => import('./features/notificaciones/intentos-envio/send-attempts').then(m => m.SendAttemptsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
