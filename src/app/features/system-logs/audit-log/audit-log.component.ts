import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';

@Component({
  selector: 'app-security-audit-log',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css'
})
export class AuditLogComponent implements OnInit {
  private securexService = inject(SecurexService);

  items: any[] = [];
  loading = false;

  cols: TableColumn[] = [
    { field: 'event_type', header: 'Evento', type: 'badge', sortable: true },
    { field: 'description', header: 'Descripción', type: 'text', sortable: true },
    { field: 'user_uuid', header: 'Usuario', type: 'text', sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text', sortable: true },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.securexService.getAuditLogs().subscribe({
      next: (res: any) => { this.items = res.data || res || []; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
