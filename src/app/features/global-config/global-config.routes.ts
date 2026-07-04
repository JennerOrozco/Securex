import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AppService } from '@core/services/app.service';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { CompanyService } from '@core/services/company.service';
import { PermissionService } from '@core/services/permission.service';
import { mapToTreeNodes } from '@shared/utils/tree-utils';
import { map, tap } from 'rxjs/operators';

export const globalConfigRoutes: Routes = [
  // Catálogos generales
  {
    path: 'catalog/apps',
    title: 'Aplicaciones',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'global-apps',
    }
  },
  {
    path: 'catalog/companies',
    title: 'Compañías',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'companies',
      isTreeTable: true,
      showLegend: false,
      permission: 'securex.security.companies',
      deleteMessage: (item: any) => `¿Está seguro de que desea eliminar la compañía ${item?.name}?`,
      fnFetch: () => {
        return inject(CompanyService).getCompaniesPageData().pipe(
          map((data: any) => {
            const apps = data?.apps?.data ?? [];
            const companies = data?.companies?.data ?? [];
            return apps.map((app: any) => ({
              data: { ...app, name: app.name, type: 'MENU', _canAdd: true, _canEdit: false, _canDelete: false, icon: 'pi pi-th-large' },
              expanded: true,
              children: companies.filter((c: any) => c.app_id === app.id).map((company: any) => ({
                data: { ...company, type: 'SUBMENU', icon: 'pi pi-building', _canAdd: false, _canEdit: true, _canDelete: true }
              }))
            }));
          })
        );
      },
      fnCatalogs: () => {
        const appService = inject(AppService);
        return { apps: () => appService.getAppsWithCompanies() };
      },
      onAddRootFn: (shell: any) => { shell.formExtraData = null; },
      onAddChildFn: (parentId: any, shell: any) => { shell.formExtraData = { app_id: parentId, is_active: true }; },
      hooks: () => {
        const companyService = inject(CompanyService);
        return {
          onBeforeSave: (data: any, mode: string) => {
            return new Promise((resolve, reject) => {
              if (data.logo_url instanceof File) {
                const appId = data.app_id || data.parent_id || 'default-app';
                const companyName = data.name || 'company';
                companyService.uploadLogo(data.logo_url, appId, companyName).subscribe({
                  next: (res: any) => { data.logo_url = res.data?.url || res.url; resolve(data); },
                  error: (err) => reject(new Error('Error al subir la imagen del logo: ' + (err.error?.message || err.message)))
                });
              } else {
                resolve(data);
              }
            });
          }
        };
      }
    }
  },
  {
    path: 'catalog/branches',
    title: 'Sucursales',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'branches',
      isTreeTable: true,
      showLegend: false,
      permission: 'securex.security.branches',
      deleteMessage: (item: any) => `¿Está seguro de que desea eliminar la sucursal ${item?.name}?`,
      fnFetch: () => {
        return inject(CompanyService).getBranchesPageData().pipe(
          map((data: any) => {
            const companies = data?.companies?.data ?? [];
            const branches = data?.branches?.data ?? [];
            return companies.map((company: any) => ({
              data: { ...company, name: company.name, type: 'MENU', _canAdd: true, _canEdit: false, _canDelete: false, icon: 'pi pi-building' },
              expanded: true,
              children: branches.filter((b: any) => b.company_id === company.id).map((branch: any) => ({
                data: { ...branch, type: 'SUBMENU', icon: 'pi pi-sitemap', _canAdd: false, _canEdit: true, _canDelete: true }
              }))
            }));
          })
        );
      },
      fnCatalogs: () => {
        const companyService = inject(CompanyService);
        return { companies: () => companyService.getCompanies() };
      },
      onAddRootFn: (shell: any) => { shell.formExtraData = null; },
      onAddChildFn: (parentId: any, shell: any) => { shell.formExtraData = { company_id: parentId, is_active: true }; }
    }
  },

  // Acceso global — administración de usuarios y roles
  {
    path: 'access/users',
    title: 'Usuarios (Admin)',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'admin-users',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(UserService).getAdminUsersPaginated(page, limit, filter, sort).pipe(
        map((res: any) => {
          if (res?.data) {
            res.data = res.data.map((u: any) => ({ ...u, auth_provider: u.auth_provider || 'Local', created_at: u.created_at || u.createdAt }));
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
                  if (res.success) { notificationService.success(`Código de invitación enviado a ${data.email}`); }
                  else { notificationService.notify('error', res.error || 'No se pudo enviar la invitación.'); }
                },
                error: (err: any) => { notificationService.notify('error', `Error al enviar invitación: ${err?.message || 'Error de conexión'}`); }
              });
            }
          })
        );
      },
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
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'admin-perms',
      searchPlaceholder: 'Buscar permiso...',
      fnFetchTree: () => inject(PermissionService).getAdminPermissionsGql(),
      mapTreeFn: (items: any[]) => {
        return mapToTreeNodes(items, {
          canAdd: (p: any) => p.type !== 'ACTION' && p.type !== 'COMPONENT',
          canEdit: (p: any) => p.type !== 'APP',
          canDelete: (p: any) => p.type !== 'APP',
          label: (p: any) => p.name,
          icon: (p: any) =>
            p.type === 'APP'       ? 'pi pi-box'       :
            p.type === 'MENU'      ? 'pi pi-th-large'  :
            p.type === 'SUBMENU'   ? 'pi pi-folder'    :
            p.type === 'ACTION'    ? 'pi pi-tag'       :
                                      'pi pi-cog',
          leaf: (p: any) => !p.children || p.children.length === 0,
          expanded: (p: any) => p.type === 'APP'
        });
      },
    }
  },

  // Permisos por compañía
  {
    path: 'company-permissions',
    title: 'Permisos por Compañía',
    loadComponent: () => import('./companies-access/company-permissions.component').then(m => m.CompanyPermissionsComponent)
  },

  {
    path: 'admin/crud-configs',
    title: 'Config CRUD',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: { crudConfigKey: 'crud-configs' }
  },
  {
    path: 'admin/crud-columns',
    title: 'Columnas CRUD',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: { crudConfigKey: 'crud-columns' }
  },
  {
    path: 'admin/crud-form-fields',
    title: 'Form Fields CRUD',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: { crudConfigKey: 'crud-form-fields' }
  },
  {
    path: 'webauthn-credentials',
    title: 'Credenciales WebAuthn',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'webauthn-creds',
    }
  }
];
