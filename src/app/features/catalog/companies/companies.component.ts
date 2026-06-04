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
  selector: 'app-security-companies',
  standalone: true,
  imports: [CommonModule, TreeTableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  treeNodes: TreeNode[] = [];
  apps: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  currentAppId: number | null = null;

  formFields: FormField[] = [];
  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '40%' } },
    { field: 'tax_id', header: 'NIT', type: 'text', sortable: true, style: { width: '20%' } },
    { field: 'status', header: 'Activo', type: 'status', style: { width: '15%' } },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '25%', 'text-align': 'center' } }
  ];

  hasPermission = false;

  ngOnInit() {
    const auth: any = this.authService;
    this.hasPermission = typeof auth.hasRole === 'function' ? auth.hasRole('admin') : true;
    if (this.hasPermission) { this.load(); }
  }

  load() {
    this.loading = true;
    this.securexService.getCompaniesPageData().subscribe({
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
      { name: 'tax_id', label: 'NIT / Identificación Fiscal', type: 'text', required: true },
      { name: 'app_id', label: 'Aplicación Asociada', type: 'select', required: false, options: this.apps.map(app => ({ label: app.name, value: app.id })) },
      { name: 'logo_url', label: 'Logo de la Compañía', type: 'file', required: false, accept: 'image/*' },
      { name: 'is_active', label: '¿Está Activa?', type: 'select', required: true, options: [{ label: 'Activo', value: 1 }, { label: 'Inactivo', value: 0 }] }
    ];
  }

  handleAddRoot() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentAppId = null;
    this.modalVisible = true;
  }

  handleAddChild(appId: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.currentAppId = appId;
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    this.modalMode = 'edit';
    this.selectedItem = { ...data };
    this.modalVisible = true;
  }

  handleDelete(data: any) {
    this.modalMode = 'delete';
    this.selectedItem = data;
    this.modalVisible = true;
  }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add' && this.currentAppId) {
      data.app_id = this.currentAppId;
    }
    const proceedWithSave = (finalData: any) => {
      const obs = this.modalMode === 'add'
        ? this.securexService.createCompanyGql(finalData)
        : this.securexService.updateCompanyGql(this.selectedItem.uuid, finalData);
      obs.subscribe({
        next: () => {
          this.notificationService.success(`Compañía ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`);
          this.load();
          this.modalVisible = false;
          this.isSaving = false;
        },
        error: () => { this.isSaving = false; }
      });
    };
    if (data.logo_url instanceof File) {
      const reader = new FileReader();
      reader.onload = () => { data.logo_url = reader.result as string; proceedWithSave(data); };
      reader.onerror = () => { this.notificationService.showError('Error al procesar la imagen del logo'); this.isSaving = false; };
      reader.readAsDataURL(data.logo_url);
    } else {
      proceedWithSave(data);
    }
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteCompanyGql(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Compañía eliminada correctamente');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => { this.isSaving = false; }
    });
  }
}