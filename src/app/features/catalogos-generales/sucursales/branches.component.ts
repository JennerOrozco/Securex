import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { CompanyService } from '@core/services/company.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-security-branches',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './branches.component.html',
})
export class BranchesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  treeNodes: TreeNode[] = [];
  companies: any[] = [];
  loading = false;
  isSaving = false;

  selectedItem: any = null;
  currentCompanyId: number | null = null;

  formFields: FormField[] = [];

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '30%' } },
    { field: 'address', header: 'Dirección', type: 'text', sortable: true, style: { width: '25%' } },
    { field: 'phone', header: 'Teléfono', type: 'text', sortable: true, style: { width: '20%' } },
    { field: 'status', header: 'Estado', type: 'badge', style: { width: '10%', textAlign: 'center' } },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', 'text-align': 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.branches');
  }

  deleteMessageFn = (item: any) => `¿Está seguro de que desea eliminar la sucursal ${item?.name}?`;

  ngOnInit() {
    if (this.hasPermission) { this.load(); }
  }

  load() {
    this.loading = true;
    this.companyService.getBranchesPageData().subscribe({
      next: (data) => {
        const { companies, branches } = data;
        this.companies = companies || [];
        this.treeNodes = this.buildTree(companies || [], branches || []);
        this.updateFormFields();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
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
            status: branch.is_active ? 'ACTIVO' : 'INACTIVO',
            icon: 'pi pi-sitemap',
            _canAdd: false,
            _canEdit: true,
            _canDelete: true
          }
        }))
    }));
  }

  private updateFormFields() {
    this.formFields = [
      { name: 'name', label: 'Nombre de Sucursal', type: 'text', required: true, icon: 'pi pi-sitemap' },
      { name: 'company_id', label: 'Compañía', type: 'select', required: true, options: this.companies.map((c: any) => ({ label: c.name, value: c.id })) },
      { name: 'address', label: 'Dirección', type: 'text', icon: 'pi pi-map-marker' },
      { name: 'phone', label: 'Teléfono', type: 'phone', icon: 'pi pi-phone' },
      { name: 'is_active', label: '¿Activa?', type: 'select', required: true, options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }] }
    ];
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
    let isActive = 0;
    if (data.is_active != null) {
      isActive = data.is_active ? 1 : 0;
    }
    this.selectedItem = { ...data, company_id: isNaN(id as any) ? null : id, is_active: isActive };
  }

  handleDelete(data: any) {
    this.selectedItem = data;
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const finalData = { ...e.data };
    if (e.mode === 'add' && this.currentCompanyId) {
      finalData.company_id = this.currentCompanyId;
    }
    const obs = e.mode === 'add'
      ? this.companyService.createBranchGql(finalData)
      : this.companyService.updateBranchGql(this.selectedItem.uuid, finalData);
    obs.subscribe({
      next: () => {
        this.notificationService.success(`Sucursal ${e.mode === 'add' ? 'creada' : 'actualizada'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.companyService.deleteBranchGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Sucursal eliminada');
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
