import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { BaseNotificationConfigComponent } from '@shared/utils/base-notification-config';
import { parseLazyLoadEvent } from '@shared/utils/pagination-utils';
import { AppService } from '@/core/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-smtp-settings',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './smtp-settings.component.html'
})
export class SmtpSettingsComponent extends BaseNotificationConfigComponent {
  private apiService = inject(NotificationSettingsService);
  private appService = inject(AppService);

  formFields: FormField[] = [];
  get resourceName() { return 'Configuración'; }

  cols: TableColumn[] = [
    { field: 'app.name', header: 'App Asociada', type: 'text', sortable: true },
    { field: 'smtp_host', header: 'Host', type: 'text', sortable: true },
    { field: 'from_email', header: 'Remitente', type: 'text', sortable: true },
    { field: 'smtp_encryption', header: 'Encriptación', type: 'text', sortable: false },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  loadCatalog(): Observable<any> {
    return this.appService.getAppsWithCompanies().pipe(
      map((res: any) => ({
        apps: res.data || res || []
      }))
    );
  }

  loadSettings(event?: any) {
    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'id');
    if (!event?.sortField && !event?.multiSortMeta) sort.direction = 'ASC';

    this.apiService.getSmtpSettingsGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.items = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  override updateFormFields() {
    this.formFields = [
      {
        name: 'app_uuid', label: 'Aplicación Asociada', type: 'select', required: true,
        options: (this.catalogItems.apps || []).map((app: any) => ({ label: app.name, value: app.uuid }))
      },
      { name: 'smtp_host', label: 'SMTP Host', type: 'text', required: true, icon: 'pi pi-server' },
      { name: 'smtp_port', label: 'SMTP Port', type: 'number', required: true, icon: 'pi pi-hashtag' },
      { name: 'smtp_user', label: 'Usuario SMTP', type: 'text', required: true, icon: 'pi pi-user' },
      { name: 'smtp_pass', label: 'Contraseña SMTP', type: 'password', required: true, icon: 'pi pi-lock' },
      {
        name: 'smtp_encryption', label: 'Encriptación', type: 'select', required: true, options: [
          { label: 'TLS', value: 'tls' }, { label: 'SSL', value: 'ssl' }, { label: 'Ninguna', value: 'none' }
        ]
      },
      { name: 'from_email', label: 'Email Remitente', type: 'email', required: true, icon: 'pi pi-envelope' },
      { name: 'from_name', label: 'Nombre Remitente', type: 'text', required: true, icon: 'pi pi-user' }
    ];
  }

  saveSetting(data: any, mode: 'add' | 'edit') {
    const id = mode === 'add' ? null : data.id;
    return this.apiService.saveSmtpSetting(id, data);
  }

  deleteSetting(item: any) {
    return this.apiService.deleteSmtpSetting(item.id);
  }
}