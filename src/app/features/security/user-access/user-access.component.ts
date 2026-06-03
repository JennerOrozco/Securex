import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { ConfigService } from '@core/services/config.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-user-access',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './user-access.component.html',
  styleUrl: './user-access.component.css'
})
export class UserAccessComponent implements OnInit {
  private securexService = inject(SecurexService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  records: any[] = [];
  loading = false;
  isSaving = false;
  currentAppId: number | null = null;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

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

  load() {
    this.loading = true;
    this.securexService.getUserAccessPageData().subscribe({
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

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.formFields = [
      { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: this.cachedUserOpts },
      { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: this.cachedAppOpts, disabled: true },
      { name: 'company_id', label: 'Compañía', type: 'select', required: false, options: this.cachedCompanyOpts },
      { name: 'branch_id', label: 'Sucursal', type: 'select', required: false, options: this.cachedBranchOpts },
      { name: 'status', label: 'Estado', type: 'select', required: true, options: this.statusOptions }
    ];
    this.modalVisible = true;
  }

  handleEdit(item: any) {
    this.modalMode = 'edit';
    this.selectedItem = { ...item };
    this.formFields = [
      { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: this.cachedUserOpts },
      { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: this.cachedAppOpts },
      { name: 'company_id', label: 'Compañía', type: 'select', required: false, options: this.cachedCompanyOpts },
      { name: 'branch_id', label: 'Sucursal', type: 'select', required: false, options: this.cachedBranchOpts },
      { name: 'status', label: 'Estado', type: 'select', required: true, options: this.statusOptions }
    ];
    this.modalVisible = true;
  }

  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add') {
      data.app_id = this.currentAppId;
    }
    const obs = this.modalMode === 'add'
      ? this.securexService.createUserAccessGql(data)
      : this.securexService.updateUserAccessGql(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${this.modalMode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserAccessGql(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Acceso eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
