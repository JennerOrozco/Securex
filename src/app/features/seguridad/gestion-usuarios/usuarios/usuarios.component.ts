import { Component, OnInit, inject } from '@angular/core';
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
  templateUrl: './usuarios.component.html',
})
export class SecurityUserCrudComponent implements OnInit {
  private userService         = inject(UserService);
  private notificationService = inject(NotificationService);
  private authService         = inject(AuthService);
  private roleService         = inject(RoleService);
  private router              = inject(Router);

  accesses:  any[] = [];
  users:     any[] = [];
  apps:      any[] = [];
  companies: any[] = [];
  branches:  any[] = [];

  loading  = false;
  isSaving = false;
  totalRecords = 0;

  resetModalVisible = false;
  resetModalItem: any = null;
  resetModalLoading = false;

  /** Flag to load form reference data only once */
  private formDataLoaded = false;

  /** Datos pre-cargados para el formulario de NUEVO acceso */
  formInitialData: any = {};

  formFields: FormField[] = [
    {
      name: 'user_id', label: 'Usuario', type: 'select-grid', required: true, options: [],
      icon: 'pi pi-user',
      placeholder: 'Buscar usuario por nombre o correo...',
      columns: [
        { field: 'email',  header: 'Correo', width: '220px', icon: 'pi pi-envelope' }
      ]
    },
    { name: 'app_id',     label: 'Aplicación', type: 'select', required: true,  options: [], disabled: true, icon: 'pi pi-th-large'    },
    { name: 'company_id', label: 'Compañía',   type: 'select', required: true,  options: [], disabled: true, icon: 'pi pi-building'    },
    { name: 'branch_id',  label: 'Sucursal',   type: 'select', required: false, options: [],               icon: 'pi pi-map-marker'  },
    { name: 'role_id',    label: 'Rol',        type: 'select', required: true,  options: [],               icon: 'pi pi-id-card'     },
    { name: 'status',     label: 'Estado',     type: 'select', required: true,  options: [
      { label: 'Pendiente', value: 'PENDING'  },
      { label: 'Aprobado',  value: 'APPROVED' },
      { label: 'Rechazado', value: 'REJECTED' }
    ], icon: 'pi pi-check-circle' }
  ];

