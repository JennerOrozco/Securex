import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '@core/services/user.service';
import { AppService } from '@core/services/app.service';
import { CompanyService } from '@core/services/company.service';
import { RoleService } from '@core/services/role.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { ADMIN_ACCESS_COLS, createAdminAccessForm } from './admin-access.config';

interface AccessNodeData {
  id?: string | number;
  name: string;
  slug: string;
  type: 'MENU' | 'SUBMENU' | 'ACTION' | 'COMPONENT';
  icon: string;
  status?: string;
  role?: string;
  uuid?: string;
  app_id?: number;
  company_id?: number;
  branch_id?: number;
  app_uuid?: string;
  company_uuid?: string;
  branch_uuid?: string;
  _canAdd: boolean;
  _canEdit: boolean;
  _canDelete: boolean;
  children?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [
    CommonModule,
    CrudPageComponent
  ],
  templateUrl: './admin-access.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAccessComponent implements OnInit {
  private userService = inject(UserService);
  private appService = inject(AppService);
  private companyService = inject(CompanyService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  rawAccesses = signal<any[]>([]);
  accessNodes = signal<TreeNode<AccessNodeData>[]>([]);
  loading = signal(false);
  isSaving = signal(false);
  catalogLoading = signal(false);
  formExtraData = signal<any>(null);

  catalogs = signal<any>({});
  currentCompanyIdForBranch = signal<number | undefined>(undefined);

  cols = ADMIN_ACCESS_COLS;
  
  formFields = computed(() => {
    return createAdminAccessForm(this.catalogs(), this.currentCompanyIdForBranch());
  });

  mapItemForEdit = (item: any) => {
    const r = this.rawAccesses().find(a => a.uuid === item.uuid);
    if (!r) return item;
    return {
      user_id:    r.user_id,
      app_id:     r.app_id,
      company_id: r.company_id,
      branch_id:  r.branch_id,
      role_id:    r.role_id,
      status:     r.status,
      uuid:       r.uuid
    };
  };

  hasPermission = computed(() => this.authService.checkPermission('securex.security.users'));

  ngOnInit() {
    if (this.hasPermission()) {
      this.load();
    }
  }

  load() {
    this.loading.set(true);
    this.userService.getUserAccessesWithRoles({ all: true }).subscribe({
      next: (raw: any) => {
        const processed = (raw?.data ?? []).map((r: any) => ({
          ...r,
          user_name:    r.user?.full_name  || r.user?.name || '-',
          app_name:     r.app?.name        || '-',
          company_name: r.company?.name    || '-',
          branch_name:  r.branch?.name     || '-',
          role_name:    r.role?.name       || '-',
          status:       (r.status || 'PENDING').toString().toUpperCase()
        }));
        this.rawAccesses.set(processed);
        this.accessNodes.set(this.mapToTreeNodes(processed));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private mapToTreeNodes(records: any[]): TreeNode<AccessNodeData>[] {
    const appMap = new Map<string, AccessNodeData & { children: AccessNodeData[] }>();

    for (const r of records) {
      const appKey = r.app?.uuid || `app-${r.app_id}`;
      if (!appMap.has(appKey)) {
        appMap.set(appKey, {
          name: r.app?.name || 'Sin aplicación',
          slug: 'Aplicación',
          type: 'MENU',
          icon: 'pi pi-th-large',
          _canAdd: false,
          _canEdit: false,
          _canDelete: false,
          children: []
        });
      }
      const appNode = appMap.get(appKey)!;

      const companyKey = `${appKey}::${r.company?.uuid || `co-${r.company_id}`}`;
      const companyName = r.company?.name || 'Sin compañía';
      let companyNode = appNode.children.find((c: AccessNodeData) => c.name === companyName);
      if (!companyNode) {
        companyNode = {
          name: companyName,
          slug: 'Compañía',
          type: 'SUBMENU',
          icon: 'pi pi-building',
          _canAdd: false,
          _canEdit: false,
          _canDelete: false,
          children: []
        };
        appNode.children.push(companyNode);
      }

      const branchKey = `${companyKey}::${r.branch?.uuid || `br-${r.branch_id}`}`;
      const branchName = r.branch?.name || 'Todas las sucursales';
      let branchNode = companyNode.children!.find((c: AccessNodeData) => c.name === branchName);
      if (!branchNode) {
        branchNode = {
          id: branchKey,
          name: branchName,
          slug: 'Sucursal',
          type: 'ACTION',
          icon: 'pi pi-map-marker',
          app_id:     r.app_id,
          company_id: r.company_id,
          branch_id:  r.branch_id,
          app_uuid:     r.app?.uuid,
          company_uuid: r.company?.uuid,
          branch_uuid:  r.branch?.uuid,
          _canAdd: true,
          _canEdit: false,
          _canDelete: false,
          children: []
        };
        companyNode.children!.push(branchNode);
      }

      branchNode.children.push({
        name: r.user_name,
        slug: r.role_name,
        type: 'COMPONENT',
        icon: r.status === 'APPROVED' ? 'pi pi-check-circle'
            : r.status === 'REJECTED' ? 'pi pi-times-circle'
            : 'pi pi-clock',
        status: r.status,
        role: r.role_name,
        uuid: r.uuid,
        email: r.user?.email || '',
        _canAdd: false,
        _canEdit: true,
        _canDelete: true,
        _canReset: true
      });
    }

    const toNode = (n: AccessNodeData): TreeNode<AccessNodeData> => ({
      data: n,
      children: (n.children?.length ? n.children.map(toNode) : []),
      expanded: n.type === 'MENU' || n.type === 'SUBMENU'
    });

    return Array.from(appMap.values()).map(toNode);
  }

  filterTree(query: string) {
    const q = (query || '').toLowerCase();
    if (!q) {
      this.accessNodes.set(this.mapToTreeNodes(this.rawAccesses()));
      return;
    }
    const filterNodes = (nodes: any[]): any[] =>
      nodes.reduce((acc, n) => {
        const matches = n.name.toLowerCase().includes(q) || (n.slug || '').toLowerCase().includes(q);
        const children = n.children?.length ? filterNodes(n.children) : [];
        if (matches || children.length > 0) {
          acc.push({ ...n, children });
        }
        return acc;
      }, []);
    
    this.accessNodes.set(this.mapToTreeNodes(filterNodes(this.rawAccesses().map(r => ({
      ...r,
      name: r.user_name,
      slug: r.role_name,
      children: []
    })))));
  }

  handleAddUnderBranch(branchId: string | number) {
    const branch = this.findBranchById(this.accessNodes(), branchId);
    if (!branch) return;
    this.formExtraData.set({
      app_id:     branch.app_id,
      company_id: branch.company_id,
      branch_id:  branch.branch_id,
      status:     'APPROVED'
    });
    this.loadModalCatalogs({
      appId:      branch.app_id!,
      companyId:  branch.company_id!,
      companyUuid: branch.company_uuid || this.authService.currentCompany()?.uuid
    });
  }

  handleEdit(item: any) {
    const r = this.rawAccesses().find(a => a.uuid === item.uuid);
    if (r) {
      this.loadModalCatalogs({
        appId:      r.app_id,
        companyId:  r.company_id,
        companyUuid: r.company?.uuid || this.authService.currentCompany()?.uuid
      });
    }
  }

  private loadModalCatalogs(ctx: { appId: number; companyId: number; companyUuid?: string }) {
    this.catalogLoading.set(true);
    this.currentCompanyIdForBranch.set(ctx.companyId);

    const safe = <T>(obs$: any) => obs$.pipe(catchError(() => of<T[]>([])));

    forkJoin({
      apps:     safe(this.appService.getAppsWithCompanies()),
      companies: safe(this.companyService.getCompaniesWithBranches()),
      branches: safe(this.companyService.getBranchesList()),
      users:    safe(this.userService.getAdminUsersGql({ per_page: 500 })),
      roles:    safe(this.roleService.getRolesByCompany(ctx.appId, ctx.companyUuid))
    }).subscribe({
      next: (results: any) => {
        this.catalogs.set({
          apps: results.apps || [],
          companies: results.companies || [],
          branches: results.branches || [],
          users: results.users || [],
          roles: results.roles || []
        });

        this.catalogLoading.set(false);

        const loadedCount = Object.values(results).filter(a => Array.isArray(a) && a.length > 0).length;
        if (loadedCount < 5) {
          this.notificationService.notify(
            'warn',
            `Algunos catálogos no pudieron cargarse (${loadedCount}/5). Verifica tu sesión y los permisos.`
          );
        }
      },
      error: () => {
        this.catalogLoading.set(false);
        this.notificationService.notify('error', 'No se pudieron cargar los catálogos del formulario');
      }
    });
  }

  private findBranchById(nodes: TreeNode<AccessNodeData>[], id: string | number): AccessNodeData | null {
    for (const n of nodes) {
      if (n.data?.id === id) return n.data;
      if (n.children?.length) {
        const found = this.findBranchById(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  handleSave(event: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving.set(true);
    const obs = event.mode === 'add'
      ? this.userService.createUserAccessGql(event.data)
      : this.userService.updateUserAccessGql(event.data.uuid, event.data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Acceso ${event.mode === 'add' ? 'asignado' : 'actualizado'} correctamente`);
        if (event.mode === 'add') {
          this.sendInvitationForNewAccess(event.data);
        }
        this.load();
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }

  private sendInvitationForNewAccess(data: any) {
    const userOption: any = this.formFields()
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

  handleDelete(item: any) {
    this.isSaving.set(true);
    this.userService.deleteUserAccessGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Acceso eliminado');
        this.load();
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }

  handleResetPassword(item: any) {
    const email = item?.email;
    if (!email) {
      this.notificationService.notify('warn', 'No se encontró el correo del usuario.');
      return;
    }
    this.authService.adminResetUserPassword(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notificationService.success(`Código de restablecimiento enviado a ${email}`);
        } else {
          this.notificationService.notify('error', res.error || 'No se pudo enviar el código.');
        }
      },
      error: () => this.notificationService.notify('error', 'Error al enviar el código de restablecimiento.')
    });
  }
}
