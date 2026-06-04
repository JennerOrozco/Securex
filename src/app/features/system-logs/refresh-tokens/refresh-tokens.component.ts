import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-refresh-tokens',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  providers: [DatePipe],
  templateUrl: './refresh-tokens.component.html',
  styleUrl: './refresh-tokens.component.css'
})
export class RefreshTokens implements OnInit {
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
    { field: 'user_name', header: 'Usuario', type: 'text', style: { width: '15%' }, sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', style: { width: '12%' }, sortable: true },
    { field: 'token_hash', header: 'Hash del Token', type: 'text', style: { width: '20%' }, sortable: false },
    { field: 'ip_address', header: 'IP', type: 'text', style: { width: '12%' }, sortable: true },
    { field: 'is_revoked', header: 'Revocado', type: 'status', style: { width: '10%', textAlign: 'center' }, sortable: true, filterOptions: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }], filterOptionLabel: 'label' },
    { field: 'issued_at', header: 'Emitido', type: 'text', style: { width: '12%' }, sortable: true },
    { field: 'expires_at', header: 'Expira', type: 'text', style: { width: '12%' }, sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '7%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.system_logs.refresh_tokens');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getRefreshTokensGql().subscribe({
      next: (res: any) => {
        this.data = (res || []).map((item: any) => ({
          ...item,
          user_name: item.user?.full_name || item.user_id,
          app_name: item.app?.name || item.app_id,
          issued_at: item.issued_at && item.issued_at !== '0000-00-00 00:00:00' ? this.datePipe.transform(item.issued_at, 'yyyy-MM-dd HH:mm:ss') : '-',
          expires_at: item.expires_at && item.expires_at !== '0000-00-00 00:00:00' ? this.datePipe.transform(item.expires_at, 'yyyy-MM-dd HH:mm:ss') : '-'
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
    this.securexService.deleteRefreshToken(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Token revocado/eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
