import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-user-devices',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      title="Dispositivos de Usuario"
      subtitle="Dispositivos registrados para recibir notificaciones Push"
      [columns]="cols"
      [data]="items"
      [loading]="loading"
      [lazy]="true"
      [totalRecords]="totalRecords"
      [showAdd]="false"
      [showEdit]="false"
      [showDelete]="true"
      deleteTitle="Eliminar Dispositivo"
      deleteMessage="¿Seguro que deseas eliminar este dispositivo? El usuario dejará de recibir notificaciones push en él."
      [isSaving]="isSaving"
      (onLazyLoad)="load($event)"
      (onConfirmDelete)="confirmDelete($event)"
      (onRefresh)="load()">
    </app-crud-page>
  `
})
export class UserDevicesComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  loading = false;
  isSaving = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'text', sortable: true },
    { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'user.full_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'device_type', header: 'Tipo', type: 'text', sortable: true },
    { field: 'device_token', header: 'Token', type: 'text', sortable: false },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.devicess');
  }

  ngOnInit() {
    if (this.hasPermission) {
      // Lazy load from paginator
    }
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'id');
    if (!event?.sortField && !event?.multiSortMeta) sort.direction = 'ASC';

    this.apiService.getUserDevicesGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.items = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.apiService.deleteUserDeviceGql(item.id).subscribe({
      next: () => {
        this.notificationService.success('Dispositivo eliminado exitosamente');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
