import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { PermissionService } from '@core/services/permission.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { mapToTreeNodes, filterTreeByQuery } from '@shared/utils/tree-utils';

@Component({
  selector: 'app-security-permission-crud',
  standalone: true,
  imports: [
    CommonModule,
    CrudPageComponent
  ],
  templateUrl: './permisos.component.html',

})
export class SecurityPermissionCrudComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);

  rawPermissions: any[] = [];
  permissionNodes: TreeNode[] = [];
  loading = false;
  isSaving = false;

  currentParentId: number | null = null;

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre / Identificador (Slug)', type: 'tree', sortable: true, style: { width: '40%' } },
    { field: 'type', header: 'Tipo', type: 'badge', sortable: true, style: { width: '15%' } },
    { field: 'route', header: 'Referencia / Ruta', type: 'link', sortable: true, style: { width: '20%' } },
    { field: 'sort_order', header: 'Orden', type: 'text', sortable: true, style: { width: '10%', textAlign: 'center' } },
    { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  formFields: FormField[] = [
    { name: 'name', label: 'Nombre Visible del Permiso', type: 'text', required: true, icon: 'pi pi-eye', placeholder: 'Ej. Usuarios, Crear Factura' },
    { name: 'slug', label: 'Slug / Identificador', type: 'text', required: true, icon: 'pi pi-code', placeholder: 'modulo.action.nombre' },
    {
      name: 'type',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: [
        { label: 'MENÚ (Acceso Sidebar)', value: 'MENU' },
        { label: 'SUBMENÚ (Interior)', value: 'SUBMENU' },
        { label: 'ACCIÓN (Operativo)', value: 'ACTION' },
        { label: 'COMPONENTE (Visual)', value: 'COMPONENT' }
      ]
    },
    { name: 'route', label: 'Ruta de Aplicación', type: 'text', icon: 'pi pi-link', placeholder: '/app/modulo/ruta' },
    { name: 'icon', label: 'Clase del Icono', type: 'text', icon: 'pi pi-image', placeholder: 'pi pi-tag o fas fa-user' },
    { name: 'sort_order', label: 'Orden de Visualización', type: 'number', icon: 'pi pi-sort-numeric-down', placeholder: '0' },
    {
      name: 'is_visible',
      label: 'Estado de Visibilidad',
      type: 'select',
      options: [
        { label: 'Público en Menú', value: 1 },
        { label: 'Oculto / Privado', value: 0 }
      ]
    }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.permissionService.getPermissionsTree().subscribe({
      next: (res) => {
        this.rawPermissions = res;
        this.permissionNodes = this.buildTree(res);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private buildTree(items: any[]): TreeNode[] {
    return mapToTreeNodes(items, {
      canAdd: (p) => p.type !== 'ACTION',
      expanded: () => false
    });
  }

  filterTree(query: string) {
    const filtered = filterTreeByQuery(this.rawPermissions, query);
    this.permissionNodes = this.buildTree(filtered);
  }

  filterByType(type: string) {
    if (!type) {
      this.permissionNodes = this.buildTree(this.rawPermissions);
      return;
    }
    const filtered = filterTreeByQuery(
      this.rawPermissions,
      type
    ).filter((p: any) => p.type === type);
    this.permissionNodes = this.buildTree(filtered);
  }

  setRootAdd() {
    this.currentParentId = null;
  }

  setChildAdd(parentId: number) {
    this.currentParentId = parentId;
  }

  handleSave(event: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    if (event.mode === 'add') {
      event.data.parent_id = this.currentParentId;
    }

    const obs = event.mode === 'add'
      ? this.permissionService.createPermissionGql(event.data)
      : this.permissionService.updatePermissionGql(event.data.uuid, event.data);

    obs.subscribe({
      next: () => {
        this.notificationService.notify('success', `Permiso ${event.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
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
        this.notificationService.notify('success', 'Permiso eliminado de forma permanente');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  handleNodeReorder(event: any) {
    const node = event.dragNode;
    const parent = event.dropNode;
    const parentId = parent?.id || null;
    this.permissionService.reorderPermission(node.uuid, parentId, 0).subscribe({
      next: () => {
        this.load();
        this.notificationService.notify('success', 'Permiso reordenado correctamente');
      },
      error: () => {}
    });
  }
}