import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { SelectComponent } from '@shared/components/select/select.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PermissionTreeComponent } from '@shared/components/permission-tree/permission-tree.component';
import { PermissionTreeNode } from '@shared/components/permission-tree/permission-tree.types';
import { AppService } from '@core/services/app.service';
import { CompanyService } from '@core/services/company.service';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-company-permissions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    SelectComponent, ToolbarComponent, ButtonComponent,
    PermissionTreeComponent
  ],
  templateUrl: './company-permissions.component.html',
  styleUrl: './company-permissions.component.css'
})
export class CompanyPermissionsComponent implements OnInit {
  private appService = inject(AppService);
  private companyService = inject(CompanyService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  apps: any[] = [];
  companies: any[] = [];

  selectedAppId: number | null = null;
  selectedCompanyId: number | null = null;

  appControl = new FormControl<number | null>(null);
  companyControl = new FormControl<number | null>({ value: null, disabled: true });

  groups: PermissionTreeNode[] = [];
  selectedIds: Set<number> = new Set();

  loading = false;
  isSaving = false;

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.company-permissions');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.loadApps();
      this.appControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
        this.selectedAppId = val;
        this.onAppChange();
      });
      this.companyControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
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
    this.selectedIds = new Set();

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

        permissionsLoaded = true;
        checkDone();
      },
      error: () => { permissionsLoaded = true; checkDone(); }
    });
  }

  private buildTree(nodes: any[], parentId: number | null): PermissionTreeNode[] {
    const result: PermissionTreeNode[] = [];

    for (const node of nodes) {
      const p = node.data || node;
      if (!p || !p.id) continue;

      const children = node.children && Array.isArray(node.children)
        ? this.buildTree(node.children, p.id)
        : [];

      const allIds = [p.id, ...children.flatMap((child: PermissionTreeNode) => child.allIds)];

      result.push({
        id: p.id,
        name: p.name || '',
        slug: p.slug || '',
        icon: p.icon,
        type: (p.type || 'MENU').toUpperCase(),
        children,
        allIds,
        expanded: false
      });
    }

    return result;
  }

  onCompanyChange() {
    this.selectedIds = new Set();

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

  onSelectionChange(ids: Set<number>) {
    this.selectedIds = ids;
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
