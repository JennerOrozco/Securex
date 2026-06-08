import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AuditService } from '@core/services/audit.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-login-attempts',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  providers: [DatePipe],
  templateUrl: './login-attempts.component.html',
})
export class LoginAttemptsComponent implements OnInit {
  private auditService = inject(AuditService);
  private datePipe = inject(DatePipe);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;

  cols: TableColumn[] = [
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text' },
    { field: 'success', header: 'Éxito', type: 'boolean', sortable: true },
    { field: 'user_agent', header: 'User Agent', type: 'text' },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.auditService.getLoginAttempts().subscribe({
      next: (res: any[]) => {
        this.data = (res || []).map((item: any) => ({
          ...item,
          created_at: item.created_at && item.created_at !== '0000-00-00 00:00:00'
            ? this.datePipe.transform(item.created_at, 'yyyy-MM-dd HH:mm:ss') : '-'
        }));
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.auditService.deleteLoginAttempt(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Intento de acceso eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
