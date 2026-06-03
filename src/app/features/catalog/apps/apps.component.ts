import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-apps',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './apps.component.html',
  styleUrl: './apps.component.css'
})
export class AppsComponent implements OnInit {
  private securexService = inject(SecurexService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'text', style: { width: '30%' }, sortable: true },
    { field: 'slug', header: 'Slug', type: 'text', style: { width: '30%' }, sortable: true },
    { field: 'api_key', header: 'API KEY', type: 'text', style: { width: '15%' }, sortable: true },
    {
      field: 'status', header: 'Activo', type: 'status', style: { width: '10%', textAlign: 'left' },
      sortable: true, filterOptions: [{ label: 'Activo', value: 1 }, { label: 'Inactivo', value: 0 }], filterOptionLabel: 'label'
    },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  formFields: FormField[] = [
    // { name: 'uuid', label: 'UUID', type: 'text', required: true, icon: 'pi pi-id-card' }, // Descomenta si necesitas mostrarlo (suele ser oculto o autogenerado)
    { name: 'name', label: 'Nombre', type: 'text', required: true, icon: 'pi pi-th-large' },
    { name: 'slug', label: 'Slug', type: 'text', required: true, icon: 'pi pi-tag' },
    { name: 'api_key', label: 'API Key', type: 'text', required: true, icon: 'pi pi-key' },
    { name: 'api_secret', label: 'API Secret', type: 'text', required: true, icon: 'pi pi-lock' }, // Puedes cambiar a 'text' si no tienes un input tipo password
    { name: 'is_active', label: 'Activo', type: 'select', options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }] },
    { name: 'google_client_id', label: 'Google Client ID', type: 'text', required: false, icon: 'pi pi-google' },
    { name: 'google_client_secret', label: 'Google Client Secret', type: 'text', required: false, icon: 'pi pi-shield' }
  ];

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.security.apps');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.securexService.getAppsWithCompanies().subscribe({
      next: (res: any) => {
        this.data = (res.data || res || []).map((app: any) => {
          return {
            ...app,
            status: app.is_active ? 'Activo' : 'Inactivo'
          };
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    this.modalMode = 'edit';
    this.selectedItem = {
      ...data,
      is_active: data.is_active ? 1 : 0
    };
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
      ? this.securexService.createAppGql(data)
      : this.securexService.updateAppGql(this.selectedItem.uuid, data);

    obs.subscribe({
      next: () => {
        this.notificationService.success(`Aplicación ${this.modalMode === 'add' ? 'creada' : 'actualizada'} correctamente`);
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteAppGql(this.selectedItem.uuid).subscribe({
      next: () => {
        this.notificationService.success('Aplicación eliminada');
        this.load();
        this.modalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
