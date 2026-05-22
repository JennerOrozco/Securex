import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurityService } from '@core/services/security.service';
import { FormField } from '@shared/modals/modal.types';
import { AddModalComponent } from '@shared/modals/add-modal/add-modal.component';
import { EditModalComponent } from '@shared/modals/edit-modal/edit-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { RolePermissionsModalComponent } from '@shared/modals/role-permissions-modal/role-permissions-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-role-crud',
  standalone: true,
  imports: [CommonModule, TableComponent, AddModalComponent, EditModalComponent, DeleteModalComponent, RolePermissionsModalComponent],
  templateUrl: './component.html',
  styleUrl: './component.css'
})
export class SecurityRoleCrudComponent implements OnInit {
  private securityService = inject(SecurityService);
  private notificationService = inject(NotificationService);

  roles: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  permModalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'name', label: 'Nombre del Rol', type: 'text', required: true, icon: 'pi pi-tag' },
    { name: 'description', label: 'Descripción', type: 'textarea' }
  ];

  cols: TableColumn[] = [
    { field: 'name', header: 'Rol', type: 'role', sortable: true },
    { field: 'description', header: 'Descripción', type: 'text' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.securityService.getRoles().subscribe({
      next: (res) => { this.roles = res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  handleAdd() { this.modalMode = 'add'; this.selectedItem = null; this.modalVisible = true; }
  handleEdit(item: any) { this.modalMode = 'edit'; this.selectedItem = { ...item }; this.modalVisible = true; }
  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  handleManagePermissions(item: any) {
    this.selectedItem = item;
    this.permModalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securityService.createRole(data)
      : this.securityService.updateRole(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.notify('success', `Rol ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securityService.deleteRole(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.notify('success', 'Rol eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  syncPermissions(ids: number[]) {
    this.isSaving = true;
    this.securityService.syncRolePermissions(this.selectedItem.id, ids).subscribe({
      next: () => {
        this.notificationService.notify('success', 'Permisos sincronizados correctamente');
        this.permModalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}