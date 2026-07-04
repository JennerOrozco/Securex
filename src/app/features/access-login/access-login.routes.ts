import { Routes } from '@angular/router';
import { inject } from '@angular/core';

import { RoleService } from '@core/services/role.service';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { mapToTreeNodes, filterTreeByQuery } from '@shared/utils/tree-utils';
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
      crudConfigKey: 'roles',
      showPermissions: true,
      fnFetch: () => {
        const companyUuid = inject(AuthService).currentCompany()?.uuid ?? null;
        return inject(RoleService).getRolesWithPermissions(companyUuid);
      },
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
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'permissions',
      showLegend: true,
      dragdrop: true,
      searchPlaceholder: 'Buscar slug o nombre...',
      fnFetchTree: () => inject(PermissionService).getPermissionsTree(),
      mapTreeFn: (items: any[]) => {
        (_rawTreeItems as any) = items;
        return mapToTreeNodes(items, { canAdd: (p: any) => p.type !== 'ACTION', expanded: () => false });
      },
      onFilterTypeFn: (crud: UnifiedCrudService, type: string) => {
        const items = (_rawTreeItems as any[]);
        if (!items?.length) return;
        if (!type) {
          crud.items.set(mapToTreeNodes(items, { canAdd: (p: any) => p.type !== 'ACTION', expanded: () => false }));
        } else {
          const filtered = filterTreeByQuery(items, type).filter((p: any) => p.type === type);
          crud.items.set(mapToTreeNodes(filtered, { canAdd: (p: any) => p.type !== 'ACTION', expanded: () => false }));
        }
      },
      onNodeReorderFn: (event: any, crud: UnifiedCrudService, injector: any) => {
        const node = event.dragNode;
        const parent = event.dropNode;
        const parentId = parent?.id || null;
        if (!node || !node.uuid) return;
        const permissionService = injector.get(PermissionService);
        crud.isSaving.set(true);
        permissionService.reorderPermission(node.uuid, parentId, 0)
          .pipe(trackApi(crud, () => crud.isSaving.set(false), 'Estructura reordenada correctamente'))
          .subscribe({ next: () => crud.load(), error: () => crud.isSaving.set(false) });
      },
    }
  }
];
let _rawTreeItems: any[] = [];
