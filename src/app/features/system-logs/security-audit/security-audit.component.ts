import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-security-audit',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './security-audit.component.html',
  styleUrl: './security-audit.component.css'
})
export class SecurityAuditComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);

  logs: any[] = [];
  total = 0;
  loading = false;

  cols: TableColumn[] = [
    { field: 'user_uuid', header: 'Usuario UUID', type: 'text', sortable: true },
    { field: 'event_type', header: 'Evento', type: 'status', sortable: true, filterOptions: [], filterMulti: true },
    { field: 'description', header: 'Descripción', type: 'text', sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getSecurityAudit({ per_page: 100 }).subscribe({
      next: (res: any) => {
        const d = res.data || res;
        this.logs = d.data || d || [];
        this.total = d.total || 0;
        this.loading = false;

        const eventTypes = [...new Set(this.logs.map((l: any) => l.event_type).filter(Boolean))];
        const col = this.cols.find(c => c.field === 'event_type');
        if (col) {
          col.filterOptions = eventTypes.map((e: any) => ({ label: e, value: e }));
        }
      },
      error: () => this.loading = false
    });
  }
}
