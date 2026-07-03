import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '@core/services/company.service';
import { AuthService } from '@core/services/auth.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { TreeNode } from 'primeng/api';
import { map } from 'rxjs/operators';
import { COMPANIES_COLS, createCompaniesForm } from './companies.config';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-security-companies',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    <app-crud-page
      [isTreeTable]="true"
      title="Compañías"
      subtitle="Organizadas por aplicación"
      [resourceName]="'Compañía'"
      addLabel="Nueva Compañía"
      [treeNodes]="crud.items()"
      [columns]="cols"
      [loading]="crud.loading()"
      [isSaving]="crud.isSaving()"
      [formFields]="formFields"
      [formExtraData]="{ app_id: currentAppId, is_active: true }"
      [deleteMessage]="deleteMessageFn"
      [hasPermission]="hasPermission"
      permissionMessage="Solo los administradores del sistema pueden gestionar compañías."
      [hidePermissionGate]="false"
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
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  crud = inject(UnifiedCrudService);

  cols = COMPANIES_COLS;
  formFields = createCompaniesForm([]);
  hasPermission = false;
  currentAppId: number | null = null;
  selectedItem: any = null;

  constructor() {
    effect(() => {
      const catalogs = this.crud.catalogItems();
      const apps = catalogs['apps'] || [];
      this.formFields = createCompaniesForm(apps);
    });
  }

  ngOnInit() {
    const auth: any = this.authService;
    this.hasPermission = typeof auth.hasRole === 'function' ? auth.hasRole('admin') : true;

    if (this.hasPermission) {
      this.crud.initialize({
        resourceName: 'Compañía',
        defaultSortKey: 'id',
        fnFetch: () => this.companyService.getCompaniesPageData().pipe(
          map((data: any) => {
            const apps = data?.apps?.data ?? [];
            const companies = data?.companies?.data ?? [];
            this.crud.catalogItems.update(c => ({ ...c, apps }));
            return this.buildTree(apps, companies);
          })
        ),
        fnCreate: (data) => this.saveWithLogo(data, 'add'),
        fnUpdate: (id, data) => this.saveWithLogo(data, 'edit'),
        fnDelete: this.companyService.deleteCompanyGql.bind(this.companyService)
      });
      this.crud.load();
    }
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
            icon: 'pi pi-building',
            _canAdd: false,
            _canEdit: true,
            _canDelete: true
          }
        }))
    }));
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

  onSave(e: { mode: 'add' | 'edit'; data: any }) {
    const finalData = { ...e.data };
    if (e.mode === 'add' && this.currentAppId) {
      finalData.app_id = this.currentAppId;
    }
    // We pass it to crud.save, but we must override the event data since we added currentAppId
    this.crud.save({ mode: e.mode, data: finalData });
  }

  private saveWithLogo(data: any, mode: 'add' | 'edit'): Observable<any> {
    return new Observable(observer => {
      const proceedWithSave = (processedData: any) => {
        const req$ = mode === 'add'
          ? this.companyService.createCompanyGql(processedData)
          : this.companyService.updateCompanyGql(this.selectedItem?.uuid || data.uuid, processedData);
        req$.subscribe({
          next: res => { observer.next(res); observer.complete(); },
          error: err => observer.error(err)
        });
      };

      if (data.logo_url instanceof File) {
        const reader = new FileReader();
        reader.onload = () => { data.logo_url = reader.result as string; proceedWithSave(data); };
        reader.onerror = () => observer.error(new Error('Error al procesar la imagen del logo'));
        reader.readAsDataURL(data.logo_url);
      } else {
        proceedWithSave(data);
      }
    });
  }

  deleteMessageFn = (item: any) => `¿Está seguro de que desea eliminar la compañía ${item?.name}?`;
}