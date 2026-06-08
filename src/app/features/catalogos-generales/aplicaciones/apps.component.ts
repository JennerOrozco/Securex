import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { AppService } from '@core/services/app.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-apps',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './apps.component.html',
})
export class AppsComponent implements OnInit {
  private appService = inject(AppService);
  private notificationService = inject(NotificationService);

  data: any[] = [];
  loading = false;
  isSaving = false;

  cols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'text', style: { width: '30%' }, sortable: true },
    { field: 'slug', header: 'Slug', type: 'text', style: { width: '30%' }, sortable: true },
    { field: 'api_key', header: 'API KEY', type: 'text', style: { width: '15%' }, sortable: true },
    {
      field: 'status', header: 'Activo', type: 'badge', style: { width: '10%', textAlign: 'center' },
      sortable: true, filterOptions: [{ label: 'Activo', value: 'Activo' }, { label: 'Inactivo', value: 'Inactivo' }], filterOptionLabel: 'label'
    },
    { field: 'actions', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
  ];

  formFields: FormField[] = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, icon: 'pi pi-th-large' },
    { name: 'slug', label: 'Slug', type: 'text', required: true, icon: 'pi pi-tag' },
    { name: 'api_key', label: 'API Key', type: 'text', required: true, icon: 'pi pi-key' },
    { name: 'api_secret', label: 'API Secret', type: 'text', required: true, icon: 'pi pi-lock' },
    { name: 'is_active', label: 'Activo', type: 'select', options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }] },
    { name: 'google_client_id', label: 'Google Client ID', type: 'text', required: false, icon: 'pi pi-google' },
    { name: 'google_client_secret', label: 'Google Client Secret', type: 'text', required: false, icon: 'pi pi-shield' }
  ];

  mapItemForEdit = (data: any) => ({
    ...data,
    is_active: data.is_active ? 1 : 0
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.appService.getAppsWithCompanies().subscribe({
      next: (res: any) => {
        this.data = (res.data || res || []).map((app: any) => ({
          ...app,
          status: app.is_active ? 'Activo' : 'Inactivo'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSave(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const obs = e.mode === 'add'
      ? this.appService.createAppGql(e.data)
      : this.appService.updateAppGql(e.data.uuid, e.data);
    obs.subscribe({
      next: () => {
        this.notificationService.success(`Aplicación ${e.mode === 'add' ? 'creada' : 'actualizada'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  onConfirmDelete(item: any) {
    this.isSaving = true;
    this.appService.deleteAppGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.success('Aplicación eliminada');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
