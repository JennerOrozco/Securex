import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-push-settings',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent, ButtonModule],
  templateUrl: './push-settings.html'
})
export class PushSettingsComponent implements OnInit {
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
  initialData: any = {};

  formFields: FormField[] = [
    { name: 'app_uuid', label: 'App UUID', type: 'text', required: true, icon: 'pi pi-id-card' },
    { name: 'vapid_public_key', label: 'VAPID Public Key', type: 'text', required: true, icon: 'pi pi-key' },
    { name: 'vapid_private_key', label: 'VAPID Private Key', type: 'text', required: true, icon: 'pi pi-key' },
    { name: 'vapid_subject', label: 'VAPID Subject', type: 'text', required: false, icon: 'pi pi-envelope' },
    { name: 'icon', label: 'Icon URL', type: 'text', required: false, icon: 'pi pi-image' },
    { name: 'url_base', label: 'URL Base', type: 'text', required: false, icon: 'pi pi-link' }
  ];

  cols: TableColumn[] = [
    { field: 'app_uuid', header: 'App UUID', type: 'text', sortable: true },
    { field: 'vapid_subject', header: 'Subject', type: 'text', sortable: true },
    { field: 'icon', header: 'Icon', type: 'text', sortable: false },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.push');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getPushSettings().subscribe({
      next: (res: any) => {
        const d = res.data || res;
        this.items = d || [];
        this.total = this.items.length;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() { this.modalMode = 'add'; this.selectedItem = null; this.initialData = {}; this.modalVisible = true; }
  handleEdit(item: any) { this.modalMode = 'edit'; this.selectedItem = { ...item }; this.modalVisible = true; }
  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  handleGenerateVapid() {
    this.apiService.generateVapid().subscribe({
      next: (res: any) => {
        const keys = res.data || res;
        this.initialData = {
          vapid_public_key: keys.public_key,
          vapid_private_key: keys.private_key
        };
        this.modalMode = 'add';
        this.selectedItem = null;
        this.modalVisible = true;
        this.notificationService.showSuccess('Llaves VAPID generadas. Por favor completa los demás campos y guarda.');
      },
      error: () => this.notificationService.showError('Error al generar llaves VAPID')
    });
  }

  save(data: any) {
    this.isSaving = true;
    const id = this.modalMode === 'add' ? null : this.selectedItem.id;
    this.apiService.savePushSetting(id, data).subscribe({
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
    this.apiService.deletePushSetting(this.selectedItem.id).subscribe({
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
