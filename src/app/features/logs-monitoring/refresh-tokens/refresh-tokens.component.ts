import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AuditService } from '@core/services/audit.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';
import { parseLazyLoadEvent } from '@shared/utils/pagination-utils';

@Component({
  selector: 'app-refresh-tokens',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  providers: [DatePipe],
  templateUrl: './refresh-tokens.component.html',
})
export class RefreshTokensComponent implements OnInit {
  private auditService = inject(AuditService);
  private datePipe = inject(DatePipe);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;
  totalRecords = 0;

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'app_name', header: 'App', type: 'text', sortable: true },
    { field: 'token_hash', header: 'Token', type: 'text' },
    { field: 'is_revoked', header: 'Estado', type: 'badge', sortable: true,
      filterOptions: [{ label: 'Activo', value: 'Activo' }, { label: 'Inactivo', value: 'Inactivo' }], filterOptionLabel: 'label' },
    { field: 'expires_at', header: 'Expira', type: 'date', sortable: true },
    { field: 'created_at', header: 'Creado', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    // Lazy load from paginator
  }

  load(event?: any) {
    this.loading = true;

    const { page, limit, filter, sort } = parseLazyLoadEvent(event, 'id', { created_at: 'issued_at', user_name: null, app_name: null });

    this.auditService.getRefreshTokensGql(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const items = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.data = items.map((item: any) => ({
          ...item,
          user_name: item.user?.full_name || item.user?.uuid || item.user_id,
          app_name: item.app?.name || item.app_id,
          token_hash: item.token_hash ? `${item.token_hash.substring(0, 20)}...` : '-',
          is_revoked: item.is_revoked ? 'Inactivo' : 'Activo',
          created_at: item.issued_at && item.issued_at !== '0000-00-00 00:00:00'
            ? this.datePipe.transform(item.issued_at, 'yyyy-MM-dd HH:mm:ss') : '-',
          expires_at: item.expires_at && item.expires_at !== '0000-00-00 00:00:00'
            ? this.datePipe.transform(item.expires_at, 'yyyy-MM-dd HH:mm:ss') : '-'
        }));
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.auditService.deleteRefreshToken(item.id).subscribe({
      next: () => {
        this.notificationService.success('Token eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
