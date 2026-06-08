import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UserService } from '@core/services/user.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './component.html',
})
export class SecurityUserCrudComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  accesses: any[] = [];
  users: any[] = [];
  apps: any[] = [];
  companies: any[] = [];
  branches: any[] = [];      // Todas las sucursales cargadas
  roles: any[] = [];         // Todos los roles cargados

  loading = false;
  isSaving = false;

  /** Datos pre-cargados para el formulario de NUEVO acceso */
  formInitialData: any = {};

  formFields: FormField[] = [
    {
      name: 'user_id', label: 'Usuario', type: 'select-grid', required: true, options: [],
      icon: 'pi pi-user',
      placeholder: 'Buscar usuario por nombre o correo...',
      columns: [
        { field: 'label', header: 'Nombre', icon: 'pi pi-user' },
        { field: 'email', header: 'Correo', icon: 'pi pi-envelope', width: '220px' }
      ]
    },
    { name: 'app_id', label: 'Aplicación', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-th-large' },
    { name: 'company_id', label: 'Compañía', type: 'select', required: true, options: [], disabled: true, icon: 'pi pi-building' },
    { name: 'branch_id', label: 'Sucursal', type: 'select', options: [], icon: 'pi pi-map-marker' },
    { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [], icon: 'pi pi-id-card' },
    { name: 'status', label: 'Estado', type: 'select', required: true, options: [
      { label: 'Pendiente', value: 'PENDING' },
      { label: 'Aprobado', value: 'APPROVED' },
      { label: 'Rechazado', value: 'REJECTED' }
    ], icon: 'pi pi-check-circle' }
  ];

  cols: TableColumn[] = [
    { field: 'user_name', header: 'Usuario', type: 'user', subField: 'user_email', sortable: true },
    { field: 'app_name', header: 'Aplicación', type: 'text', sortable: true },
    { field: 'company_name', header: 'Compañía', type: 'text', sortable: true },
    { field: 'branch_name', header: 'Sucursal', type: 'text', sortable: true },
    { field: 'role_name', header: 'Rol', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'badge', sortable: true,
      filterOptions: [
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], filterOptionLabel: 'label' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  /** Mapa de item para edicion: convierte relaciones en IDs para los selects */
  mapItemForEdit = (item: any) => ({
    ...item,
    user_id:    item.user_id,
    app_id:     item.app_id,
    company_id: item.company_id,
    branch_id:  item.branch_id  ?? null,
    role_id:    item.role_id,
    status:     item.status
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.userService.getUserAccessPageData().subscribe({
      next: (res) => {
        this.users     = res.users     || [];
        this.apps      = res.apps      || [];
        this.companies = res.companies || [];
        this.branches  = res.branches  || [];
        this.roles     = res.roles     || [];

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
        this.buildInitialData();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  /**
   * Construye los datos pre-cargados para el formulario de NUEVO acceso:
   * - app_id: obtenido del app activo del usuario logueado (coincide con config.appUuid)
   * - company_id: obtenido de la compañía activa del usuario en sesión
   * - branch_id / role_id: filtrados según esa compañía
   * - status: APPROVED por defecto
   */
  private buildInitialData() {
    const currentCompany = this.authService.currentCompany();

    // Buscar la app que coincida con el uuid activo
    const appUuid = this.authService.currentUser()?.uuid
      ? localStorage.getItem('currentCompany')
        ? JSON.parse(localStorage.getItem('currentCompany')!)
        : null
      : null;

    // Buscar el app_id por uuid de la compañía activa (companies tienen app_id)
    let resolvedAppId: number | null = null;
    let resolvedCompanyId: number | null = null;

    if (currentCompany?.uuid) {
      const matchedCompany = this.companies.find(c => c.uuid === currentCompany.uuid);
      if (matchedCompany) {
        resolvedCompanyId = matchedCompany.id;
        resolvedAppId     = matchedCompany.app_id ?? null;
        // Filtrar branches y roles de esta compañía
        this.refreshFormOptionsForCompany(matchedCompany.id, matchedCompany.app_id);
      }
    }

    this.formInitialData = {
      app_id:     resolvedAppId,
      company_id: resolvedCompanyId,
      status:     'APPROVED'
    };
  }

  private refreshFormOptions() {
    // Carga completa de opciones (sin filtrar, para edición)
    this.formFields = this.formFields.map((f) => {
      if (f.name === 'user_id')    return { ...f, options: this.users.map((u) => ({ label: `${u.full_name} (${u.email})`, value: u.id })) };
      if (f.name === 'app_id')     return { ...f, options: this.apps.map((a) => ({ label: a.name, value: a.id })) };
      if (f.name === 'company_id') return { ...f, options: this.companies.map((c) => ({ label: c.name, value: c.id })) };
      if (f.name === 'branch_id')  return { ...f, options: [{ label: 'Todas (Sin Sucursal)', value: null }, ...this.branches.map((b) => ({ label: b.name, value: b.id }))] };
      if (f.name === 'role_id')    return { ...f, options: this.roles.map((r) => ({ label: r.name, value: r.id })) };
      return f;
    });
  }

  /**
   * Filtra branches y roles por la compañía activa del usuario,
   * para que el formulario de nuevo acceso solo muestre lo relevante.
   */
  private refreshFormOptionsForCompany(companyId: number, appId?: number | null) {
    const filteredBranches = this.branches.filter(b => b.company_id === companyId);
    const filteredRoles    = this.roles.filter(r =>
      !r.company_uuid // roles globales
      || this.companies.find(c => c.id === companyId && c.uuid === r.company_uuid)
    );

    this.formFields = this.formFields.map((f) => {
      if (f.name === 'user_id')    return { ...f, options: this.users.map((u) => ({ label: `${u.full_name} (${u.email})`, value: u.id })) };
      if (f.name === 'app_id')     return { ...f, options: this.apps.map((a) => ({ label: a.name, value: a.id })) };
      if (f.name === 'company_id') return { ...f, options: this.companies.map((c) => ({ label: c.name, value: c.id })) };
      if (f.name === 'branch_id')  return {
        ...f,
        options: [
          { label: 'Todas (Sin Sucursal)', value: null },
          ...filteredBranches.map((b) => ({ label: b.name, value: b.id }))
        ]
      };
      if (f.name === 'role_id')    return { ...f, options: filteredRoles.map((r) => ({ label: r.name, value: r.id })) };
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

  private handleSuccess(msg: string) {
    this.notificationService.notify('success', msg);
    this.load();
    this.isSaving = false;
  }
}
