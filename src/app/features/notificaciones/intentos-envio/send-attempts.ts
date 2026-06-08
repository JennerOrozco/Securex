import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-send-attempts',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      title="Intentos de Envío de Notificaciones"
      subtitle="Registro de intentos y control de límites (Rate Limiting)"
      [columns]="cols"
      [data]="items"
      [loading]="loading"
      [showAdd]="false"
      [showEdit]="false"
      [showDelete]="true"
      deleteTitle="Eliminar Intento"
      deleteMessage="¿Estás seguro que deseas eliminar este registro?"
      [isSaving]="isSaving"
      (onConfirmDelete)="confirmDelete($event)"
      (onRefresh)="load()">
    </app-crud-page>
  `
})
export class SendAttemptsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  loading = false;
  isSaving = false;

  cols: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'company_name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'ip_address', header: 'Dirección IP', type: 'text', sortable: true },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.send-attempts');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getSendAttemptsGql().subscribe({
      next: (data: any) => {
        this.items = (data || []).map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid,
          user_name: item.user?.full_name || item.user_uuid,
          company_name: item.company?.name || item.company_uuid
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.apiService.deleteSendAttemptGql(item.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registro eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
