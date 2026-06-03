import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-push-settings',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent, ButtonComponent],
  templateUrl: './push-settings.html'
})
export class PushSettingsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  apps: any[] = [];
  total = 0;
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  initialData: any = {};

  formFields: FormField[] = [];

  cols: TableColumn[] = [
    { field: 'app_name', header: 'App Asociada', type: 'text', sortable: true },
    { field: 'vapid_subject', header: 'Subject', type: 'text', sortable: true },
    { field: 'icon', header: 'Icon', type: 'image', style: { width: '80px', 'text-align': 'center' } },
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
    this.securexService.getAppsWithCompanies().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.updateFormFields();
        this.loadSettings();
      },
      error: () => this.loading = false
    });
  }

  loadSettings() {
    this.apiService.getPushSettingsGql().subscribe({
      next: (data: any) => {
        this.items = (data || []).map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid
        }));
        this.total = this.items.length;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateFormFields() {
    this.formFields = [
      {
        name: 'app_uuid',
        label: 'Aplicación Asociada',
        type: 'select',
        required: true,
        icon: 'pi pi-th-large',
        options: this.apps.map(app => ({ label: app.name, value: app.uuid }))
      },
      { name: 'vapid_public_key', label: 'VAPID Public Key', type: 'text', required: true, icon: 'pi pi-key' },
      { name: 'vapid_private_key', label: 'VAPID Private Key', type: 'text', required: true, icon: 'pi pi-key' },
      { name: 'vapid_subject', label: 'VAPID Subject', type: 'text', required: false, icon: 'pi pi-envelope' },
      { name: 'icon', label: 'Icono de Notificación', type: 'file', required: false, accept: 'image/*', icon: 'pi pi-image', fallbackIcon: 'pi-bell' },
      { name: 'url_base', label: 'URL Base', type: 'text', required: false, icon: 'pi pi-link' }
    ];
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
    const payload: FormData | any = data.icon instanceof File ? new FormData() : { ...data };

    if (payload instanceof FormData) {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (key === 'icon' && value instanceof File) {
          payload.append('icon', value, value.name);
        } else {
          payload.append(key, String(value));
        }
      });
    }

    this.apiService.savePushSetting(id, payload).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `Configuración ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`
        );
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.isSaving = false;
        this.notificationService.showError(
          err?.error?.message || 'Error al guardar la configuración'
        );
      }
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
