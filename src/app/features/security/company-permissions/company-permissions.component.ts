import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableComponent, TreeTableColumn } from '@shared/tree-table-component/tree-table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal.types';
import { AddModalComponent } from '@shared/modals/add-modal/add-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-security-company-permissions',
  standalone: true,
  imports: [CommonModule, TreeTableComponent, AddModalComponent, DeleteModalComponent],
  templateUrl: './company-permissions.component.html',
  styleUrl: './company-permissions.component.css'
})
export class CompanyPermissionsComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  treeNodes: TreeNode[] = [];
  apps: any[] = [];
  companies: any[] = [];
  allPermissions: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  preselectedCompanyId: number | null = null;

  formFields: FormField[] = [
    { name: 'company_id', label: 'Compañía', type: 'select', required: true, options: [] },
    { name: 'permission_id', label: 'Permiso', type: 'select', required: true, options: [] }
  ];

  cols: TreeTableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'tree', style: { width: '40%' } },
    { field: 'slug', header: 'Slug', type: 'text', style: { width: '30%' } },
    { field: 'type', header: 'Tipo', type: 'text', style: { width: '15%' } },
    { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.company-permissions');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.loadCompanies();
      },
      error: () => this.loading = false
    });
  }

  private loadCompanies() {
    this.securexService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res.data || res || [];
        const companyField = this.formFields.find(f => f.name === 'company_id')!;
        companyField.options = this.companies.map((c: any) => ({ label: c.name, value: c.id }));
        this.loadPermissions();
      },
      error: () => this.loading = false
    });
  }

  private loadPermissions() {
    this.securexService.getAdminPermissions().subscribe({
      next: (res: any) => {
        this.allPermissions = res.data || res || [];
        const permField = this.formFields.find(f => f.name === 'permission_id')!;
        permField.options = this.allPermissions.map((p: any) => ({ label: `${p.name} (${p.slug})`, value: p.id }));
        this.loadAssignments();
      },
      error: () => this.loading = false
    });
  }

  private loadAssignments() {
    this.securexService.getCompanyPermissions().subscribe({
      next: (res: any) => { this.buildTree(this.apps, this.companies, res.data || res || []); this.loading = false; },
      error: () => this.loading = false
    });
  }

  private buildTree(appsList: any[], companiesList: any[], assignments: any[]) {
    this.treeNodes = appsList.map(app => {
      const appCompanies = companiesList.filter((c: any) => c.app_id === app.id);
      return {
        label: app.name,
        data: { ...app, type: 'MENU', name: app.name, is_leaf: false, status: '', _canAdd: false, _canEdit: false, _canDelete: false },
        icon: 'pi pi-th-large',
        expanded: true,
        leaf: appCompanies.length === 0,
        children: appCompanies.length > 0 ? appCompanies.map(company => {
          const companyPerms = assignments.filter((a: any) => a.company_id === company.id);
          return {
            label: company.name,
            data: { ...company, type: 'SUBMENU', name: company.name, is_leaf: companyPerms.length === 0, status: '', _canAdd: true, _canEdit: false, _canDelete: false },
            icon: 'pi pi-building',
            expanded: true,
            leaf: companyPerms.length === 0,
            children: companyPerms.length > 0 ? companyPerms.map(cp => ({
              label: cp.permission_name,
              data: { ...cp, type: 'ACTION', is_leaf: true, name: cp.permission_name, slug: cp.permission_slug, status: '', _canAdd: false, _canEdit: false, _canDelete: true },
              icon: 'pi pi-lock',
              leaf: true
            })) : undefined
          };
        }) : undefined
      };
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = null;
    this.modalVisible = true;
  }

  handleAddChild(id: number) {
    const isApp = this.apps.some(a => a.id === id);
    if (isApp) return;
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = id;
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    // No editing for pivot assignments
  }

  handleDelete(data: any) {
    this.modalMode = 'delete';
    this.selectedItem = data;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    this.securexService.assignCompanyPermission(data).subscribe({
      next: () => {
        this.notificationService.success('Permiso asignado a la compañía correctamente');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.removeCompanyPermission(this.selectedItem.id).subscribe({
      next: () => {
        this.notificationService.success('Permiso removido de la compañía');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
