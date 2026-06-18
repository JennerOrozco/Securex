import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { parseLazyLoadEvent } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-notifications-apps',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      title="Aplicaciones"
      subtitle="Aplicaciones registradas en el servicio de notificaciones"
      [columns]="cols"
      [data]="items"
      [loading]="loading"
      [lazy]="true"
      [totalRecords]="totalRecords"
      [showAdd]="false"
      [showEdit]="false"
      [showDelete]="false"
      (onLazyLoad)="load($event)"
      (onRefresh)="load()">
    </app-crud-page>
  `
})
export class AppsComponent {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);

  // Mantengo estas variables suponiendo que no heredas de BaseNotificationConfigComponent en este archivo
  items: any[] = [];
  loading = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'text', sortable: true, style: { width: '10%' } },
    { field: 'name', header: 'Nombre', type: 'text', sortable: true, style: { width: '40%' } },
    { field: 'slug', header: 'Slug', type: 'text', sortable: true, style: { width: '35%' } },
    { field: 'is_active', header: 'Estado', type: 'status', sortable: true, style: { width: '15%' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.apps');
  }

  load(event?: any) {
    if (!this.hasPermission) return;

    this.loading = true;
    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'id');
    if (!event?.sortField && !event?.multiSortMeta) sort.direction = 'ASC';

    this.apiService.getAppsGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        this.totalRecords = res?.total || 0;
        this.items = res?.data || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}