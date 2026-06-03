import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-password-resets',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  providers: [DatePipe],
  templateUrl: './password-resets.component.html',
  styleUrl: './password-resets.component.css'
})
export class PasswordResets implements OnInit {
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
    { field: 'email', header: 'Email', type: 'text', style: { width: '45%' }, sortable: true },
    { field: 'token', header: 'Token', type: 'text', style: { width: '30%' }, sortable: false },
    { field: 'created_at', header: 'Fecha de Solicitud', type: 'date', style: { width: '15%' }, sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '10%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.system_logs.password_resets');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getPasswordResets().subscribe({
      next: (res: any) => {
        const rawData = (res.data || res || []);
        this.data = rawData.map((item: any) => ({
          ...item,
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
    this.securexService.deletePasswordReset(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Solicitud de reseteo eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
