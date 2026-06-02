import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableComponent } from '@shared/tree-table-component/tree-table-component.component';
import { TableColumn } from '@shared/table-component/table.types';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, TreeTableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './admin-permissions.component.html',
  styleUrl: './admin-permissions.component.css'
})
export class AdminPermissionsComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  apps: any[] = [];
  permissions: any[] = [];
  treeNodes: TreeNode[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
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
    { field: 'name', header: 'Nombre / Identificador (Slug)', type: 'tree', sortable: true, style: { width: '40%' } },
    { field: 'type', header: 'Tipo', type: 'badge', sortable: true, style: { width: '15%' } },
    { field: 'route', header: 'Referencia / Ruta', type: 'link', sortable: true, style: { width: '20%' } },
    { field: 'sort_order', header: 'Orden', type: 'text', sortable: true, style: { width: '10%', textAlign: 'center' } },
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
    this.securexService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.loadPermissions();
      },
      error: () => this.loading = false
    });
  }

  private loadPermissions() {
    this.securexService.getAdminPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res.data || res || [];
        this.buildTree();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private buildTree() {
    const hasChildren = this.permissions.some(p => p.children?.length > 0);

    const mapPermissions = (items: any[]): any[] =>
      items.map(p => ({
        label: p.name,
        data: { ...p, _canAdd: p.type !== 'ACTION', _canEdit: true, _canDelete: true },
        icon: p.type === 'MENU' ? 'pi pi-th-large' : p.type === 'SUBMENU' ? 'pi pi-folder' : p.type === 'ACTION' ? 'pi pi-tag' : 'pi pi-cog',
        leaf: !p.children || p.children.length === 0,
        children: p.children?.length > 0 ? mapPermissions(p.children) : undefined
      }));

    this.treeNodes = this.apps.map(app => ({
      label: app.name,
      data: { ...app, name: app.name, slug: app.slug || '', type: '', _canAdd: true, _canEdit: false, _canDelete: false },
      icon: 'pi pi-th-large',
      expanded: true,
      leaf: this.permissions.length === 0,
      children: this.permissions.length > 0
        ? (hasChildren ? mapPermissions(this.permissions) : this.permissions.map(p => ({
            label: p.name,
            data: { ...p, _canAdd: p.type !== 'ACTION', _canEdit: true, _canDelete: true },
            icon: p.type === 'MENU' ? 'pi pi-th-large' : p.type === 'SUBMENU' ? 'pi pi-folder' : 'pi pi-tag',
            leaf: true
          })))
        : undefined
    }));
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentAppId = null;
    this.modalVisible = true;
  }

  handleAddChild(id: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentAppId = id;
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
    const obs = this.modalMode === 'add'
      ? this.securexService.createAdminPermission(data)
      : this.securexService.updateAdminPermission(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Permiso ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteAdminPermission(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Permiso eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
