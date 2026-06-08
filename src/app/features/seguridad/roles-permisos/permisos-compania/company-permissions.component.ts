import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectComponent } from '@shared/components/select/select.component';
import { AppService } from '@core/services/app.service';
import { CompanyService } from '@core/services/company.service';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

interface PermNode {
  id: number;
  name: string;
  slug: string;
  type: string;
  icon?: string;
  children: PermNode[];
  allIds: number[];
  expanded?: boolean;
  parentId?: number | null;
}

@Component({
  selector: 'app-security-company-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, TooltipModule, SelectComponent],
  templateUrl: './company-permissions.component.html'
})
export class CompanyPermissionsComponent implements OnInit {
  private appService = inject(AppService);
  private companyService = inject(CompanyService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  apps: any[] = [];
  companies: any[] = [];

  selectedAppId: number | null = null;
  selectedCompanyId: number | null = null;

  appControl = new FormControl<number | null>(null);
  companyControl = new FormControl<number | null>({ value: null, disabled: true });

  groups: PermNode[] = [];
  filteredGroups: PermNode[] = [];

  selectedIds = new Set<number>();
  parentMap = new Map<number, number | null>();
  childrenMap = new Map<number, number[]>();

  loading = false;
  isSaving = false;
  searchQuery = '';

  private readonly moduleIcons: Record<string, string> = {
    usuario: 'pi pi-users', user: 'pi pi-users', rol: 'pi pi-shield', role: 'pi pi-shield',
    permiso: 'pi pi-key', empresa: 'pi pi-building', compan: 'pi pi-building',
    finanz: 'pi pi-wallet', finance: 'pi pi-wallet', product: 'pi pi-box',
    venta: 'pi pi-shopping-cart', compra: 'pi pi-cart-plus', proveedor: 'pi pi-truck',
    cliente: 'pi pi-user', sucursal: 'pi pi-map-marker', report: 'pi pi-chart-bar',
    config: 'pi pi-cog', admin: 'pi pi-sliders-h', notif: 'pi pi-bell', dashboard: 'pi pi-home',
  };

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.company-permissions');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.loadApps();
      this.appControl.valueChanges.subscribe(val => {
        this.selectedAppId = val;
        this.onAppChange();
      });
      this.companyControl.valueChanges.subscribe(val => {
        this.selectedCompanyId = val;
        this.onCompanyChange();
      });
    }
  }

  loadApps() {
    this.loading = true;
    this.appService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onAppChange() {
    this.companyControl.reset();
    this.companyControl.disable();
    this.selectedCompanyId = null;
    this.companies = [];
    this.groups = [];
    this.filteredGroups = [];
    this.selectedIds = new Set();
    this.parentMap = new Map();
    this.childrenMap = new Map();

    if (!this.selectedAppId) return;

    this.loading = true;

    let companiesLoaded = false;
    let permissionsLoaded = false;

    const checkDone = () => {
      if (companiesLoaded && permissionsLoaded) this.loading = false;
    };

    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        const allCompanies = res.data || res || [];
        this.companies = allCompanies.filter((c: any) => c.app_id === this.selectedAppId);
        if (this.companies.length > 0) {
          this.companyControl.enable();
        }
        companiesLoaded = true;
        checkDone();
      },
      error: () => { companiesLoaded = true; checkDone(); }
    });

    this.permissionService.getAdminPermissions().subscribe({
      next: (res: any) => {
        const allPerms = res.data || res || [];
        const appNode = allPerms.find((a: any) => a.id === this.selectedAppId);

        if (appNode && appNode.children) {
          this.groups = this.buildTree(appNode.children, null);
        } else {
          this.groups = [];
        }

        this.filteredGroups = [...this.groups];
        permissionsLoaded = true;
        checkDone();
      },
      error: () => { permissionsLoaded = true; checkDone(); }
    });
  }

  private buildTree(nodes: any[], parentId: number | null): PermNode[] {
    const result: PermNode[] = [];

    for (const node of nodes) {
      const p = node.data || node;
      if (!p || !p.id) continue;

      this.parentMap.set(p.id, parentId);

      const children = node.children && Array.isArray(node.children)
        ? this.buildTree(node.children, p.id)
        : [];

      const allIds = [p.id];
      children.forEach(c => allIds.push(...c.allIds));

      this.childrenMap.set(p.id, allIds);

      const permNode: PermNode = {
        id: p.id,
        name: p.name || '',
        slug: p.slug || '',
        type: (p.type || 'MENU').toUpperCase(),
        icon: p.icon,
        children,
        allIds,
        expanded: false,
        parentId
      };

      result.push(permNode);
    }

    return result;
  }

  onCompanyChange() {
    this.selectedIds = new Set();
    this.searchQuery = '';
    this.filteredGroups = [...this.groups];

    if (!this.selectedCompanyId) return;

    this.loading = true;
    this.permissionService.getCompanyPermissions().subscribe({
      next: (res: any) => {
        const tree = res.data || res || [];
        let assignedPermissionIds: number[] = [];

        const appNode = tree.find((a: any) => a.data?.id === this.selectedAppId);
        if (appNode && appNode.children) {
          const companyNode = appNode.children.find((c: any) => c.data?.id === this.selectedCompanyId);
          if (companyNode && companyNode.children) {
            const extractIds = (nodes: any[]) => {
              nodes.forEach(n => {
                if (n.data?.permission_id) assignedPermissionIds.push(n.data.permission_id);
                if (n.data?.id) assignedPermissionIds.push(n.data.id);
                if (n.children) extractIds(n.children);
              });
            };
            extractIds(companyNode.children);
          }
        }

        this.selectedIds = new Set(assignedPermissionIds);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggle(node: PermNode) {
    const ids = node.allIds;
    const allSelected = this.isAllSelected(ids);

    if (allSelected) {
      ids.forEach(id => this.selectedIds.delete(id));
    } else {
      ids.forEach(id => this.selectedIds.add(id));
    }

    this.selectedIds = new Set(this.selectedIds);
  }

  toggleSingle(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      this.deselectChildren(id);
    } else {
      this.selectedIds.add(id);
      this.selectAllParents(id);
    }

    this.selectedIds = new Set(this.selectedIds);
  }

  private selectAllParents(id: number) {
    let currentParent = this.parentMap.get(id);
    while (currentParent != null) {
      this.selectedIds.add(currentParent);
      currentParent = this.parentMap.get(currentParent);
    }
  }

  private deselectChildren(id: number) {
    const children = this.childrenMap.get(id) || [];
    children.forEach(childId => {
      if (childId !== id) {
        this.selectedIds.delete(childId);
      }
    });
  }

  isAllSelected(ids: number[]): boolean {
    return ids.length > 0 && ids.every(id => this.selectedIds.has(id));
  }

  isPartialSelected(ids: number[]): boolean {
    const count = ids.filter(id => this.selectedIds.has(id)).length;
    return count > 0 && count < ids.length;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  selectAll() {
    this.groups.forEach(g => g.allIds.forEach(id => this.selectedIds.add(id)));
    this.selectedIds = new Set(this.selectedIds);
  }

  clearAll() {
    this.selectedIds = new Set();
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredGroups = [...this.groups];
      return;
    }

    const searchNode = (node: PermNode): PermNode | null => {
      const isMatch = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
      const matchedChildren: PermNode[] = [];

      node.children.forEach(child => {
        const matched = searchNode(child);
        if (matched) matchedChildren.push(matched);
      });

      if (isMatch || matchedChildren.length > 0) {
        return {
          ...node,
          expanded: matchedChildren.length > 0 ? true : node.expanded,
          children: matchedChildren.length > 0 ? matchedChildren : node.children
        };
      }
      return null;
    };

    const results: PermNode[] = [];
    this.groups.forEach(g => {
      const matched = searchNode(g);
      if (matched) results.push(matched);
    });

    this.filteredGroups = results;
  }

  getModuleIcon(name: string): string {
    const lower = (name || '').toLowerCase();
    for (const [key, icon] of Object.entries(this.moduleIcons)) {
      if (lower.includes(key)) return icon;
    }
    return 'pi pi-folder';
  }

  savePermissions() {
    if (!this.selectedCompanyId) return;

    this.isSaving = true;
    const permissionIds = Array.from(this.selectedIds);

    this.permissionService.syncCompanyPermissions(this.selectedCompanyId, permissionIds).subscribe({
      next: () => {
        this.notificationService.success('Permisos sincronizados correctamente');
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
