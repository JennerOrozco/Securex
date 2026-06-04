import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-audit',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './security-audit.component.html',
})
export class SecurityAuditComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  logs: any[] = [];
  loading = false;
  isSaving = false;

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
    this.load();
  }

  load() {
    this.loading = true;
    this.securexService.getSecurityAuditLogs().subscribe({
      next: (data: any[]) => {
        this.logs = (data || []).map((item: any) => ({
          ...item,
          app_name: item.app?.name || item.app_uuid,
          company_name: item.company?.name || item.company_uuid || '-'
        }));
        this.loading = false;

        const eventTypes = [...new Set(this.logs.map((l: any) => l.event_type).filter(Boolean))];
        const col = this.cols.find((c) => c.field === 'event_type');
        if (col) col.filterOptions = eventTypes.map((e: any) => ({ label: e, value: e }));
      },
      error: () => (this.loading = false)
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.securexService.deleteSecurityAuditLog(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Log eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
