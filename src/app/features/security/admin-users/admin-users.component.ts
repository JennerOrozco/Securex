import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  users: any[] = [];
  loading = false;
  isSaving = false;

  formFields: FormField[] = [
    { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, icon: 'pi pi-user' },
    { name: 'email', label: 'Correo electrónico', type: 'email', required: true, icon: 'pi pi-envelope' },
    { name: 'is_super_admin', label: '¿Es Super Admin?', type: 'select', required: true, icon: 'pi pi-shield',
      options: [{ label: 'No', value: false }, { label: 'Sí', value: true }] },
    { name: 'auth_provider', label: 'Proveedor de Autenticación', type: 'select', required: true, icon: 'pi pi-key',
      options: [
        { label: 'Local', value: 'Local' }, { label: 'Google', value: 'Google' },
        { label: 'Microsoft', value: 'Microsoft' }, { label: 'GitHub', value: 'GitHub' }
      ] }
  ];

  cols: TableColumn[] = [
    { field: 'full_name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'is_super_admin', header: 'Super Admin', type: 'boolean', sortable: true },
    { field: 'auth_provider', header: 'Auth Provider', type: 'text', sortable: true },
    { field: 'created_at', header: 'Creado', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.load();
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
      error: () => (this.loading = false)
    });
  }

  onSave(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const obs = e.mode === 'add'
      ? this.securexService.createUserGql(e.data)
      : this.securexService.updateUserGql(e.data.uuid, e.data);
    obs.subscribe({
      next: () => {
        this.notificationService.success(`Usuario ${e.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.securexService.deleteUserGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Usuario eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
