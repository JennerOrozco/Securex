import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-password-resets',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  providers: [DatePipe],
  templateUrl: './password-resets.component.html',
})
export class PasswordResetsComponent implements OnInit {
  private securexService = inject(SecurexService);
  private datePipe = inject(DatePipe);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;

  cols: TableColumn[] = [
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'ip_address', header: 'IP', type: 'text' },
    { field: 'status', header: 'Estado', type: 'status', sortable: true,
      filterOptions: [{ label: 'Activo', value: 1 }, { label: 'Inactivo', value: 0 }], filterOptionLabel: 'label' },
    { field: 'created_at', header: 'Fecha', type: 'date', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.securexService.getPasswordResets().subscribe({
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
    this.securexService.deletePasswordReset(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Registro eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
