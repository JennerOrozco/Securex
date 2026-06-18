import { inject, OnInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

/**
 * Base class for the SMTP / Push notification settings pages.
 */
@Directive()
export abstract class BaseNotificationConfigComponent<T = any> implements OnInit {
  protected notificationService = inject(NotificationService);

  ngOnInit(): void { }

  catalogItems: any = {};
  loading = false;
  isSaving = false;
  items: T[] = [];
  initialData: any = {};
  totalRecords = 0;
  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  abstract formFields: FormField[];
  abstract get resourceName(): string;
  abstract loadSettings(event?: any): void;
  abstract saveSetting(data: any, mode: 'add' | 'edit'): Observable<any>;
  abstract deleteSetting(item: any): Observable<any>;

  abstract loadCatalog(): Observable<any>;

  load(event?: any) {
    this.loading = true;
    this.loadSettings(event);
  }

  updateFormFields(): void { /* override */ }

  private ensureCatalog(callback: () => void): void {
    // Verificamos si el objeto ya tiene propiedades para no re-consultar el API
    if (Object.keys(this.catalogItems).length > 0) {
      callback();
      return;
    }

    this.loadCatalog().subscribe({
      next: (data: any) => {
        this.catalogItems = data || {};
        this.updateFormFields();
        callback();
      },
      error: () => {
        callback();
      }
    });
  }

  handleAdd(): void {
    this.ensureCatalog(() => { this.modalVisible = true; });
  }

  handleEdit(item: any): void {
    this.selectedItem = { ...item };
    this.ensureCatalog(() => { this.modalVisible = true; });
  }

  handleDelete(item: any): void {
    this.selectedItem = item;
    this.modalVisible = true;
  }

  save(data: any, mode: 'add' | 'edit'): void {
    this.isSaving = true;
    this.saveSetting(data, mode).subscribe({
      next: () => {
        this.notificationService.success(
          `${this.resourceName} ${mode === 'add' ? 'creada' : 'actualizada'} correctamente`
        );
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  confirmDelete(): void {
    if (!this.selectedItem) return;
    this.isSaving = true;
    this.deleteSetting(this.selectedItem).subscribe({
      next: () => {
        this.notificationService.success(`${this.resourceName} eliminada`);
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }
}