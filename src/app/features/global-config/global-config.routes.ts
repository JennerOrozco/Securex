import { Routes } from '@angular/router';

export const globalConfigRoutes: Routes = [
  // Catálogos generales
  {
    path: 'catalog/apps',
    title: 'Aplicaciones',
    loadComponent: () => import('./catalogs/apps/apps.component').then(m => m.AppsComponent)
  },
  {
    path: 'catalog/companies',
    title: 'Compañías',
    loadComponent: () => import('./catalogs/companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'catalog/branches',
    title: 'Sucursales',
    loadComponent: () => import('./catalogs/branches/branches.component').then(m => m.BranchesComponent)
  },

  // Acceso global — administración de usuarios y roles
  {
    path: 'access/users',
    title: 'Usuarios (Admin)',
    loadComponent: () => import('./access/gestion-usuarios/usuarios-admin/admin-users.component').then(m => m.AdminUsersComponent)
  },
  {
    path: 'access/accesses',
    title: 'Accesos',
    loadComponent: () => import('./access/gestion-usuarios/accesos/admin-access.component').then(m => m.AdminAccessComponent)
  },
  {
    path: 'access/user-access',
    title: 'Accesos por Usuario',
    loadComponent: () => import('./access/gestion-usuarios/accesos-usuario/user-access.component').then(m => m.UserAccessComponent)
  },
  {
    path: 'access/admin-permissions',
    title: 'Permisos (Admin)',
    loadComponent: () => import('./access/roles-permisos/permisos-admin/admin-permissions.component').then(m => m.AdminPermissionsComponent)
  },

  // Permisos por compañía
  {
    path: 'company-permissions',
    title: 'Permisos por Compañía',
    loadComponent: () => import('./companies-access/company-permissions.component').then(m => m.CompanyPermissionsComponent)
  },

  // WebAuthn
  {
    path: 'webauthn-credentials',
    title: 'Credenciales WebAuthn',
    loadComponent: () => import('./credenciales-webauthn/user-webauthn-credentials.component').then(m => m.UserWebauthnCredentials)
  }
];
