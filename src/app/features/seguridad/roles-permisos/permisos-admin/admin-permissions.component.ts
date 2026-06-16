import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AppService } from '@core/services/app.service';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';
import { TreeNode } from 'primeng/api';
import { mapToTreeNodes } from '@shared/utils/tree-utils';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './admin-permissions.component.html',

})
export class AdminPermissionsComponent implements OnInit {
  private appService = inject(AppService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  apps: any[] = [];
  permissions: any[] = [];
  treeNodes: TreeNode[] = [];
  loading = false;
  isSaving = false;

  currentAppId: number | null = null;

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
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.loadPermissions();
  }

  private loadPermissions() {
    this.permissionService.getAdminPermissionsGql().subscribe({
      next: (res: any) => {
        this.permissions = res || [];
        this.buildTree();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private buildTree() {
    this.treeNodes = mapToTreeNodes(this.permissions, {
      canAdd: (p) => p.type !== 'ACTION' && p.type !== 'COMPONENT',
      canEdit: (p) => p.type !== 'APP',
      canDelete: (p) => p.type !== 'APP',
      label: (p) => p.name,
      icon: (p) =>
        p.type === 'APP'       ? 'pi pi-box'       :
        p.type === 'MENU'      ? 'pi pi-th-large'  :
        p.type === 'SUBMENU'   ? 'pi pi-folder'    :
        p.type === 'ACTION'    ? 'pi pi-tag'       :
                                  'pi pi-cog',
      leaf: (p) => !p.children || p.children.length === 0,
      expanded: (p) => p.type === 'APP'
    });
  }

  setRootAdd() {
    this.currentAppId = null;
  }

  setChildAdd(parentId: number) {
    this.currentAppId = parentId;
  }

  handleSave(event: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    if (event.mode === 'add') {
      event.data.parent_id = this.currentAppId;
    }
    const obs = event.mode === 'add'
      ? this.permissionService.createPermissionGql(event.data)
      : this.permissionService.updatePermissionGql(event.data.uuid, event.data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Permiso ${event.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  handleDelete(item: any) {
    this.isSaving = true;
    this.permissionService.deletePermissionGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Permiso eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
