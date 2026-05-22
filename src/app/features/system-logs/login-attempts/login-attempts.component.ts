import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-login-attempts',
  standalone: true,
  imports: [CommonModule, TableComponent, DeleteModalComponent],
  providers: [DatePipe],
  templateUrl: './login-attempts.component.html',
  styleUrl: './login-attempts.component.css'
})
export class LoginAttempts implements OnInit {
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
    { field: 'email', header: 'Email', type: 'text', style: { width: '25%' }, sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text', style: { width: '15%' }, sortable: true },
    { field: 'user_agent', header: 'User Agent', type: 'text', style: { width: '25%' }, sortable: false },
    { field: 'successful', header: 'Exitoso', type: 'status', style: { width: '10%', textAlign: 'center' }, sortable: true, filterOptions: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }], filterOptionLabel: 'label' },
    { field: 'created_at', header: 'Fecha', type: 'text', style: { width: '15%' }, sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '10%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.system_logs.login_attempts');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getLoginAttempts().subscribe({
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
    this.securexService.deleteLoginAttempt(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Intento de acceso eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
