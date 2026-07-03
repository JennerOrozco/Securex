import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { mapToTreeNodes } from '@shared/utils/tree-utils';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './admin-permissions.component.html',
  providers: [UnifiedCrudService]
})
export class AdminPermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  crud = inject(UnifiedCrudService);

  formFields: FormField[] = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, icon: 'pi pi-tag' },
    { name: 'slug', label: 'Slug', type: 'text', required: true, icon: 'pi pi-code' },
    { name: 'type', label: 'Tipo', type: 'select', required: true, options: [
      { label: 'MENÚ (Acceso Sidebar)', value: 'MENU' },
      { label: 'SUBMENÚ (Interior)', value: 'SUBMENU' },
      { label: 'ACCIÓN (Operativo)', value: 'ACTION' },
      { label: 'COMPONENTE (Visual)', value: 'COMPONENT' }
    ]}
  ];

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre / Identificador (Slug)', type: 'tree', sortable: true, style: { width: '30%' } },
    { field: 'type', header: 'Tipo', type: 'badge', sortable: true, style: { width: '10%' } },
    { field: 'icon', header: 'Ícono', type: 'text', style: { width: '10%', textAlign: 'center' } },
    { field: 'route', header: 'Ruta', type: 'text', sortable: true, style: { width: '15%' } },
    { field: 'sort_order', header: 'Orden', type: 'text', sortable: true, style: { width: '10%', textAlign: 'center' } },
    { field: 'is_visible', header: 'Visible', type: 'boolean', sortable: true, style: { width: '10%', textAlign: 'center' } },
    { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.permissions');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.crud.initialize({
        resourceName: 'Permiso',
        isTreeMode: true,
        fnFetchTree: () => this.permissionService.getAdminPermissionsGql(),
        fnCreate: (data: any) => this.permissionService.createPermissionGql(data),
        fnUpdate: (id: string, data: any) => this.permissionService.updatePermissionGql(id, data),
        fnDelete: (id: string) => this.permissionService.deletePermissionGql(id),
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
        }
      });
      this.crud.load();
    }
  }
}
