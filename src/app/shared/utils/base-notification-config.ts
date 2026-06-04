import { inject, OnInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { SecurexService } from '@core/services/securex.service';
import { NotificationService } from '@core/services/notification.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

/**
 * Base class for the SMTP / Push notification settings pages.
 *
 * Subclasses must implement:
 *   - formFields (the form fields definition)
 *   - loadSettings() (loads the items from the API)
 *   - saveSetting(data, mode)  (returns Observable)
 *   - deleteSetting(item)      (returns Observable)
 *   - resourceName             (used in success toast, e.g. 'Configuración')
 */
@Directive()
export abstract class BaseNotificationConfigComponent<T = any> implements OnInit {
  protected securexService = inject(SecurexService);
  protected notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.load();
  }

  apps: any[] = [];
  loading = false;
  isSaving = false;
  items: T[] = [];
  initialData: any = {};

  abstract formFields: FormField[];
  abstract get resourceName(): string;
  abstract loadSettings(): void;
  abstract saveSetting(data: any, mode: 'add' | 'edit'): Observable<any>;
  abstract deleteSetting(item: any): Observable<any>;

  load() {
    this.loading = true;
    this.securexService.getAppsWithCompanies().subscribe({
      next: (res: any) => {
        this.apps = res.data || res || [];
        this.updateFormFields();
        this.loadSettings();
      },
      error: () => (this.loading = false)
    });
  }

  updateFormFields(): void { /* override */ }

  handleAdd(): void {
    this.modalVisible = true;
  }

  handleEdit(item: any): void {
    this.selectedItem = { ...item };
    this.modalVisible = true;
  }

  handleDelete(item: any): void {
    this.selectedItem = item;
    this.modalVisible = true;
  }

  save(data: any, mode: 'add' | 'edit'): void {
    this.isSaving = true;
    this.saveSetting(data, mode).subscribe({
      next: () => {
        this.notificationService.showSuccess(
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
        this.notificationService.showSuccess(`${this.resourceName} eliminada`);
        this.load();
        this.isSaving = false;
      },
      error: () => (this.isSaving = false)
    });
  }

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;
}
