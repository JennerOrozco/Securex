import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-user-access',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './user-access.component.html',
  styleUrl: './user-access.component.css'
})
export class UserAccessComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  records: any[] = [];
  users: any[] = [];
  apps: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: [] },
    { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: [] },
    { name: 'is_active', label: 'Activo', type: 'select', options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }] }
  ];

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'is_active', header: 'Activo', type: 'boolean', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.securexService.getUserAccess().subscribe({
      next: (res: any) => { this.records = res.data || res || []; this.loading = false; },
      error: () => this.loading = false
    });

    this.securexService.getUsers().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.users = data;
        const userField = this.formFields.find(f => f.name === 'user_id');
        if (userField) {
          userField.options = data.map((u: any) => ({ label: u.full_name || u.email, value: u.id }));
        }
      }
    });

    this.securexService.getApps().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.apps = data;
        const appField = this.formFields.find(f => f.name === 'app_id');
        if (appField) {
          appField.options = data.map((a: any) => ({ label: a.name, value: a.id }));
        }
      }
    });
  }

  handleAdd() { this.modalMode = 'add'; this.selectedItem = null; this.modalVisible = true; }
  handleEdit(item: any) { this.modalMode = 'edit'; this.selectedItem = { ...item }; this.modalVisible = true; }
  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securexService.createUserAccess(data)
      : this.securexService.updateUserAccess(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserAccess(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Acceso eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
