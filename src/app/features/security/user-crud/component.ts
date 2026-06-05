import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './component.html',
})
export class SecurityUserCrudComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  accesses: any[] = [];
  users: any[] = [];
  apps: any[] = [];
  companies: any[] = [];
  branches: any[] = [];
  roles: any[] = [];

  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'user_id', label: 'Usuario', type: 'select', required: true, options: [] },
    { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: [], disabled: true },
    { name: 'company_id', label: 'Compañía', type: 'select', required: true, options: [] },
    { name: 'branch_id', label: 'Sucursal', type: 'select', options: [] },
    { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [] },
    { name: 'status', label: 'Estado', type: 'select', required: true, options: [
      { label: 'Pendiente', value: 'PENDING' },
      { label: 'Aprobado', value: 'APPROVED' },
      { label: 'Rechazado', value: 'REJECTED' }
    ] }
  ];

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'user', subField: 'user_email', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'company_name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'branch_name', header: 'Sucursal', type: 'text', sortable: true },
    { field: 'role_name', header: 'Rol', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'status', sortable: true,
      filterOptions: [
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], filterOptionLabel: 'label' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.securexService.getUserAccessPageData().subscribe({
      next: (res) => {
        this.users     = res.users     || [];
        this.apps      = res.apps      || [];
        this.companies = res.companies || [];
        this.branches  = res.branches  || [];
        this.roles     = this.rolesFromAccesses(res.userAccesses);

        this.accesses = (res.userAccesses || []).map((a: any) => ({
          ...a,
          user_name:    a.user?.full_name  || a.user?.name || '-',
          user_email:   a.user?.email      || '-',
          app_name:     a.app?.name        || '-',
          company_name: a.company?.name    || '-',
          branch_name:  a.branch?.name     || 'Todas',
          role_name:    a.role?.name       || '-',
          status:       (a.status || 'PENDING').toString().toUpperCase()
        }));
        this.refreshFormOptions();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  private rolesFromAccesses(accesses: any[]): any[] {
    const seen = new Map<number, any>();
    for (const a of accesses || []) {
      if (a.role?.id && !seen.has(a.role.id)) {
        seen.set(a.role.id, a.role);
      }
    }
    return Array.from(seen.values());
  }

  private refreshFormOptions() {
    this.formFields = this.formFields.map((f) => {
      if (f.name === 'user_id')   return { ...f, options: this.users.map((u) => ({ label: `${u.full_name} (${u.email})`, value: u.id })) };
      if (f.name === 'app_id')    return { ...f, options: this.apps.map((a) => ({ label: a.name, value: a.id })) };
      if (f.name === 'company_id')return { ...f, options: this.companies.map((c) => ({ label: c.name, value: c.id })) };
      if (f.name === 'branch_id') return { ...f, options: [{ label: 'Todas (Sin Sucursal)', value: null }, ...this.branches.map((b) => ({ label: b.name, value: b.id }))] };
      if (f.name === 'role_id')   return { ...f, options: this.roles.map((r) => ({ label: r.name, value: r.id })) };
      return f;
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
  }

  handleEdit(item: any) {
    this.modalMode = 'edit';
    this.selectedItem = { ...item };
    this.modalVisible = true;
  }

  handleDelete(item: any) {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    const payload = {
      user_id:    data.user_id    != null ? Number(data.user_id)    : undefined,
      app_id:     data.app_id     != null ? Number(data.app_id)     : undefined,
      company_id: data.company_id != null ? Number(data.company_id) : null,
      branch_id:  data.branch_id  != null ? Number(data.branch_id)  : null,
      role_id:    data.role_id    != null ? Number(data.role_id)    : undefined,
      status:     data.status
    };

    if (this.modalMode === 'add') {
      this.securexService.createUserAccessGql(payload).subscribe({
        next: () => this.handleSuccess('Acceso creado'),
        error: () => (this.isSaving = false)
      });
    } else {
      this.securexService.updateUserAccessGql(this.selectedItem.uuid, payload).subscribe({
        next: () => this.handleSuccess('Acceso actualizado'),
        error: () => (this.isSaving = false)
      });
    }
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserAccessGql(this.selectedItem.uuid).subscribe({
      next: () => this.handleSuccess('Acceso eliminado'),
      error: () => (this.isSaving = false)
    });
  }

  private handleSuccess(msg: string) {
    this.notificationService.notify('success', msg);
    this.load();
    this.modalVisible = false;
    this.isSaving = false;
  }
}
