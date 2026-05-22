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
    { field: 'user_uuid', header: 'Usuario UUID', type: 'text' },
    { field: 'event_type', header: 'Evento', type: 'badge', sortable: true },
    { field: 'description', header: 'Descripción', type: 'text' },
    { field: 'ip_address', header: 'IP', type: 'text' },
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
      },
      error: () => this.loading = false
    });
  }
}
