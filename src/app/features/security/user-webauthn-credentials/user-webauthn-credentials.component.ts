import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-user-webauthn-credentials',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  templateUrl: './user-webauthn-credentials.component.html',
  styleUrl: './user-webauthn-credentials.component.css'
})
export class UserWebauthnCredentials implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  credentials: any[] = [];
  loading = false;
  isSaving = false;
  modalVisible = false;
  selectedItem: any = null;

  columns: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'device_name', header: 'Dispositivo', type: 'text', sortable: true },
    { field: 'credential_id', header: 'Credential ID', type: 'text' },
    { field: 'sign_count', header: 'Usos', type: 'text', sortable: true },
    { field: 'created_at', header: 'Registrado', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.securexService.getUserWebauthnCredentials().subscribe({
      next: (data: any) => {
        this.credentials = Array.isArray(data) ? data : (data?.data || []);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  handleDelete(item: any) {
    this.selectedItem = item;
    this.modalVisible = true;
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserWebauthnCredential(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Credencial WebAuthn eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
        this.notificationService.showError('Error al eliminar la credencial');
      }
    });
  }
}
