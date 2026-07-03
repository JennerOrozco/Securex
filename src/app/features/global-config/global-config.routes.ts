import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AppService } from '@core/services/app.service';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { map, tap } from 'rxjs/operators';

export const globalConfigRoutes: Routes = [
  // Catálogos generales
  {
    path: 'catalog/apps',
    title: 'Aplicaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      permission: 'securex.security.apps',
      title: 'Aplicaciones',
      subtitle: 'Catálogo de aplicaciones del ecosistema',
      resourceName: 'Aplicación',
      addLabel: 'Nueva',
      deleteMessage: '¿Estás seguro de eliminar esta aplicación?',
      defaultSortKey: 'id',
      fnFetch: () => inject(AppService).getAppsWithCompanies(),
      fnCreate: (data: any) => inject(AppService).createAppGql(data),
      fnUpdate: (id: string, data: any) => inject(AppService).updateAppGql(id, data),
      fnDelete: (id: string) => inject(AppService).deleteAppGql(id),
      cols: () => import('./catalogs/apps/apps.config').then(m => m.APPS_COLS),
      formFields: () => import('./catalogs/apps/apps.config').then(m => m.APPS_FORM_FIELDS)
    }
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
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      title: 'Usuarios Administrativos',
      subtitle: 'Gestión de usuarios y accesos al sistema',
      resourceName: 'Usuario',
      defaultSortKey: 'created_at',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(UserService).getAdminUsersPaginated(page, limit, filter, sort).pipe(
        map((res: any) => {
          if (res?.data) {
            res.data = res.data.map((u: any) => ({
              ...u,
              auth_provider: u.auth_provider || 'Local',
              created_at: u.created_at || u.createdAt
            }));
          }
          return res;
        })
      ),
      fnCreate: (data: any) => {
        const userService = inject(UserService);
        const authService = inject(AuthService);
        const notificationService = inject(NotificationService);
        return userService.createUserGql(data).pipe(
          tap(() => {
            if (data.email) {
              authService.adminResetUserPassword(data.email).subscribe({
                next: (res: any) => {
                  if (res.success) {
                    notificationService.success(`Código de invitación enviado a ${data.email}`);
                  } else {
                    notificationService.notify('error', res.error || 'No se pudo enviar la invitación.');
                  }
                },
                error: (err: any) => {
                  notificationService.notify('error', `Error al enviar invitación: ${err?.message || 'Error de conexión'}`);
                }
              });
            }
          })
        );
      },
      fnUpdate: (id: string, data: any) => inject(UserService).updateUserGql(id, data),
      fnDelete: (id: string) => inject(UserService).deleteUserGql(id),
      cols: () => import('./access/gestion-usuarios/usuarios-admin/admin-users.config').then(m => m.ADMIN_USERS_COLS),
      formFields: () => import('./access/gestion-usuarios/usuarios-admin/admin-users.config').then(m => m.ADMIN_USERS_FORM_FIELDS)
    }
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
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      title: 'Credenciales WebAuthn',
      subtitle: 'Administración de credenciales de hardware/biometría',
      resourceName: 'Credencial WebAuthn',
      defaultSortKey: 'created_at',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(UserService).getUserWebauthnCredentials(page, limit, filter, sort),
      fnDelete: (id: string) => inject(UserService).deleteUserWebauthnCredential(Number(id)),
      cols: () => import('./credenciales-webauthn/user-webauthn-credentials.config').then(m => m.WEBAUTHN_CREDENTIALS_COLS)
    }
  }
];
