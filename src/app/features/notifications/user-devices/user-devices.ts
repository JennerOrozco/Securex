import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-user-devices',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  template: `
    <app-table-component title="Dispositivos de Usuario" subtitle="Dispositivos registrados para recibir notificaciones Push" 
      [columns]="cols" [data]="items" [loading]="loading" [showAdd]="false" [showEdit]="false" [showDelete]="true" 
      (onDelete)="handleDelete($event)">
    </app-table-component>

    <app-delete-modal [visible]="modalVisible" title="Eliminar Dispositivo"
      message="¿Estás seguro que deseas desvincular este dispositivo?"
      [loading]="isSaving" (onConfirm)="confirmDelete()" (onCancel)="modalVisible = false">
    </app-delete-modal>
  `
})
export class UserDevicesComponent implements OnInit {
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
    { field: 'company_name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'device_type', header: 'Tipo', type: 'text', sortable: true },
    { field: 'last_active', header: 'Última Actividad', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.devices');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.apiService.getUserDevicesGql().subscribe({
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

  handleDelete(item: any) { this.selectedItem = item; this.modalVisible = true; }

  confirmDelete() {
    this.isSaving = true;
    this.apiService.deleteUserDeviceGql(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Dispositivo eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
