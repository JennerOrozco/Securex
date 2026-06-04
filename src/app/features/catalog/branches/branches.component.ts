import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '@shared/table-component/table.types';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { TreeTableComponent } from '@shared/tree-table-component/tree-table-component.component';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-security-branches',
  standalone: true,
  imports: [CommonModule, TreeTableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  treeNodes: TreeNode[] = [];
  companies: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  currentCompanyId: number | null = null;

  formFields: FormField[] = [];

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '30%' } },
    { field: 'address', header: 'Dirección', type: 'text', sortable: true, style: { width: '25%' } },
    { field: 'phone', header: 'Teléfono', type: 'text', sortable: true, style: { width: '20%' } },
    { field: 'status', header: 'Estado', type: 'status', style: { width: '10%' } },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', 'text-align': 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.branches');
  }

  ngOnInit() {
    if (this.hasPermission) { this.load(); }
  }

  load() {
    this.loading = true;
    this.securexService.getBranchesPageData().subscribe({
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
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentCompanyId = null;
    this.modalVisible = true;
  }

  handleAddChild(companyId: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentCompanyId = companyId;
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    this.modalMode = 'edit';
    const id = data.company_id != null ? Number(data.company_id) : null;
    let isActive = 0;
    if (data.is_active != null) {
      isActive = data.is_active ? 1 : 0;
    }
    this.selectedItem = { ...data, company_id: isNaN(id as any) ? null : id, is_active: isActive };
    this.modalVisible = true;
  }

  handleDelete(data: any) {
    this.modalMode = 'delete';
    this.selectedItem = data;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add' && this.currentCompanyId) {
      data.company_id = this.currentCompanyId;
    }
    const obs = this.modalMode === 'add'
      ? this.securexService.createBranchGql(data)
      : this.securexService.updateBranchGql(this.selectedItem.uuid, data);
    obs.subscribe({
      next: () => {
        this.notificationService.success(`Sucursal ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteBranchGql(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Sucursal eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}
