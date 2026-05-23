import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurityService } from '@core/services/security.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './component.html',
  styleUrl: './component.css'
})
export class SecurityUserCrudComponent implements OnInit {
  private securityService = inject(SecurityService);
  private notificationService = inject(NotificationService);

  users: any[] = [];
  roles: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  addFormFields: FormField[] = [
    { name: 'full_name', label: 'Nombre Completo', type: 'text', required: true, icon: 'pi pi-user' },
    { name: 'email', label: 'Correo Electrónico', type: 'email', required: true, icon: 'pi pi-envelope' },
    { name: 'password', label: 'Contraseña Temporal', type: 'text', required: true, icon: 'pi pi-key' },
    { name: 'role_id', label: 'Rol Asignado', type: 'select', required: true, options: [] }
  ];

  editFormFields: FormField[] = [
    { name: 'full_name', label: 'Usuario', type: 'text', disabled: true, icon: 'pi pi-user' },
    { name: 'role_id', label: 'Nuevo Rol', type: 'select', required: true, options: [] }
  ];

  cols: TableColumn[] = [
    { field: 'full_name', header: 'Usuario', type: 'user', subField: 'email', sortable: true },
    { field: 'role_name', header: 'Rol Actual', type: 'role', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private ensureRolesLoaded(callback: () => void) {
    if (this.roles.length > 0) {
      callback();
      return;
    }

    this.securityService.getRoles().subscribe({
      next: (res) => {
        this.roles = res;
        const options = this.roles.map(r => ({ label: r.name, value: r.id }));
        this.addFormFields.find(f => f.name === 'role_id')!.options = options;
        this.editFormFields.find(f => f.name === 'role_id')!.options = options;
        callback();
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.securityService.getUsers().subscribe({
      next: (res) => {
        this.users = res.map((u: any) => ({
          ...u,
          role_name: u.access?.[0]?.role?.name || 'Sin Rol',
          role_id: u.access?.[0]?.role?.id
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() {
    this.ensureRolesLoaded(() => {
      this.modalMode = 'add';
      this.selectedItem = null;
      this.modalVisible = true;
    });
  }

  handleEdit(item: any) {
    this.ensureRolesLoaded(() => {
      this.modalMode = 'edit';
      this.selectedItem = { ...item };
      this.modalVisible = true;
    });
  }

  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add') {
      this.securityService.createUser(data).subscribe({
        next: () => this.handleSuccess('Usuario invitado correctamente'),
        error: () => this.isSaving = false
      });
    } else {
      this.securityService.updateUserRole(this.selectedItem.uuid, data.role_id).subscribe({
        next: () => this.handleSuccess('Rol actualizado'),
        error: () => this.isSaving = false
      });
    }
  }

  confirmDelete() {
    this.isSaving = true;
    this.securityService.deleteUser(this.selectedItem.uuid).subscribe({
      next: () => this.handleSuccess('Acceso eliminado'),
      error: () => this.isSaving = false
    });
  }

  private handleSuccess(msg: string) {
    this.notificationService.notify('success', msg);
    this.loadUsers();
    this.modalVisible = false;
    this.isSaving = false;
  }
}