import { Routes } from '@angular/router';
import { inject } from '@angular/core';

import { RoleService } from '@core/services/role.service';
import { AuthService } from '@core/services/auth.service';
import { trackApi } from '@shared/utils/rxjs-utils';
import { RolePermissionsModalComponent } from '@shared/modals/modal-shell/role-permissions-modal/role-permissions-modal.component';

export const accessLoginRoutes: Routes = [
  {
    path: 'profile',
    title: 'Mi Perfil',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'users',
    title: 'Usuarios',
    loadComponent: () => import('./user/user.component').then(m => m.SecurityUserCrudComponent)
  },
  {
    path: 'roles',
    title: 'Roles',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      title: 'Roles de Sistema',
      subtitle: 'Administración de roles y permisos',
      resourceName: 'Rol',
      showPermissions: true,
      fnFetch: () => {
        const companyUuid = inject(AuthService).currentCompany()?.uuid ?? null;
        return inject(RoleService).getRolesWithPermissions(companyUuid);
      },
      fnCreate: (data: any) => inject(RoleService).createRoleGql(data),
      fnUpdate: (id: string, data: any) => inject(RoleService).updateRoleGql(id, data),
      fnDelete: (id: string) => inject(RoleService).deleteRoleGql(id),
      cols: () => import('./roles/roles.config').then(m => m.ROLE_TABLE_COLUMNS),
      formFields: () => import('./roles/roles.config').then(m => m.ROLE_FORM_FIELDS),
      onPermissionsFn: (item: any, shell: any) => {
        shell.customModalComponent = RolePermissionsModalComponent;
        shell.customModalInputs = {
          visible: true,
          roleId: item.uuid,
          roleName: item.name,
          onCloseCallback: () => {
            shell.customModalComponent = null;
            shell.cdr.markForCheck();
          },
          onSaveCallback: (ids: number[]) => {
            shell.customModalInputs = { ...shell.customModalInputs, loading: true };
            shell.cdr.markForCheck();
            const roleService = shell.injector.get(RoleService);
            roleService.syncRolePermissionsGql(item.uuid, ids)
              .pipe(trackApi(shell, (s) => {}, 'Permisos sincronizados correctamente'))
              .subscribe({
                next: () => {
                  shell.customModalComponent = null;
                  shell.cdr.markForCheck();
                }
              });
          }
        };
      }
    }
  },
  {
    path: 'permissions',
    title: 'Permisos',
    loadComponent: () => import('./permissions/permissions.component').then(m => m.SecurityPermissionCrudComponent)
  }
];
