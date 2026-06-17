import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AuditService } from '@core/services/audit.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-password-resets',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  providers: [DatePipe],
  templateUrl: './password-resets.component.html',
})
export class PasswordResetsComponent implements OnInit {
  private auditService = inject(AuditService);
  private datePipe = inject(DatePipe);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'token', header: 'Código OTP', type: 'text', sortable: true, style: { width: '110px', textAlign: 'center' } },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    // Lazy load from paginator
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'created_at');

    this.auditService.getPasswordResetsGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const items = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.data = items.map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid || '-',
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
    this.auditService.deletePasswordReset(item.id).subscribe({
      next: () => {
        this.notificationService.success('Registro eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
