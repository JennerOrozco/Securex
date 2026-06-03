import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  template: `
    <app-table-component title="Historial de Notificaciones" subtitle="Registro de todas las notificaciones creadas" 
      [columns]="cols" [data]="items" [loading]="loading" [showAdd]="false" [showEdit]="false" [showDelete]="true" 
      (onDelete)="handleDelete($event)">
    </app-table-component>

    <app-delete-modal [visible]="modalVisible" title="Eliminar Notificación"
      message="¿Estás seguro que deseas eliminar este registro histórico?"
      [loading]="isSaving" (onConfirm)="confirmDelete()" (onClose)="modalVisible = false">
    </app-delete-modal>
  `
})
export class NotificationsListComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  items: any[] = [];
  loading = false;
  isSaving = false;
  modalVisible = false;
  selectedItem: any = null;

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
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getNotificationsHistoryGql().subscribe({
      next: (data: any) => {
        this.items = (data || []).map((item: any) => ({
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

  handleDelete(item: any) { this.selectedItem = item; this.modalVisible = true; }

  confirmDelete() {
    this.isSaving = true;
    this.apiService.deleteNotificationHistoryGql(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Notificación eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
