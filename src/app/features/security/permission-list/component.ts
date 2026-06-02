import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { SecurexService } from '@core/services/securex.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeTableComponent } from '@shared/tree-table-component/tree-table-component.component';
import { TableColumn } from '@shared/table-component/table.types';

@Component({
  selector: 'app-security-permission-crud',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeTableComponent,
    FormModalComponent,
    DeleteModalComponent
  ],
  templateUrl: './component.html',
  styleUrl: './component.css'
})
export class SecurityPermissionCrudComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  rawPermissions: any[] = [];
  permissionNodes: TreeNode[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
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
    this.securexService.getPermissions().subscribe({
      next: (res) => {
        this.rawPermissions = res;
        this.permissionNodes = this.mapToTreeNodes(res);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private mapToTreeNodes(data: any[]): TreeNode[] {
    return data.map(item => ({
      data: { ...item, _canAdd: item.type !== 'ACTION', _canEdit: true, _canDelete: true },
      children: item.children && item.children.length > 0 ? this.mapToTreeNodes(item.children) : [],
      expanded: false
    }));
  }

  filterTree(query: string) {
    const q = query.toLowerCase();
    if (!q) {
      this.permissionNodes = this.mapToTreeNodes(this.rawPermissions);
      return;
    }

    const filterNode = (nodes: any[]): any[] => {
      return nodes.reduce((acc, node) => {
        const matches = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
        const children = node.children && node.children.length > 0 ? filterNode(node.children) : [];

        if (matches || children.length > 0) {
          acc.push({ ...node, children });
        }
        return acc;
      }, []);
    };

    const filtered = filterNode(this.rawPermissions);
    this.permissionNodes = this.mapToTreeNodes(filtered);
  }

  filterByType(type: string) {
    if (!type) {
      this.permissionNodes = this.mapToTreeNodes(this.rawPermissions);
      return;
    }

    const filterNode = (nodes: any[]): any[] => {
      return nodes.reduce((acc, node) => {
        const matches = node.type === type;
        const children = node.children && node.children.length > 0 ? filterNode(node.children) : [];

        if (matches || children.length > 0) {
          acc.push({ ...node, children });
        }
        return acc;
      }, []);
    };

    const filtered = filterNode(this.rawPermissions);
    this.permissionNodes = this.mapToTreeNodes(filtered);
  }

  handleAdd(parentId: number | null = null) {
    this.modalMode = 'add';
    this.currentParentId = parentId;
    this.selectedItem = null;
    this.modalVisible = true;
  }

  handleEdit(item: any) {
    this.modalMode = 'edit';
    this.selectedItem = { ...item };
    this.modalVisible = true;
  }

  handleDelete(item: any) {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add') {
      data.parent_id = this.currentParentId;
    }

    const obs = this.modalMode === 'add'
      ? this.securexService.createPermission(data)
      : this.securexService.updatePermission(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.notify('success', `Permiso ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deletePermission(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.notify('success', 'Permiso eliminado de forma permanente');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  handleNodeReorder(event: any) {
    const node = event.dragNode;
    const parent = event.dropNode;
    const parentId = parent?.id || null;
    this.securexService.reorderPermission(node.uuid, parentId, 0).subscribe({
      next: () => {
        this.load();
        this.notificationService.notify('success', 'Permiso reordenado correctamente');
      },
      error: () => {}
    });
  }
}