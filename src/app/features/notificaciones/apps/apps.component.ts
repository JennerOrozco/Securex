import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-notifications-apps',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <app-table-component title="Aplicaciones" subtitle="Aplicaciones registradas en el servicio de notificaciones" 
      [columns]="cols" [data]="items" [loading]="loading" [showAdd]="false" [showEdit]="false" [showDelete]="false">
    </app-table-component>
  `
})
export class AppsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);

  items: any[] = [];
  loading = false;

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
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getAppsGql().subscribe({
      next: (res: any) => {
        this.items = (res || []).map((app: any) => ({
          ...app,
          status: app.is_active ? 'Activo' : 'Inactivo'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
