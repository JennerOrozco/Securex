import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { ConfigService } from '@core/services/config.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-security-user-access',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './user-access.component.html',
})
export class UserAccessComponent implements OnInit {
  private userService         = inject(UserService);
  private roleService         = inject(RoleService);
  private configService       = inject(ConfigService);
  private authService         = inject(AuthService);
  private notificationService = inject(NotificationService);

  records: any[]            = [];
  loading                   = false;
  isSaving                  = false;
  currentAppId:     number | null = null;
  currentCompanyId: number | null = null;
  formInitialData: any      = {};
  formFields: FormField[]   = [];

  private cachedUserOpts:   { label: string; value: any }[] = [];
  private cachedBranchOpts: { label: string; value: any }[] = [];
  private cachedRoleOpts:   { label: string; value: any }[] = [];

  private statusOptions = [
    { label: 'Aprobado',  value: 'APPROVED'  },
    { label: 'Pendiente', value: 'PENDING'   },
    { label: 'Rechazado', value: 'REJECTED'  }
  ];

  cols: TableColumn[] = [
    { field: 'user_name',    header: 'Usuario',    type: 'text',   sortable: true },
    { field: 'app_name',     header: 'Aplicación', type: 'text',   sortable: true },
    { field: 'company_name', header: 'Compañía',   type: 'text',   sortable: true },
    { field: 'status',       header: 'Estado',     type: 'status', sortable: true },
    { field: 'acciones',     header: 'Acciones',   type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  private buildFormFields() {
    this.formFields = [
      { name: 'app_name',     label: 'Aplicación', type: 'text',   required: true,  disabled: true },
      { name: 'company_name', label: 'Compañía',   type: 'text',   required: true,  disabled: true },
      { name: 'user_id',      label: 'Usuario',    type: 'select', required: true,  options: this.cachedUserOpts   },
      { name: 'branch_id',    label: 'Sucursal',   type: 'select', required: false, options: this.cachedBranchOpts },
      { name: 'role_id',      label: 'Rol',        type: 'select', required: true,  options: this.cachedRoleOpts   },
      { name: 'status',       label: 'Estado',     type: 'select', required: true,  options: this.statusOptions    }
    ];
  }

  load() {
    this.loading = true;

    // Paso 1: datos de página (accesos, usuarios, apps, compañías, sucursales)
    this.userService.getUserAccessPageData().subscribe({
      next: (data) => {
        const { userAccesses, users, apps, companies, branches } = data;

        // Mapear registros de la tabla
        this.records = (userAccesses || []).map((item: any) => ({
          ...item,
          user_name:    item.user?.full_name || item.user_id,
          app_name:     item.app?.name       || item.app_id,
          company_name: item.company?.name   || item.company_id
        }));

        // Resolver app y compañía activas
        const currentApp     = (apps     || []).find((a: any) => a.uuid === this.configService.appUuid);
        const currentCompany = this.authService.currentCompany();
        const matchedCompany = (companies || []).find((c: any) => c.uuid === currentCompany?.uuid);

        this.currentAppId     = currentApp     ? currentApp.id     : null;
        this.currentCompanyId = matchedCompany ? matchedCompany.id : null;

        // Datos pre-cargados en el formulario (app y compañía fijas/bloqueadas)
        this.formInitialData = {
          app_name:     currentApp?.name     || '',
          company_name: matchedCompany?.name || ''
        };

        // Opciones de usuarios
        this.cachedUserOpts = (users || [])
          .map((u: any) => ({ label: u.full_name || u.email, value: u.id }));

        // Sucursales filtradas por la compañía pre-cargada
        this.cachedBranchOpts = (branches || [])
          .filter((b: any) => b.company_id === this.currentCompanyId)
          .map((b: any) => ({ label: b.name, value: b.id }));

        // Paso 2: roles de la compañía pre-cargada via query dedicada
        // getRolesByCompany obtiene TODOS los roles asignados a esta compañía
        // sin depender del contexto del servidor que puede scopear USER_ACCESS_PAGE.roles
        const rolesObs = (this.currentAppId && currentCompany?.uuid)
          ? this.roleService.getRolesByCompany(this.currentAppId, currentCompany.uuid)
              .pipe(catchError(() => of([])))
          : of([]);

        rolesObs.subscribe({
          next: (roles: any[]) => {
            this.cachedRoleOpts = (roles || [])
              .map((r: any) => ({ label: r.name, value: r.id }));
            this.buildFormFields();
            this.loading = false;
          },
          error: () => {
            this.buildFormFields();
            this.loading = false;
          }
        });
      },
      error: () => (this.loading = false)
    });
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    if (e.mode === 'add') {
      e.data.app_id     = this.currentAppId;
      e.data.company_id = this.currentCompanyId;
    }
    delete e.data.app_name;
    delete e.data.company_name;

    const obs = e.mode === 'add'
      ? this.userService.createUserAccessGql(e.data)
      : this.userService.updateUserAccessGql(e.data.uuid, e.data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${e.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
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
      error: () => (this.isSaving = false)
    });
  }
}
