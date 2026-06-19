import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      title="Historial de Notificaciones"
      subtitle="Registro de todas las notificaciones creadas"
      [columns]="cols"
      [data]="items"
      [loading]="loading"
      [lazy]="true"
      [totalRecords]="totalRecords"
      [showAdd]="false"
      [showEdit]="false"
      [showDelete]="true"
      deleteTitle="Eliminar Notificación"
      deleteMessage="¿Estás seguro que deseas eliminar este registro histórico?"
      [isSaving]="isSaving"
      (onLazyLoad)="load($event)"
      (onConfirmDelete)="confirmDelete($event)"
      (onRefresh)="load()">
    </app-crud-page>
  `
})
export class NotificationsListComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  loading = false;
  isSaving = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'title', header: 'Título', type: 'text', sortable: true },
    { field: 'channels', header: 'Canales', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'badge', sortable: true },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.history');
  }

  ngOnInit() {
    if (this.hasPermission) {
      // We don't call load() directly because the paginator triggers onLazyLoad on init.
    }
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'created_at');

    this.apiService.getNotificationsHistoryGql(page, limit, filter, sort).subscribe({
      next: (response: any) => {
        const data = response?.data || [];
        this.totalRecords = response?.total || 0;
        
        this.items = data.map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid,
          user_name: item.user?.full_name || item.user_email || item.user_uuid,
          status: item.is_read ? 'Leída' : 'Pendiente'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.apiService.deleteNotificationHistoryGql(item.id).subscribe({
      next: () => {
        this.notificationService.success('Notificación eliminada');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}

