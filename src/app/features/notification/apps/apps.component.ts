import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';

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
export class AppsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);

  items: any[] = [];
  loading = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'text', sortable: true, style: { width: '10%' } },
    { field: 'name', header: 'Nombre', type: 'text', sortable: true, style: { width: '40%' } },
    { field: 'slug', header: 'Slug', type: 'text', sortable: true, style: { width: '35%' } },
    { field: 'status', header: 'Estado', type: 'status', sortable: true, style: { width: '15%' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.apps');
  }

  ngOnInit() {
    if (this.hasPermission) {
      // We don't call load() directly because the paginator triggers onLazyLoad on init.
    }
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'id');
    if (!event?.sortField && !event?.multiSortMeta) sort.direction = 'ASC';

    console.log(filter)
    this.apiService.getAppsGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.totalRecords = res?.total || 0;

        this.items = data.map((app: any) => ({
          ...app,
          status: app.is_active ? 'Activo' : 'Inactivo'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
