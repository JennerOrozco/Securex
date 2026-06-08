import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BaseNotificationConfigComponent } from '@shared/utils/base-notification-config';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-push-settings',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, ButtonComponent],
  templateUrl: './push-settings.html'
})
export class PushSettingsComponent extends BaseNotificationConfigComponent {
  private apiService = inject(NotificationSettingsService);

  formFields: FormField[] = [];
  get resourceName() { return 'Configuración'; }

  cols: TableColumn[] = [
    { field: 'app_name', header: 'App Asociada', type: 'text', sortable: true },
    { field: 'vapid_subject', header: 'Subject', type: 'text', sortable: true },
    { field: 'icon', header: 'Icon', type: 'image', style: { width: '80px', 'text-align': 'center' }, fallbackIcon: 'pi pi-send' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  loadSettings() {
    this.apiService.getPushSettingsGql().subscribe({
      next: (data: any) => {
        this.items = (data || []).map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid
        }));
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  override updateFormFields() {
    this.formFields = [
      { name: 'app_uuid', label: 'Aplicación Asociada', type: 'select', required: true, icon: 'pi pi-th-large',
        options: this.apps.map((app) => ({ label: app.name, value: app.uuid })) },
      { name: 'vapid_public_key', label: 'VAPID Public Key', type: 'text', required: true, icon: 'pi pi-key' },
      { name: 'vapid_private_key', label: 'VAPID Private Key', type: 'text', required: true, icon: 'pi pi-key' },
      { name: 'vapid_subject', label: 'VAPID Subject', type: 'text', required: false, icon: 'pi pi-envelope' },
      { name: 'icon', label: 'Icono de Notificación', type: 'file', required: false, accept: 'image/*', icon: 'pi pi-image', fallbackIcon: 'pi-bell' },
      { name: 'url_base', label: 'URL Base', type: 'text', required: false, icon: 'pi pi-link' }
    ];
  }

  saveSetting(data: any, mode: 'add' | 'edit'): Observable<any> {
    const id = mode === 'add' ? null : data.id;
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

    return new Observable((subscriber) => {
      this.apiService.savePushSetting(id, payload).subscribe({
        next: (res: any) => subscriber.next(res),
        error: (err) => {
          this.notificationService.showError(err?.error?.message || 'Error al guardar la configuración');
          subscriber.error(err);
        }
      });
    });
  }

  deleteSetting(item: any) {
    return this.apiService.deletePushSetting(item.id);
  }

  handleGenerateVapid() {
    this.apiService.generateVapid().subscribe({
      next: (res: any) => {
        const keys = res.data || res;
        this.initialData = {
          vapid_public_key: keys.public_key,
          vapid_private_key: keys.private_key
        };
        this.notificationService.showSuccess('Llaves VAPID generadas. Por favor completa los demás campos y guarda.');
      },
      error: () => this.notificationService.showError('Error al generar llaves VAPID')
    });
  }
}