  cols: TableColumn[] = [
    { field: 'user_name',    header: 'Usuario',    type: 'user',  subField: 'user_email', sortable: true },
    { field: 'app_name',     header: 'Aplicación', type: 'text',  sortable: true },
    { field: 'company_name', header: 'Compañía',   type: 'text',  sortable: true },
    { field: 'branch_name',  header: 'Sucursal',   type: 'text',  sortable: true },
    { field: 'role_name',    header: 'Rol',        type: 'role',  sortable: true },
    { field: 'status',       header: 'Estado',     type: 'badge', sortable: true,
      filterOptions: [
        { label: 'Aprobado',  value: 'APPROVED' },
        { label: 'Pendiente', value: 'PENDING'  },
        { label: 'Rechazado', value: 'REJECTED' }
      ], filterOptionLabel: 'label' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  /** Mapea un item para edición asegurando que los selects reciban IDs correctos */
  mapItemForEdit = (item: any) => ({
    ...item,
    user_id:    item.user_id,
    app_id:     item.app_id,
    company_id: item.company_id,
    branch_id:  item.branch_id ?? null,
    role_id:    item.role_id,
    status:     item.status
  });

  ngOnInit() {
    this.loadFormData();
    this.loadAccesses();
  }

  /** Load form reference data once */
  private loadFormData() {
    if (this.formDataLoaded) return;
    this.formDataLoaded = true;

    this.userService.getUserAccessPageData().subscribe({
      next: (res) => {
        this.users     = res.users?.data     ?? [];
        this.apps      = res.apps?.data      ?? [];
        this.companies = res.companies?.data ?? [];
        this.branches  = res.branches?.data  ?? [];

        const currentCompany = this.authService.currentCompany();
        const matchedCompany = this.companies.find(c => c.uuid === currentCompany?.uuid);
        if (matchedCompany) {
          this.buildInitialData(matchedCompany);
        } else {
          this.refreshFormOptions([]);
        }
      }
    });
  }

  /** Paginated load of user accesses */
  loadAccesses(event?: any) {
    this.loading = true;
    const { page, limit, filter, sort } = parseLazyLoadEvent(event);

    this.userService.getUserAccessesPaginated(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        const { data, total } = extractPaginatedData(res, (a: any) => ({
          ...a,
          user_name:    a.user?.full_name || a.user?.name || '-',
          user_email:   a.user?.email     || '-',
          app_name:     a.app?.name       || '-',
          company_name: a.company?.name   || '-',
          branch_name:  a.branch?.name    || 'Todas',
          role_name:    a.role?.name      || '-',
          status:       (a.status || 'PENDING').toString().toUpperCase()
        }));
        this.accesses = data;
        this.totalRecords = total;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  /**
   * Construye los datos iniciales del formulario y carga los roles
   * filtrados por la compañía activa del usuario logueado.
   */
  private buildInitialData(matchedCompany: any) {
    const currentCompany = this.authService.currentCompany();

    this.formInitialData = {
      app_id:     matchedCompany.app_id ?? null,
      company_id: matchedCompany.id,
      status:     'APPROVED'
    };

    // Sucursales filtradas por la compañía del usuario
    const filteredBranches = this.branches.filter(b => b.company_id === matchedCompany.id);

    // Roles filtrados por compañía via query dedicada (rolesByCompany)
    const rolesObs = (matchedCompany.app_id && currentCompany?.uuid)
      ? this.roleService.getRolesByCompany(matchedCompany.app_id, currentCompany.uuid)
          .pipe(catchError(() => of([])))
      : of([]);

    rolesObs.subscribe({
      next: (roles: any[]) => {
        this.refreshFormOptions(roles, filteredBranches);
        this.loading = false;
      },
      error: () => {
        this.refreshFormOptions([]);
        this.loading = false;
      }
    });
  }

  private refreshFormOptions(roles: any[], filteredBranches?: any[]) {
    const branches = filteredBranches ?? this.branches;
    this.formFields = this.formFields.map((f) => {
      if (f.name === 'user_id')    return { ...f, options: this.users.map(u => ({ label: u.full_name, email: u.email, value: u.id })) };
      if (f.name === 'app_id')     return { ...f, options: this.apps.map(a => ({ label: a.name, value: a.id })) };
      if (f.name === 'company_id') return { ...f, options: this.companies.map(c => ({ label: c.name, value: c.id })) };
      if (f.name === 'branch_id')  return { ...f, options: [{ label: 'Todas (Sin Sucursal)', value: null }, ...branches.map(b => ({ label: b.name, value: b.id }))] };
      if (f.name === 'role_id')    return { ...f, options: roles.map(r => ({ label: r.name, value: r.id })) };
      return f;
    });
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const { mode, data } = e;
    const payload = {
      user_id:    data.user_id    != null ? Number(data.user_id)    : undefined,
      app_id:     data.app_id     != null ? Number(data.app_id)     : undefined,
      company_id: data.company_id != null ? Number(data.company_id) : null,
      branch_id:  data.branch_id  != null ? Number(data.branch_id)  : null,
      role_id:    data.role_id    != null ? Number(data.role_id)    : undefined,
      status:     data.status
    };

    if (mode === 'add') {
      this.userService.createUserAccessGql(payload).subscribe({
        next: () => {
          this.handleSuccess('Acceso creado');
          this.sendInvitationForNewAccess(data);
        },
        error: () => (this.isSaving = false)
      });
    } else {
      this.userService.updateUserAccessGql(data.uuid, payload).subscribe({
        next: () => this.handleSuccess('Acceso actualizado'),
        error: () => (this.isSaving = false)
      });
    }
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
      .find(f => f.name === 'user_id')?.options
      ?.find((o: any) => o.value === data.user_id);
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
    const email = item?.user_email;
    if (!email) {
      this.notificationService.notify('warn', 'No se encontró el correo del usuario.');
      return;
    }
    this.resetModalItem = item;
    this.resetModalVisible = true;
  }

  confirmResetPassword() {
    if (!this.resetModalItem) return;
    const email = this.resetModalItem.user_email;
    this.resetModalLoading = true;
    this.authService.adminResetUserPassword(email).subscribe({
      next: (res: any) => {
        this.resetModalLoading = false;
        this.resetModalVisible = false;
        this.resetModalItem = null;
        if (res.success) {
          this.notificationService.success(`Código de restablecimiento enviado a ${email}`);
        } else {
          this.notificationService.notify('error', res.error || 'No se pudo enviar el código.');
        }
      },
      error: () => {
        this.resetModalLoading = false;
        this.notificationService.notify('error', 'Error al enviar el código de restablecimiento.');
      }
    });
  }

  closeResetModal() {
    this.resetModalVisible = false;
    this.resetModalItem = null;
  }
}
