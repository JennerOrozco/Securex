import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  users: any[] = [];
  total = 0;
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, icon: 'pi pi-user' },
    { name: 'email', label: 'Correo electrónico', type: 'email', required: true, icon: 'pi pi-envelope' },
    {
      name: 'is_super_admin', label: '¿Es Super Admin?', type: 'select', required: true, icon: 'pi pi-shield',
      options: [
        { label: 'No', value: false },
        { label: 'Sí', value: true }
      ]
    },
    {
      name: 'auth_provider', label: 'Proveedor de Autenticación', type: 'select', required: true, icon: 'pi pi-key',
      options: [
        { label: 'Local', value: 'Local' },
        { label: 'Google', value: 'Google' },
        { label: 'Microsoft', value: 'Microsoft' },
        { label: 'GitHub', value: 'GitHub' }
      ]
    }
  ];

  cols: TableColumn[] = [
    { field: 'full_name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'is_super_admin', header: 'Super Admin', type: 'boolean', sortable: true },
    { field: 'auth_provider', header: 'Auth Provider', type: 'text', sortable: true },
    { field: 'created_at', header: 'Creado', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.users');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getAdminUsersGql({ per_page: 50 }).subscribe({
      next: (res: any) => {
        this.users = (res || []).map((u: any) => ({
          ...u,
          auth_provider: u.auth_provider || 'Local',
          created_at: u.created_at || u.createdAt
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() { this.modalMode = 'add'; this.selectedItem = null; this.modalVisible = true; }
  handleEdit(item: any) { this.modalMode = 'edit'; this.selectedItem = { ...item }; this.modalVisible = true; }
  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securexService.createUserGql(data)
      : this.securexService.updateUserGql(this.selectedItem.uuid, data);
    obs.subscribe({
      next: () => {
        this.notificationService.success(`Usuario ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserGql(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Usuario eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
