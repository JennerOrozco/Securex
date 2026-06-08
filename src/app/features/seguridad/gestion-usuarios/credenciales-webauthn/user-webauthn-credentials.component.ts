import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-user-webauthn-credentials',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './user-webauthn-credentials.component.html',
})
export class UserWebauthnCredentials implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  credentials: any[] = [];
  loading = false;
  isSaving = false;

  columns: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'device_name', header: 'Dispositivo', type: 'text', sortable: true },
    { field: 'credential_id', header: 'Credential ID', type: 'text' },
    { field: 'created_at', header: 'Registrado', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.userService.getUserWebauthnCredentials().subscribe({
      next: (data: any) => {
        this.credentials = Array.isArray(data) ? data : (data?.data || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.userService.deleteUserWebauthnCredential(item.id).subscribe({
      next: () => {
        this.notificationService.success('Credencial WebAuthn eliminada');
        this.load();
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
        this.notificationService.showError('Error al eliminar la credencial');
      }
    });
  }
}
