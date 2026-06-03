import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '@shared/table-component/table-component.component';
import { TableColumn } from '@shared/table-component/table.types';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './admin-access.component.html',
  styleUrl: './admin-access.component.css'
})
export class AdminAccessComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  tableData: any[] = [];
  apps: any[] = [];
  companies: any[] = [];
  branches: any[] = [];
  roles: any[] = [];
  users: any[] = [];
  accessRecords: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  preselectedCompanyId: number | null = null;

  formFields: FormField[] = [
    { name: 'user_id',    label: 'Usuario',     type: 'select', required: true,  options: [] },
    { name: 'app_id',     label: 'Aplicación',  type: 'select', required: true,  options: [] },
    { name: 'company_id', label: 'Compañía',    type: 'select', required: true,  options: [] },
    { name: 'branch_id',  label: 'Sucursal',    type: 'select', options: [] },
    { name: 'role_id',    label: 'Rol',         type: 'select', required: true,  options: [] },
    { name: 'status',     label: 'Estado',      type: 'select', required: true,
      options: [{ label: 'Activo', value: 'active' }, { label: 'Inactivo', value: 'inactive' }]
    }
  ];

  cols: TableColumn[] = [
    { field: 'user_name',   header: 'Usuario',   type: 'text',    sortable: true },
    { field: 'role_name',   header: 'Rol',       type: 'text',    sortable: true },
    { field: 'branch_name', header: 'Sucursal',  type: 'text',    sortable: true },
    { field: 'app_name',    header: 'App',       type: 'text',    sortable: true },
    { field: 'status',      header: 'Estado',    type: 'status',  sortable: true },
    { field: 'actions',     header: 'Acciones',  type: 'actions', style: { width: '8rem', 'text-align': 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.users');
  }

  get activeCount(): number { return this.accessRecords.filter(a => a.status === 'active').length; }
  get inactiveCount(): number { return this.accessRecords.filter(a => a.status === 'inactive').length; }

  ngOnInit() {
    if (this.hasPermission) {
      this.loadDependencies();
    }
  }

  private loadDependencies() {
    forkJoin({
      users:    this.securexService.getAdminUsers({ per_page: 200 }),
      apps:     this.securexService.getApps(),
      companies: this.securexService.getCompanies(),
      roles:    this.securexService.getRoles(),
      branches: this.securexService.getBranches()
    }).subscribe({
      next: (results: any) => {
        const ud = results.users.data || results.users;
        this.users     = ud.data || ud || [];
        this.apps      = results.apps.data      || results.apps      || [];
        this.companies = results.companies.data || results.companies || [];
        this.roles     = results.roles.data     || results.roles     || [];
        this.branches  = results.branches.data  || results.branches  || [];

        const uf = this.formFields.find(f => f.name === 'user_id')!;
        uf.options = this.users.map((u: any) => ({ label: `${u.full_name} (${u.email})`, value: u.id }));

        const af = this.formFields.find(f => f.name === 'app_id')!;
        af.options = this.apps.map((a: any) => ({ label: a.name, value: a.id }));

        const cf = this.formFields.find(f => f.name === 'company_id')!;
        cf.options = this.companies.map((c: any) => ({ label: c.name, value: c.id }));

        const rf = this.formFields.find(f => f.name === 'role_id')!;
        rf.options = this.roles.map((r: any) => ({ label: r.name, value: r.id }));

        const bf = this.formFields.find(f => f.name === 'branch_id')!;
        bf.options = this.branches.map((b: any) => ({ label: b.name, value: b.id }));

        this.load();
      },
      error: () => (this.loading = false)
    });
  }

  load() {
    this.loading = true;
    this.securexService.getAdminAccess().subscribe({
      next: (res: any) => {
        const raw = res.data || res || [];
        this.accessRecords = raw.map((r: any) => ({
          ...r,
          user_name:    r.user?.full_name  || r.user?.name || '-',
          app_name:     r.app?.name        || '-',
          company_name: r.company?.name    || '-',
          branch_name:  r.branch?.name     || '-',
          role_name:    r.role?.name       || '-',
          status:       r.status           || 'inactive'
        }));
        this.tableData = [...this.accessRecords];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = null;
    this.modalVisible = true;
  }

  handleAddChild(companyId: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = companyId;
    this.modalVisible = true;
  }

  handleEdit(item: any) {
    this.modalMode = 'edit';
    this.selectedItem = {
      user_id:    item.user_id,
      app_id:     item.app_id,
      company_id: item.company_id,
      branch_id:  item.branch_id,
      role_id:    item.role_id,
      status:     item.status,
      uuid:       item.uuid
    };
    this.modalVisible = true;
  }

  handleDelete(item: any) {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securexService.assignAdminAccess(data)
      : this.securexService.updateAdminAccess(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${this.modalMode === 'add' ? 'asignado' : 'actualizado'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.removeAdminAccess(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Acceso eliminado');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
