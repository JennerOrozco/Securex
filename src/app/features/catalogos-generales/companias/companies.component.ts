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
  selector: 'app-security-companies',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './companies.component.html',
})
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  treeNodes: TreeNode[] = [];
  apps: any[] = [];
  loading = false;
  isSaving = false;

  selectedItem: any = null;
  currentAppId: number | null = null;

  formFields: FormField[] = [];
  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '40%' } },
    { field: 'tax_id', header: 'NIT', type: 'text', sortable: true, style: { width: '20%' } },
    { field: 'status', header: 'Activo', type: 'badge', style: { width: '15%', textAlign: 'center' } },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '25%', 'text-align': 'center' } }
  ];

  hasPermission = false;

  deleteMessageFn = (item: any) => `¿Está seguro de que desea eliminar la compañía ${item?.name}?`;

  ngOnInit() {
    const auth: any = this.authService;
    this.hasPermission = typeof auth.hasRole === 'function' ? auth.hasRole('admin') : true;
    if (this.hasPermission) { this.load(); }
  }

  load() {
    this.loading = true;
    this.companyService.getCompaniesPageData().subscribe({
      next: (data) => {
        const { apps, companies } = data;
        this.apps = apps || [];
        this.treeNodes = this.buildTree(apps || [], companies || []);
        this.updateFormFields();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private buildTree(apps: any[], companies: any[]): TreeNode[] {
    return apps.map(app => ({
      data: { ...app, name: app.name, type: 'MENU', _canAdd: true, _canEdit: false, _canDelete: false, icon: 'pi pi-th-large' },
      expanded: true,
      children: companies
        .filter(c => c.app_id === app.id)
        .map(company => ({
          data: {
            ...company,
            type: 'SUBMENU',
            status: company.is_active ? 'ACTIVO' : 'INACTIVO',
            icon: 'pi pi-building',
            _canAdd: false,
            _canEdit: true,
            _canDelete: true
          }
        }))
    }));
  }

  private updateFormFields() {
    this.formFields = [
      { name: 'name', label: 'Nombre de la Compañía', type: 'text', required: true },
      { name: 'tax_id', label: 'NIT / Identificación Fiscal', type: 'nit', required: true },
      { name: 'app_id', label: 'Aplicación Asociada', type: 'select', required: false, options: this.apps.map(app => ({ label: app.name, value: app.id })) },
      { name: 'logo_url', label: 'Logo de la Compañía', type: 'file', required: false, accept: 'image/*' },
      { name: 'is_active', label: '¿Está Activa?', type: 'select', required: true, options: [{ label: 'Activo', value: 1 }, { label: 'Inactivo', value: 0 }] }
    ];
  }

  handleAddRoot() {
    this.selectedItem = null;
    this.currentAppId = null;
  }

  handleAddChild(appId: number) {
    this.selectedItem = null;
    this.currentAppId = appId;
  }

  handleEdit(data: any) {
    this.selectedItem = { ...data };
  }

  handleDelete(data: any) {
    this.selectedItem = data;
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const finalData = { ...e.data };
    if (e.mode === 'add' && this.currentAppId) {
      finalData.app_id = this.currentAppId;
    }
    const proceedWithSave = (processedData: any) => {
      const obs = e.mode === 'add'
        ? this.companyService.createCompanyGql(processedData)
        : this.companyService.updateCompanyGql(this.selectedItem.uuid, processedData);
      obs.subscribe({
        next: () => {
          this.notificationService.success(`Compañía ${e.mode === 'add' ? 'creada' : 'actualizada'} correctamente`);
          this.load();
          this.isSaving = false;
        },
        error: () => { this.isSaving = false; }
      });
    };
    if (finalData.logo_url instanceof File) {
      const reader = new FileReader();
      reader.onload = () => { finalData.logo_url = reader.result as string; proceedWithSave(finalData); };
      reader.onerror = () => { this.notificationService.showError('Error al procesar la imagen del logo'); this.isSaving = false; };
      reader.readAsDataURL(finalData.logo_url);
    } else {
      proceedWithSave(finalData);
    }
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.companyService.deleteCompanyGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Compañía eliminada correctamente');
        this.load();
        this.isSaving = false;
      },
      error: () => { this.isSaving = false; }
    });
  }
}