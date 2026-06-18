import { Component, inject, OnInit } from '@angular/core';
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
import { BaseNotificationConfigComponent } from '@shared/utils/base-notification-config';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const INITIAL_FORM_FIELDS: FormField[] = [
  {
    name: 'user_uuid', label: 'Usuario', type: 'select-grid', required: true, options: [], dataPath: 'user.uuid', icon: 'pi pi-user', placeholder: '- Seleccionar Usuario por nombre o correo -',
    columns: [{ field: 'email', header: 'Correo', width: '220px', icon: 'pi pi-envelope' }]
  },
  { name: 'app_uuid', label: 'Aplicación', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-th-large', dataPath: 'app.uuid' },
  { name: 'company_uuid', label: 'Compañía', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-building', dataPath: 'company.uuid' },
  { name: 'branch_uuid', label: 'Sucursal', type: 'select', required: false, options: [], icon: 'pi pi-map-marker', dataPath: 'branch.uuid', placeholder: '- Seleccionar Sucursal -' },
  { name: 'role_uuid', label: 'Rol', type: 'select', required: true, options: [], icon: 'pi pi-id-card', dataPath: 'role.uuid', placeholder: '- Seleccionar Rol -' },
  {
    name: 'status', label: 'Estado', type: 'select', required: true, options: [
      { label: 'Pendiente', value: 'PENDING' }, { label: 'Aprobado', value: 'APPROVED' }, { label: 'Rechazado', value: 'REJECTED' }
    ], icon: 'pi pi-check-circle', placeholder: '- Seleccionar Estado -'
  }
];

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, ResetPasswordModalComponent],
  templateUrl: './user.component.html',
})
export class SecurityUserCrudComponent extends BaseNotificationConfigComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private localNotificationService = inject(NotificationService);

  get resourceName() { return 'Acceso de Usuario'; }

  resetModalVisible = false;
  resetModalItem: any = null;
  formFields: FormField[] = [];

  // Mapeos requeridos por las directivas del HTML del crud-page
  get accesses(): any[] { return this.items; }
  set accesses(val: any[]) { this.items = val; }

  get formInitialData(): any { return this.initialData; }
  set formInitialData(val: any) { this.initialData = val; }

  cols: TableColumn[] = [
    { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', sortable: true },
    { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'company.name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'branch.name', header: 'Sucursal', type: 'text', sortable: true },
    { field: 'role.name', header: 'Rol', type: 'role', sortable: true },
    {
      field: 'status', header: 'Estado', type: 'badge', sortable: true,
      filterOptions: [
        { label: 'Aprobado', value: 'APPROVED' }, { label: 'Pendiente', value: 'PENDING' }, { label: 'Rechazado', value: 'REJECTED' }
      ], filterOptionLabel: 'label'
    },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  // Interceptores encargados de desempaquetar la data del HTML
  override save(eventData: any, mode?: any): void {
    if (eventData && eventData.mode && eventData.data) {
      super.save(eventData.data, eventData.mode);
    } else {
      super.save(eventData, mode);
    }
  }

  override confirmDelete(item?: any): void {
    if (item) {
      this.selectedItem = item;
    }
    super.confirmDelete();
  }

  loadCatalog(): Observable<any> {
    const currentCompany = this.authService.currentCompany();

    return this.userService.getUserAccessPageData().pipe(
      switchMap((res: any) => {
        const companies = res.companies?.data ?? [];
        const matchedCompany = companies.find((c: any) => c.uuid === currentCompany?.uuid);

        if (matchedCompany && currentCompany?.uuid) {
          return forkJoin({
            users: of(res.users?.data ?? []),
            apps: of(res.apps?.data ?? []),
            companies: of(companies),
            branches: of(res.branches?.data ?? []),
            roles: this.roleService.getRolesByCompany(matchedCompany.app_id, currentCompany.uuid).pipe(catchError(() => of([])))
          });
        }

        return of({
          users: res.users?.data ?? [],
          apps: res.apps?.data ?? [],
          companies: companies,
          branches: res.branches?.data ?? [],
          roles: []
        });
      })
    );
  }

  override updateFormFields() {
    const currentCompany = this.authService.currentCompany();
    const companiesList = this.catalogItems.companies || [];
    const matchedCompany = companiesList.find((c: any) => c.uuid === currentCompany?.uuid);

    if (matchedCompany) {
      this.formInitialData = {
        app_uuid: matchedCompany.app_uuid ?? matchedCompany.uuid ?? null,
        company_uuid: matchedCompany.uuid,
        status: 'APPROVED'
      };
    }

    const rawBranches = this.catalogItems.branches || [];
    const filteredBranches = matchedCompany
      ? rawBranches.filter((b: any) => b.company_id === matchedCompany.id)
      : rawBranches;

    const roles = this.catalogItems.roles || [];

    const optionsMap: Record<string, any[]> = {
      user_uuid: (this.catalogItems.users || []).map((u: any) => ({ label: u.full_name, email: u.email, value: u.uuid })),
      app_uuid: (this.catalogItems.apps || []).map((a: any) => ({ label: a.name, value: a.uuid })),
      company_uuid: companiesList.map((c: any) => ({ label: c.name, value: c.uuid })),
      branch_uuid: [{ label: 'Todas (Sin Sucursal)', value: null }, ...filteredBranches.map((b: any) => ({ label: b.name, value: b.uuid }))],
      role_uuid: roles.map((r: any) => ({ label: r.name, value: r.uuid }))
    };

    this.formFields = INITIAL_FORM_FIELDS.map(f =>
      optionsMap[f.name] ? { ...f, options: optionsMap[f.name] } : { ...f }
    );
  }

  loadSettings(event?: any) {
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

  saveSetting(data: any, mode: 'add' | 'edit'): Observable<any> {
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

    return request$.pipe(
      map((res: any) => {
        if (mode === 'add') this.sendInvitationForNewAccess(data);
        return res;
      })
    );
  }

  deleteSetting(item: any): Observable<any> {
    return this.userService.deleteUserAccessGql(item.uuid);
  }

  onSelectGridEmptyFilter() {
    this.localNotificationService.notify('info', 'Crea el usuario desde "Usuarios (Admin)" y luego asígnalo aquí.');
    this.router.navigate(['/security/admin-users']);
  }

  private sendInvitationForNewAccess(data: any) {
    const userOption: any = this.formFields
      .find(f => f.name === 'user_uuid')?.options
      ?.find((o: any) => o.value === data.user_uuid);

    const email = userOption?.email;
    if (!email) {
      this.localNotificationService.notify('warn', 'No se encontró el email del usuario para enviar la invitación.');
      return;
    }

    this.authService.adminResetUserPassword(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.localNotificationService.success(`Código de invitación enviado a ${email}`);
        } else {
          this.localNotificationService.notify('error', res.error || 'No se pudo enviar la invitación.');
        }
      },
      error: (err: any) => {
        this.localNotificationService.notify('error', `Error al enviar invitación: ${err?.message || 'Error de conexión'}`);
      }
    });
  }

  handleResetPassword(item: any) {
    const email = item?.user?.email;
    if (!email) {
      this.localNotificationService.notify('warn', 'No se encontró el correo del usuario.');
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