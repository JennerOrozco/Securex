import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-smtp-settings',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './smtp-settings.html'
})
export class SmtpSettingsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  total = 0;
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'app_uuid', label: 'App UUID', type: 'text', required: true, icon: 'pi pi-id-card' },
    { name: 'smtp_host', label: 'SMTP Host', type: 'text', required: true, icon: 'pi pi-server' },
    { name: 'smtp_port', label: 'SMTP Port', type: 'number', required: true, icon: 'pi pi-hashtag' },
    { name: 'smtp_user', label: 'Usuario SMTP', type: 'text', required: true, icon: 'pi pi-user' },
    { name: 'smtp_pass', label: 'Contraseña SMTP', type: 'password', required: true, icon: 'pi pi-lock' },
    { name: 'smtp_encryption', label: 'Encriptación', type: 'select', required: true, options: [
      { label: 'TLS', value: 'tls' },
      { label: 'SSL', value: 'ssl' },
      { label: 'Ninguna', value: 'none' }
    ]},
    { name: 'from_email', label: 'Email Remitente', type: 'email', required: true, icon: 'pi pi-envelope' },
    { name: 'from_name', label: 'Nombre Remitente', type: 'text', required: true, icon: 'pi pi-user' }
  ];

  cols: TableColumn[] = [
    { field: 'app_uuid', header: 'App UUID', type: 'text', sortable: true },
    { field: 'smtp_host', header: 'Host', type: 'text', sortable: true },
    { field: 'from_email', header: 'Remitente', type: 'text', sortable: true },
    { field: 'smtp_encryption', header: 'Encriptación', type: 'text', sortable: false },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.smtp');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getSmtpSettings().subscribe({
      next: (res: any) => {
        const d = res.data || res;
        this.items = d || [];
        this.total = this.items.length;
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
    const id = this.modalMode === 'add' ? null : this.selectedItem.id;
    this.apiService.saveSmtpSetting(id, data).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Configuración ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.apiService.deleteSmtpSetting(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Configuración eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
