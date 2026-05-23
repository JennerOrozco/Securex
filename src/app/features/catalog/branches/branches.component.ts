import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '@shared/table-component/table-component.component';
import { TableColumn } from '@shared/table-component/table.types';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal.types';
import { FormModalComponent } from '@shared/modals/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-branches',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  tableData: any[] = [];
  companies: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  preselectedCompanyId: number | null = null;

  formFields: FormField[] = [];

  cols: TableColumn[] = [
    { field: 'name',         header: 'Nombre',     type: 'text',    sortable: true },
    { field: 'address',      header: 'Dirección',  type: 'text',    sortable: true },
    { field: 'phone',        header: 'Teléfono',   type: 'text',    sortable: true },
    { field: 'status',       header: 'Estado',     type: 'status',  sortable: true },
    { field: 'actions',      header: 'Acciones',   type: 'actions', style: { width: '8rem', 'text-align': 'center' } }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.branches');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res.data || res || [];
        this.updateFormFields();
        this.loadBranches();
      },
      error: () => (this.loading = false)
    });
  }

  private updateFormFields() {
    this.formFields = [
      { name: 'name',       label: 'Nombre de Sucursal', type: 'text',   required: true,  icon: 'pi pi-sitemap' },
      {
        name: 'company_id', label: 'Compañía',           type: 'select', required: true,
        options: this.companies.map((c: any) => ({ label: c.name, value: c.id }))
      },
      { name: 'address',    label: 'Dirección',          type: 'text',   icon: 'pi pi-map-marker' },
      { name: 'phone',      label: 'Teléfono',           type: 'text',   icon: 'pi pi-phone' },
      {
        name: 'is_active',  label: '¿Activa?',           type: 'select', required: true,
        options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }]
      }
    ];
  }

  private loadBranches() {
    this.securexService.getBranches().subscribe({
      next: (res: any) => {
        const branchesList = res.data || res || [];
        this.tableData = branchesList.map((branch: any) => {
          const company = this.companies.find((c: any) => c.id === branch.company_id);
          return {
            ...branch,
            company_name: company ? company.name : 'Sin Compañía',
            status: branch.is_active ? 'Activo' : 'Inactivo'
          };
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = null;
    this.modalVisible = true;
  }

  handleAddChild(companyId: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedCompanyId = companyId;
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    this.modalMode = 'edit';

    let companyIdVal: number | null = null;
    if (data.company_id != null) {
      companyIdVal = Number(data.company_id);
      if (isNaN(companyIdVal)) companyIdVal = null;
    }

    let isActiveVal = 0;
    if (data.is_active != null) {
      if (typeof data.is_active === 'boolean') {
        isActiveVal = data.is_active ? 1 : 0;
      } else if (typeof data.is_active === 'number') {
        isActiveVal = data.is_active !== 0 ? 1 : 0;
      } else if (typeof data.is_active === 'string') {
        const lv = data.is_active.toLowerCase().trim();
        isActiveVal = ['true', '1', 'sí', 'si', 'yes'].includes(lv) ? 1 : 0;
      }
    }

    this.selectedItem = { ...data, company_id: companyIdVal, is_active: isActiveVal };
    this.modalVisible = true;
  }

  handleDelete(data: any) {
    this.modalMode = 'delete';
    this.selectedItem = data;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    const obs = this.modalMode === 'add'
      ? this.securexService.createBranch(data)
      : this.securexService.updateBranch(this.selectedItem.uuid, data);

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
    this.securexService.deleteBranch(this.selectedItem.uuid).subscribe({
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
