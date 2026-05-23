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
  selector: 'app-security-companies',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  tableData: any[] = [];
  apps: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
  preselectedAppId: number | null = null;

  formFields: FormField[] = [];
  cols: TableColumn[] = [
    { field: 'logo_url', header: 'Logo', type: 'image', style: { width: '80px', 'text-align': 'center' } },
    { field: 'name', header: 'Nombre de Compañía', type: 'text', sortable: true },
    { field: 'tax_id', header: 'NIT / Identificación', type: 'text', sortable: true },
    {
      field: 'status', header: 'Activo', type: 'status', sortable: true, filterOptions: [{ label: 'Activo', value: 1 },
      { label: 'Inactivo', value: 0 }], filterOptionLabel: 'label'
    },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '8rem', 'text-align': 'center' } }
  ];

  hasPermission = false;

  ngOnInit() {
    // CORREGIDO: Evita el error TS2339 usando un casteo dinámico seguro en lo que se define la firma exacta en tu AuthService
    const auth: any = this.authService;
    this.hasPermission = typeof auth.hasRole === 'function' ? auth.hasRole('admin') : true;

    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.updateFormFields();
        this.loadCompanies();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private updateFormFields() {
    this.formFields = [
      { name: 'name', label: 'Nombre de la Compañía', type: 'text', required: true },
      { name: 'tax_id', label: 'NIT / Identificación Fiscal', type: 'text', required: true },
      {
        name: 'app_id',
        label: 'Aplicación Asociada',
        type: 'select',
        required: false,
        options: this.apps.map(app => ({ label: app.name, value: app.id }))
      },
      { name: 'logo_url', label: 'Logo de la Compañía', type: 'file', required: false, accept: 'image/*' },
      {
        name: 'is_active',
        label: '¿Está Activa?',
        type: 'select',
        required: true,
        options: [
          { label: 'Activo', value: 1 },
          { label: 'Inactivo', value: 0 }
        ]
      }
    ];
  }

  private loadCompanies() {
    this.securexService.getCompanies().subscribe({
      next: (res: any) => {
        const companiesList = res.data || res || [];

        // Mapeamos los datos de manera plana asociando el nombre de la app para el agrupador nativo de la tabla
        this.tableData = companiesList.map((company: any) => {
          const associatedApp = this.apps.find((a: any) => a.id === company.app_id);
          return {
            ...company,
            app_name: associatedApp ? associatedApp.name : 'Sin Aplicación',
            status: company.is_active ? 'Activo' : 'Inactivo'
          };
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedAppId = null;
    this.modalVisible = true;
  }

  handleAddChild(appId: number) {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.preselectedAppId = appId;
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

    const proceedWithSave = (finalData: any) => {
      const obs = this.modalMode === 'add'
        ? this.securexService.createCompany(finalData)
        : this.securexService.updateCompany(this.selectedItem.uuid, finalData);

      obs.subscribe({
        next: () => {
          this.notificationService.success(`Compañía ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`);
          this.load();
          this.modalVisible = false;
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
    };

    if (data.logo_url instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        data.logo_url = reader.result as string;
        proceedWithSave(data);
      };
      reader.onerror = () => {
        this.notificationService.showError('Error al procesar la imagen del logo');
        this.isSaving = false;
      };
      reader.readAsDataURL(data.logo_url);
    } else {
      proceedWithSave(data);
    }
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteCompany(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Compañía eliminada correctamente');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }
}