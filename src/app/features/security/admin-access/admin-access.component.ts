import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeTableComponent } from '@shared/tree-table-component/tree-table-component.component';
import { TableColumn } from '@shared/table-component/table.types';

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
    FormsModule,
    TreeTableComponent,
    FormModalComponent,
    DeleteModalComponent
  ],
  templateUrl: './admin-access.component.html',
  styleUrl: './admin-access.component.css'
})
export class AdminAccessComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  rawAccesses: any[] = [];
  accessNodes: TreeNode<AccessNodeData>[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  cols: TableColumn[] = [
    { field: 'name',   header: 'Acceso',    type: 'tree',    sortable: true, style: { width: '45%' } },
    { field: 'role',   header: 'Rol',       type: 'text',    sortable: true, style: { width: '25%' } },
    { field: 'status', header: 'Estado',    type: 'badge',   sortable: true, style: { width: '15%' } },
    { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  formFields: FormField[] = [
    { name: 'user_id',    label: 'Usuario',     type: 'select', required: true,  options: [] },
    { name: 'app_id',     label: 'Aplicación',  type: 'select', required: true,  options: [], disabled: true },
    { name: 'company_id', label: 'Compañía',    type: 'select', required: true,  options: [], disabled: true },
    { name: 'branch_id',  label: 'Sucursal',    type: 'select', options: [], disabled: true },
    { name: 'role_id',    label: 'Rol',         type: 'select', required: true,  options: [] },
    { name: 'status',     label: 'Estado',      type: 'select', required: true,
      options: [
        { label: 'Pendiente',  value: 'PENDING' },
        { label: 'Aprobado',   value: 'APPROVED' },
        { label: 'Rechazado',  value: 'REJECTED' }
      ]
    }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.users');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getUserAccessesWithRoles().subscribe({
      next: (raw: any) => {
        this.rawAccesses = (raw || []).map((r: any) => ({
          ...r,
          user_name:    r.user?.full_name  || r.user?.name || '-',
          app_name:     r.app?.name        || '-',
          company_name: r.company?.name    || '-',
          branch_name:  r.branch?.name     || '-',
          role_name:    r.role?.name       || '-',
          status:       (r.status || 'PENDING').toString().toUpperCase()
        }));
        this.accessNodes = this.mapToTreeNodes(this.rawAccesses);
        this.loading = false;
      },
      error: () => (this.loading = false)
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
        _canAdd: false,
        _canEdit: true,
        _canDelete: true
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
      this.accessNodes = this.mapToTreeNodes(this.rawAccesses);
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
    this.accessNodes = this.mapToTreeNodes(filterNodes(this.rawAccesses.map(r => ({
      ...r,
      name: r.user_name,
      slug: r.role_name,
      children: []
    }))));
  }

  handleAddUnderBranch(branchId: string | number) {
    const branch = this.findBranchById(this.accessNodes, branchId);
    if (!branch) return;
    this.modalMode = 'add';
    this.selectedItem = {
      app_id:     branch.app_id,
      company_id: branch.company_id,
      branch_id:  branch.branch_id,
      status:     'APPROVED'
    };
    this.modalVisible = true;
    this.loadModalCatalogs({
      appId:      branch.app_id!,
      companyId:  branch.company_id!,
      companyUuid: branch.company_uuid
    });
  }

  handleEdit(item: any) {
    const r = this.rawAccesses.find(a => a.uuid === item.uuid);
    if (!r) return;
    this.modalMode = 'edit';
    this.selectedItem = {
      user_id:    r.user_id,
      app_id:     r.app_id,
      company_id: r.company_id,
      branch_id:  r.branch_id,
      role_id:    r.role_id,
      status:     r.status,
      uuid:       r.uuid
    };
    this.modalVisible = true;
    this.loadModalCatalogs({
      appId:      r.app_id,
      companyId:  r.company_id,
      companyUuid: r.company?.uuid
    });
  }

  private loadModalCatalogs(ctx: { appId: number; companyId: number; companyUuid?: string }) {
    this.isSaving = true;
    const safe = <T>(obs$: any) => obs$.pipe(catchError(() => of<T[]>([])));

    forkJoin({
      apps:     safe(this.securexService.getAppsWithCompanies()),
      companies: safe(this.securexService.getCompaniesWithBranches()),
      branches: safe(this.securexService.getBranchesList()),
      users:    safe(this.securexService.getAdminUsersGql({ per_page: 500 })),
      roles:    safe(this.securexService.getRolesByCompany(ctx.appId, ctx.companyUuid))
    }).subscribe({
      next: ({ apps, companies, branches, users, roles }: any) => {
        const appField = this.formFields.find(f => f.name === 'app_id')!;
        appField.options = (apps || []).map((a: any) => ({ label: a.name, value: a.id }));

        const companyField = this.formFields.find(f => f.name === 'company_id')!;
        companyField.options = (companies || []).map((c: any) => ({ label: c.name, value: c.id }));

        const branchField = this.formFields.find(f => f.name === 'branch_id')!;
        const companyBranches = (branches || []).filter((b: any) => b.company_id === ctx.companyId);
        branchField.options = [
          { label: 'Todas las sucursales', value: null },
          ...companyBranches.map((b: any) => ({ label: b.name, value: b.id }))
        ];

        const userField = this.formFields.find(f => f.name === 'user_id')!;
        userField.options = (users || []).map((u: any) => ({
          label: `${u.full_name} (${u.email})`,
          value: u.id
        }));

        const roleField = this.formFields.find(f => f.name === 'role_id')!;
        roleField.options = (roles || []).map((r: any) => ({ label: r.name, value: r.id }));

        this.isSaving = false;

        const loadedCount = [apps, companies, branches, users, roles].filter(a => Array.isArray(a) && a.length > 0).length;
        if (loadedCount < 5) {
          this.notificationService.notify(
            'warn',
            `Algunos catálogos no pudieron cargarse (${loadedCount}/5). Verifica tu sesión y los permisos.`
          );
        }
      },
      error: () => {
        this.isSaving = false;
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

  handleDelete(item: any) {
    const r = this.rawAccesses.find(a => a.uuid === item.uuid);
    if (!r) return;
    this.modalMode = 'delete';
    this.selectedItem = r;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securexService.createUserAccessGql(data)
      : this.securexService.updateUserAccessGql(this.selectedItem.uuid, data);

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
    this.securexService.deleteUserAccessGql(this.selectedItem.uuid).subscribe({
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
