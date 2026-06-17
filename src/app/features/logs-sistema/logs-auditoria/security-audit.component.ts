import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AuditService } from '@core/services/audit.service';
import { NotificationService } from '@core/services/notification.service';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-security-audit',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './security-audit.component.html',
})
export class SecurityAuditComponent implements OnInit {
  private auditService = inject(AuditService);
  private notificationService = inject(NotificationService);

  logs: any[] = [];
  loading = false;
  isSaving = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'company_name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'event_type', header: 'Evento', type: 'status', sortable: true, filterOptions: [], filterMulti: true },
    { field: 'description', header: 'Descripción', type: 'text', sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    // Lazy load from paginator
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'created_at');

    this.auditService.getSecurityAuditLogs(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.logs = data.map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid,
          company_name: item.company?.name || item.company_uuid || '-'
        }));

        const eventTypes = [...new Set(data.map((l: any) => l.event_type).filter(Boolean))];
        const col = this.cols.find((c) => c.field === 'event_type');
        if (col) col.filterOptions = eventTypes.map((e: any) => ({ label: e, value: e }));
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.auditService.deleteSecurityAuditLog(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Log eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
