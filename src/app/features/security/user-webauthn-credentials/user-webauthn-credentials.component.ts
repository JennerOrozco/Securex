import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-webauthn-credentials',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  providers: [DatePipe],
  templateUrl: './user-webauthn-credentials.component.html',
  styleUrl: './user-webauthn-credentials.component.css'
})
export class UserWebauthnCredentials implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private datePipe = inject(DatePipe);

  data: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'delete' = 'delete';
  selectedItem: any = null;

  cols: TableColumn[] = [
    { field: 'user_email', header: 'Usuario / Email', type: 'text', style: { width: '30%' }, sortable: true },
    { field: 'device_name', header: 'Dispositivo', type: 'text', style: { width: '25%' }, sortable: true },
    { field: 'sign_count', header: 'Uso (Sign Count)', type: 'text', style: { width: '15%' }, sortable: true },
    { field: 'created_at', header: 'Fecha Registro', type: 'text', style: { width: '20%' }, sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '10%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.webauthn');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getUserWebauthnCredentials().subscribe({
      next: (res: any) => {
        const rawData = (res.data || res || []);
        this.data = rawData.map((item: any) => ({
          ...item,
          user_email: item.email || item.user_uuid, // Backend might return email or user_uuid
          created_at: item.created_at && item.created_at !== '0000-00-00 00:00:00' ? this.datePipe.transform(item.created_at, 'yyyy-MM-dd HH:mm:ss') : '-'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleDelete(data: any) {
    this.modalMode = 'delete';
    this.selectedItem = data;
    this.modalVisible = true;
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserWebauthnCredential(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Credencial eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
