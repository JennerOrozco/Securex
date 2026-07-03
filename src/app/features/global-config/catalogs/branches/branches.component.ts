import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '@core/services/company.service';
import { AuthService } from '@core/services/auth.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { TreeNode } from 'primeng/api';
import { map } from 'rxjs/operators';
import { BRANCHES_COLS, createBranchesForm } from './branches.config';

@Component({
  selector: 'app-security-branches',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      [isTreeTable]="true"
      title="Sucursales"
      subtitle="Organizadas por compañía"
      [resourceName]="'Sucursal'"
      addLabel="Nueva Sucursal"
      [treeNodes]="crud.items()"
      [columns]="cols"
      [loading]="crud.loading()"
      [isSaving]="crud.isSaving()"
      [formFields]="formFields"
      [formExtraData]="{ company_id: currentCompanyId, is_active: true }"
      [deleteMessage]="deleteMessageFn"
      permission="securex.security.branches"
      [colorRows]="true"
      [showLegend]="false"
      (onAddRoot)="handleAddRoot()"
      (onAddChild)="handleAddChild($event)"
      (onEdit)="handleEdit($event)"
      (onDelete)="handleDelete($event)"
      (onSave)="onSave($event)"
      (onConfirmDelete)="crud.confirmDelete($event)"
      (onRefresh)="crud.load()">
    </app-crud-page>
  `,
  providers: [UnifiedCrudService]
})
export class BranchesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  crud = inject(UnifiedCrudService);

  cols = BRANCHES_COLS;
  formFields = createBranchesForm([]);
  currentCompanyId: number | null = null;
  selectedItem: any = null;

  constructor() {
    effect(() => {
      const catalogs = this.crud.catalogItems();
      const companies = catalogs['companies'] || [];
      this.formFields = createBranchesForm(companies);
    });
  }

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.branches');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.crud.initialize({
        resourceName: 'Sucursal',
        defaultSortKey: 'id',
        fnFetch: () => this.companyService.getBranchesPageData().pipe(
          map((data: any) => {
            const companies = data?.companies?.data ?? [];
            const branches = data?.branches?.data ?? [];
            this.crud.catalogItems.update(c => ({ ...c, companies }));
            return this.buildTree(companies, branches);
          })
        ),
        fnCreate: (data) => this.companyService.createBranchGql(data),
        fnUpdate: (id, data) => this.companyService.updateBranchGql(this.selectedItem?.uuid || id, data),
        fnDelete: this.companyService.deleteBranchGql.bind(this.companyService)
      });
      this.crud.load();
    }
  }

  private buildTree(companies: any[], branches: any[]): TreeNode[] {
    return companies.map(company => ({
      data: { ...company, name: company.name, type: 'MENU', _canAdd: true, _canEdit: false, _canDelete: false, icon: 'pi pi-building' },
      expanded: true,
      children: branches
        .filter(b => b.company_id === company.id)
        .map(branch => ({
          data: {
            ...branch,
            type: 'SUBMENU',
            icon: 'pi pi-sitemap',
            _canAdd: false,
            _canEdit: true,
            _canDelete: true
          }
        }))
    }));
  }

  handleAddRoot() {
    this.selectedItem = null;
    this.currentCompanyId = null;
  }

  handleAddChild(companyId: number) {
    this.selectedItem = null;
    this.currentCompanyId = companyId;
  }

  handleEdit(data: any) {
    const id = data.company_id != null ? Number(data.company_id) : null;
    this.selectedItem = { ...data, company_id: isNaN(id as any) ? null : id };
  }

  handleDelete(data: any) {
    this.selectedItem = data;
  }

  onSave(e: { mode: 'add' | 'edit'; data: any }) {
    const finalData = { ...e.data };
    if (e.mode === 'add' && this.currentCompanyId) {
      finalData.company_id = this.currentCompanyId;
    }
    this.crud.save({ mode: e.mode, data: finalData });
  }

  deleteMessageFn = (item: any) => `¿Está seguro de que desea eliminar la sucursal ${item?.name}?`;
}
