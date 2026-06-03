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
  users: any[] = [];
  apps: any[] = [];
  currentAppId: number | null = null;
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [];

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'text', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'status', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;

    this.securexService.getUserAccess().subscribe({
      next: (res: any) => { this.records = res.data || res || []; this.loading = false; },
      error: () => this.loading = false
    });

    this.securexService.getUsers().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.users = data;
      }
    });

    this.securexService.getApps().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.apps = data;
        const currentApp = data.find((a: any) => a.uuid === this.configService.appUuid);
        this.currentAppId = currentApp ? currentApp.id : null;
      }
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.buildFormFields('add', () => {
      this.modalVisible = true;
    });
  }

  handleEdit(item: any) {
    this.modalMode = 'edit';
    this.selectedItem = { ...item };
    this.buildFormFields('edit', () => {
      this.modalVisible = true;
    });
  }

  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  private buildFormFields(mode: 'add' | 'edit', onReady: () => void) {
    const appOptions = this.apps.map((a: any) => ({ label: a.name, value: a.id }));
    const statusOptions = [
      { label: 'Aprobado', value: 'APPROVED' },
      { label: 'Pendiente', value: 'PENDING' },
      { label: 'Rechazado', value: 'REJECTED' }
    ];

    const userOptions = this.users.map((u: any) => ({ label: u.full_name || u.email, value: u.id }));

    const baseFields: FormField[] = [
      { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: userOptions },
      { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: appOptions, disabled: mode === 'add' },
    ];

    this.securexService.getCompanies().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        const appCompanies = data.filter((c: any) => c.app_id === this.currentAppId);
        const companyOptions = appCompanies.map((c: any) => ({ label: c.name, value: c.id }));
        const companyIds = appCompanies.map((c: any) => c.id);

        this.securexService.getBranches().subscribe({
          next: (branchRes: any) => {
            const branches = (branchRes.data || branchRes || []).filter((b: any) => companyIds.includes(b.company_id));
            const branchOptions = branches.map((b: any) => ({ label: b.name, value: b.id }));

            baseFields.push(
              { name: 'company_id', label: 'Compañía', type: 'select', required: false, options: companyOptions },
              { name: 'branch_id', label: 'Sucursal', type: 'select', required: false, options: branchOptions },
            );

            baseFields.push({ name: 'status', label: 'Estado', type: 'select', required: true, options: statusOptions });

            this.formFields = baseFields;
            onReady();
          },
          error: () => {
            baseFields.push({ name: 'status', label: 'Estado', type: 'select', required: true, options: statusOptions });
            this.formFields = baseFields;
            onReady();
          }
        });
      },
      error: () => {
        baseFields.push({ name: 'status', label: 'Estado', type: 'select', required: true, options: statusOptions });
        this.formFields = baseFields;
        onReady();
      }
    });
  }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add') {
      data.app_id = this.currentAppId;
    }
    const obs = this.modalMode === 'add'
      ? this.securexService.createUserAccess(data)
      : this.securexService.updateUserAccess(this.selectedItem.uuid, data);

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
    this.securexService.deleteUserAccess(this.selectedItem.uuid).subscribe({
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
