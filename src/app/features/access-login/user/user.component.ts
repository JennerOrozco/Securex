import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { ResetPasswordModalComponent } from '@shared/modals/modal-shell/reset-password-modal/reset-password-modal.component';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, ResetPasswordModalComponent],
  templateUrl: './user.component.html',
})
export class SecurityUserCrudComponent {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private router = inject(Router);

  accesses: any[] = [];
  users: any[] = [];
  apps: any[] = [];
  companies: any[] = [];
  branches: any[] = [];

  loading = false;
  isSaving = false;
  totalRecords = 0;

  resetModalVisible = false;
  resetModalItem: any = null;

  /** Datos pre-cargados para el formulario de NUEVO acceso */
  formInitialData: any = {};

  formFields: FormField[] = [
    {
      // name = flat FormControl key; dataPath = where to read value from the data object on edit
      name: 'user_uuid', label: 'Usuario', type: 'select-grid', required: true, options: [], dataPath: 'user.uuid', icon: 'pi pi-user', placeholder: '- Seleccionar Usuario por nombre o correo -',
      columns: [
        { field: 'email', header: 'Correo', width: '220px', icon: 'pi pi-envelope' }
      ]
    },
    { name: 'app_uuid', label: 'Aplicación', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-th-large', dataPath: 'app.uuid' },
    { name: 'company_uuid', label: 'Compañía', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-building', dataPath: 'company.uuid' },
    { name: 'branch_uuid', label: 'Sucursal', type: 'select', required: false, options: [], icon: 'pi pi-map-marker', dataPath: 'branch.uuid', placeholder: '- Seleccionar Sucursal -' },
    { name: 'role_uuid', label: 'Rol', type: 'select', required: true, options: [], icon: 'pi pi-id-card', dataPath: 'role.uuid', placeholder: '- Seleccionar Rol -' },
    {
      name: 'status', label: 'Estado', type: 'select', required: true, options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], icon: 'pi pi-check-circle', placeholder: '- Seleccionar Estado -'
    }
  ];

  cols: TableColumn[] = [
    { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', sortable: true },
    { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'company.name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'branch.name', header: 'Sucursal', type: 'text', sortable: true },
    { field: 'role.name', header: 'Rol', type: 'role', sortable: true },
    {
      field: 'status', header: 'Estado', type: 'badge', sortable: true,
      filterOptions: [
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], filterOptionLabel: 'label'
    },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];


  private ensureFormData(callback: () => void): void {
    if (this.users.length > 0) {
      callback();
      return;
    }

    this.userService.getUserAccessPageData().subscribe({
      next: (res) => {
        this.users = res.users?.data ?? [];
        this.apps = res.apps?.data ?? [];
        this.companies = res.companies?.data ?? [];
        this.branches = res.branches?.data ?? [];

        const currentCompany = this.authService.currentCompany();
        const matchedCompany = this.companies.find(c => c.uuid === currentCompany?.uuid);

        if (matchedCompany) {
          this.formInitialData = {
            app_uuid: matchedCompany.uuid ?? null,
            company_uuid: matchedCompany.uuid,
            status: 'APPROVED'
          };
          const filteredBranches = this.branches.filter(b => b.company_id === matchedCompany.id);

          this.roleService.getRolesByCompany(matchedCompany.app_id, currentCompany!.uuid!)
            .pipe(catchError(() => of([])))
            .subscribe({
              next: (roles) => {
                this.refreshFormOptions(roles, filteredBranches);
                callback();
              },
              error: () => callback()
            });
        } else {
          this.refreshFormOptions([]);
          callback();
        }
      },
      error: () => callback()
    });
  }

  /** Paginated load of user accesses */
  loadAccesses(event?: any) {
    this.loading = true;
    const { page, limit, filter, sort } = parseLazyLoadEvent(event);

    this.userService.getUserAccessesPaginated(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const { data, total } = extractPaginatedData(res);
        this.accesses = data;
        this.totalRecords = total;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  handleAdd(): void {
    this.ensureFormData(() => { });
  }

  handleEdit(_item: any): void {
    this.ensureFormData(() => { });
  }

  private refreshFormOptions(roles: any[], filteredBranches?: any[]) {
    const branches = filteredBranches ?? this.branches;
    const optionsMap: Record<string, any[]> = {
      user_uuid: this.users.map(u => ({ label: u.full_name, email: u.email, value: u.uuid })),
      app_uuid: this.apps.map(a => ({ label: a.name, value: a.uuid })),
      company_uuid: this.companies.map(c => ({ label: c.name, value: c.uuid })),
      branch_uuid: [{ label: 'Todas (Sin Sucursal)', value: null }, ...branches.map(b => ({ label: b.name, value: b.uuid }))],
      role_uuid: roles.map(r => ({ label: r.name, value: r.uuid }))
    };
    this.formFields = this.formFields.map(f =>
      optionsMap[f.name] ? { ...f, options: optionsMap[f.name] } : f
    );
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const { mode, data } = e;

    const payload = {
      user_uuid: data.user_uuid ?? undefined,
      app_uuid: data.app_uuid ?? undefined,
      company_uuid: data.company_uuid ?? null,
      branch_uuid: data.branch_uuid ?? null,
      role_uuid: data.role_uuid ?? undefined,
      status: data.status
    };

    const request$ = mode === 'add'
      ? this.userService.createUserAccessGql(payload)
      : this.userService.updateUserAccessGql(data.uuid, payload);

    request$.subscribe({
      next: () => {
        this.handleSuccess(mode === 'add' ? 'Acceso creado' : 'Acceso actualizado');
        if (mode === 'add') this.sendInvitationForNewAccess(data);
      },
      error: () => (this.isSaving = false)
    });
  }


  confirmDelete(item: any) {
    this.isSaving = true;
    this.userService.deleteUserAccessGql(item.uuid).subscribe({
      next: () => this.handleSuccess('Acceso eliminado'),
      error: () => (this.isSaving = false)
    });
  }

  onSelectGridEmptyFilter() {
    this.notificationService.notify('info', 'Crea el usuario desde "Usuarios (Admin)" y luego asígnalo aquí.');
    this.router.navigate(['/security/admin-users']);
  }

  private handleSuccess(msg: string) {
    this.notificationService.notify('success', msg);
    this.loadAccesses();
    this.isSaving = false;
  }

  private sendInvitationForNewAccess(data: any) {
    const userOption: any = this.formFields
      .find(f => f.name === 'user_uuid')?.options
      ?.find((o: any) => o.value === data.user_uuid);
    const email = userOption?.email;
    if (!email) {
      this.notificationService.notify('warn', 'No se encontró el email del usuario para enviar la invitación.');
      return;
    }
    this.authService.adminResetUserPassword(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notificationService.success(`Código de invitación enviado a ${email}`);
        } else {
          this.notificationService.notify('error', res.error || 'No se pudo enviar la invitación.');
        }
      },
      error: (err: any) => {
        this.notificationService.notify('error', `Error al enviar invitación: ${err?.message || 'Error de conexión'}`);
      }
    });
  }

  handleResetPassword(item: any) {
    const email = item?.user?.email;
    if (!email) {
      this.notificationService.notify('warn', 'No se encontró el correo del usuario.');
      return;
    }
    this.resetModalItem = item;
    this.resetModalVisible = true;
  }

  closeResetModal() {
    this.resetModalVisible = false;
    this.resetModalItem = null;
  }
}
