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
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './component.html',
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

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.userService.getUserAccessPageData().subscribe({
      next: (res) => {
        this.users     = res.users     || [];
        this.apps      = res.apps      || [];
        this.companies = res.companies || [];
        this.branches  = res.branches  || [];

        this.accesses = (res.userAccesses || []).map((a: any) => ({
          ...a,
          user_name:    a.user?.full_name || a.user?.name || '-',
          user_email:   a.user?.email     || '-',
          app_name:     a.app?.name       || '-',
          company_name: a.company?.name   || '-',
          branch_name:  a.branch?.name    || 'Todas',
          role_name:    a.role?.name      || '-',
          status:       (a.status || 'PENDING').toString().toUpperCase()
        }));

        // Resolver compañía activa del usuario logueado
        const currentCompany = this.authService.currentCompany();
        const matchedCompany = this.companies.find(c => c.uuid === currentCompany?.uuid);

        // Establecer datos pre-cargados para el formulario
        if (matchedCompany) {
          this.buildInitialData(matchedCompany);
        } else {
          this.refreshFormOptions([]);
          this.loading = false;
        }
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
        next: () => this.handleSuccess('Acceso creado'),
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
    this.load();
    this.isSaving = false;
  }
}
