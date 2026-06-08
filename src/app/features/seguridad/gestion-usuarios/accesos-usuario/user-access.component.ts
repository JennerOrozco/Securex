import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UserService } from '@core/services/user.service';
import { ConfigService } from '@core/services/config.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-user-access',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './user-access.component.html',
})
export class UserAccessComponent implements OnInit {
  private userService = inject(UserService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  records: any[] = [];
  loading = false;
  isSaving = false;
  currentAppId: number | null = null;

  formFields: FormField[] = [];

  private cachedUserOpts: { label: string; value: any }[] = [];
  private cachedAppOpts: { label: string; value: any }[] = [];
  private cachedCompanyOpts: { label: string; value: any }[] = [];
  private cachedBranchOpts: { label: string; value: any }[] = [];
  private statusOptions = [
    { label: 'Aprobado', value: 'APPROVED' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Rechazado', value: 'REJECTED' }
  ];

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'status', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  private buildFormFields() {
    this.formFields = [
      { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: this.cachedUserOpts },
      { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: this.cachedAppOpts },
      { name: 'company_id', label: 'Compañía', type: 'select', required: false, options: this.cachedCompanyOpts },
      { name: 'branch_id', label: 'Sucursal', type: 'select', required: false, options: this.cachedBranchOpts },
      { name: 'status', label: 'Estado', type: 'select', required: true, options: this.statusOptions }
    ];
  }

  load() {
    this.loading = true;
    this.userService.getUserAccessPageData().subscribe({
      next: (data) => {
        const { userAccesses, users, apps, companies, branches } = data;

        this.records = (userAccesses || []).map((item: any) => ({
          ...item,
          user_name: item.user?.full_name || item.user_id,
          app_name: item.app?.name || item.app_id
        }));

        this.cachedUserOpts = (users || []).map((u: any) => ({ label: u.full_name || u.email, value: u.id }));
        this.cachedAppOpts = (apps || []).map((a: any) => ({ label: a.name, value: a.id }));

        const currentApp = (apps || []).find((a: any) => a.uuid === this.configService.appUuid);
        this.currentAppId = currentApp ? currentApp.id : null;

        const appCompanies = (companies || []).filter((c: any) => c.app_id === this.currentAppId);
        this.cachedCompanyOpts = appCompanies.map((c: any) => ({ label: c.name, value: c.id }));

        const companyIds = appCompanies.map((c: any) => c.id);
        this.cachedBranchOpts = (branches || [])
          .filter((b: any) => companyIds.includes(b.company_id))
          .map((b: any) => ({ label: b.name, value: b.id }));

        this.buildFormFields();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    if (e.mode === 'add') {
      e.data.app_id = this.currentAppId;
    }
    const obs = e.mode === 'add'
      ? this.userService.createUserAccessGql(e.data)
      : this.userService.updateUserAccessGql(e.data.uuid, e.data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${e.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.userService.deleteUserAccessGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Acceso eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
