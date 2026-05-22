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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        title: 'Perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'security/users',
        title: 'Usuarios',
        loadComponent: () => import('./features/security/user-crud/component').then(m => m.SecurityUserCrudComponent)
      },
      {
        path: 'security/roles',
        title: 'Roles',
        loadComponent: () => import('./features/security/role-crud/component').then(m => m.SecurityRoleCrudComponent)
      },
      {
        path: 'catalog/apps',
        title: 'Aplicaciones',
        loadComponent: () => import('./features/catalog/apps/apps.component').then(m => m.AppsComponent)
      },
      {
        path: 'security/permissions',
        title: 'Permisos',
        loadComponent: () => import('./features/security/permission-list/component').then(m => m.SecurityPermissionCrudComponent)
      },
      {
        path: 'catalog/companies',
        title: 'Compañías',
        loadComponent: () => import('./features/catalog/companies/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'catalog/branches',
        title: 'Sucursales',
        loadComponent: () => import('./features/catalog/branches/branches.component').then(m => m.BranchesComponent)
      },
      {
        path: 'security/company-permissions',
        title: 'Permisos por Compañía',
        loadComponent: () => import('./features/security/company-permissions/company-permissions.component').then(m => m.CompanyPermissionsComponent)
      },
      {
        path: 'security/admin-users',
        title: 'Usuarios (Admin)',
        loadComponent: () => import('./features/security/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'security/access',
        title: 'Accesos',
        loadComponent: () => import('./features/security/admin-access/admin-access.component').then(m => m.AdminAccessComponent)
      },
      {
        path: 'security/admin-permissions',
        title: 'Permisos (Admin)',
        loadComponent: () => import('./features/security/admin-permissions/admin-permissions.component').then(m => m.AdminPermissionsComponent)
      },
      {
        path: 'system-logs/security-audit',
        title: 'Auditoría',
        loadComponent: () => import('./features/system-logs/security-audit/security-audit.component').then(m => m.SecurityAuditComponent)
      },
      {
        path: 'system-logs/login-attempts',
        title: 'Intentos de Acceso',
        loadComponent: () => import('./features/system-logs/login-attempts/login-attempts.component').then(m => m.LoginAttempts)
      },
      {
        path: 'system-logs/password-resets',
        title: 'Restablecimientos de Contraseña',
        loadComponent: () => import('./features/system-logs/password-resets/password-resets.component').then(m => m.PasswordResets)
      },
      {
        path: 'system-logs/refresh-tokens',
        title: 'Tokens de Refresco',
        loadComponent: () => import('./features/system-logs/refresh-tokens/refresh-tokens.component').then(m => m.RefreshTokens)
      },
      {
        path: 'security/webauthn-credentials',
        title: 'Credenciales WebAuthn',
        loadComponent: () => import('./features/security/user-webauthn-credentials/user-webauthn-credentials.component').then(m => m.UserWebauthnCredentials)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
