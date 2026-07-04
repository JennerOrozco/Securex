import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SelectComponent } from '@shared/components/select/select.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PermissionTreeComponent } from '@shared/components/permission-tree/permission-tree.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PermissionTreeNode } from '@shared/components/permission-tree/permission-tree.types';
import { AppService } from '@core/services/app.service';
import { CompanyService } from '@core/services/company.service';
import { PermissionService } from '@core/services/permission.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { trackSignal } from '@shared/utils/rxjs-utils';

@Component({
  selector: 'app-security-company-permissions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    SelectComponent, ToolbarComponent, ButtonComponent,
    PermissionTreeComponent, EmptyStateComponent
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
  cdr = inject(ChangeDetectorRef);

  apps: any[] = [];
  companies: any[] = [];

  selectedAppId: number | null = null;
  selectedCompanyId: number | null = null;

  appControl = new FormControl<number | null>(null);
  companyControl = new FormControl<number | null>({ value: null, disabled: true });

  groups: PermissionTreeNode[] = [];
  selectedIds: Set<number> = new Set();

  isLoading = signal(false);
  isSavingSignal = signal(false);

  // Expose as plain booleans for template (legacy *ngIf bindings)
  get loading(): boolean { return this.isLoading(); }
  get isSaving(): boolean { return this.isSavingSignal(); }

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
    this.appService.getApps().pipe(
      trackSignal(this, this.isLoading)
    ).subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.notificationService.error('Error al cargar aplicaciones');
        console.error(err);
      }
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

    forkJoin({
      companies: this.companyService.getCompanies(),
      permissions: this.permissionService.getAdminPermissions()
    }).pipe(
      trackSignal(this, this.isLoading)
    ).subscribe({
      next: (res: any) => {
        const allCompanies = res.companies?.data || res.companies || [];
        this.companies = allCompanies.filter((c: any) => c.app_id === this.selectedAppId);

        if (this.companies.length > 0) {
          this.companyControl.enable();
        }

        const allPerms = res.permissions?.data || res.permissions || [];
        const appNode = allPerms.find((a: any) => a.id === this.selectedAppId);

        if (appNode && appNode.children) {
          this.groups = this.buildTree(appNode.children, null);
        } else {
          this.groups = [];
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.companies = [];
        this.groups = [];
        this.cdr.markForCheck();
      }
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

    this.permissionService.getCompanyPermissions().pipe(
      trackSignal(this, this.isLoading)
    ).subscribe({
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
        this.cdr.markForCheck();
      }
    });
  }

  onSelectionChange(ids: Set<number>) {
    this.selectedIds = ids;
    this.cdr.markForCheck();
  }

  savePermissions() {
    if (!this.selectedCompanyId) return;

    const permissionIds = Array.from(this.selectedIds);

    this.permissionService.syncCompanyPermissions(this.selectedCompanyId, permissionIds).pipe(
      trackSignal(this, this.isSavingSignal, 'Permisos sincronizados correctamente')
    ).subscribe();
  }
}
