import { inject, Directive, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { ModalTab } from '@shared/modals/tabbed-modal/tabbed-modal.component';
import { handleApiState } from '@shared/utils/rxjs-utils';
import { ModalMode } from './crud-state.types';

@Directive()
export abstract class BaseModalComponent<T = any> {
  protected notificationService = inject(NotificationService);
  protected logger = inject(LoggerService);
  protected cdr = inject(ChangeDetectorRef);
  public destroyRef = inject(DestroyRef);

  protected defaultSortKey = 'created_at';
  protected columnMap: Record<string, string> = {};
  protected primaryKey = 'uuid';

  // Estado visual y modal
  loading = false;
  tableLoading = false;
  catalogLoading = false;
  isSaving = false;
  items: T[] = [];
  initialData: Record<string, any> = {};
  totalRecords = 0;
  modalVisible = false;
  modalMode: ModalMode = 'add';
  selectedItem: T | null = null;
  secondaryModalVisible = false;
  secondaryModalData: any = null;
  protected autoLoadOnInit = false;

  // Modo View
  selectedItemName = '';
  loadingActivities = false;
  activities: any[] = [];

  get currentMode(): string {
    return this.modalMode as string;
  }

  get modalTitle(): string {
    if (this.currentMode === 'view') return this.selectedItemName;
    if (this.modalMode === 'edit') return `Editar ${this.resourceName}`;
    return `Agregar ${this.resourceName}`;
  }

  abstract formFields: FormField[];
  abstract get resourceName(): string;

  protected withActivitiesTab(baseTabs: ModalTab[]): ModalTab[] {
    if (this.currentMode === 'view' && typeof this.onLoadActivities === 'function') {
      return [...baseTabs, { value: 'activities', label: 'Actividades Recientes', icon: 'pi pi-history mr-2' }];
    }
    return baseTabs;
  }

  protected showSecondaryModal(data?: any): void {
    this.secondaryModalVisible = true;
    this.secondaryModalData = data ?? null;
    this.cdr.markForCheck();
  }

  protected hideSecondaryModal(): void {
    this.secondaryModalVisible = false;
    this.secondaryModalData = null;
    this.cdr.markForCheck();
  }

  protected onBeforeModalOpen?(mode: 'add' | 'edit', item?: T | null): void;
  protected onBeforeClose?(): void;
  protected onBeforeView?(item: T): void;
  protected onLoadActivities?(item: T): Observable<any[]> | void;

  handleAdd(): void {
    this.modalMode = 'add';
    this.selectedItem = null;
  }

  handleEdit(item: T): void {
    this.modalMode = 'edit';
    this.selectedItem = { ...item };
  }

  handleDelete(item: T): void {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  protected handleView(item: T, name?: string): void {
    this.selectedItem = { ...item };
    this.selectedItemName = name ?? '';
    this.modalMode = 'view' as any;
    this.modalVisible = true;
    this.onBeforeView?.(item);
    this.loadViewActivities(item);
    this.cdr.markForCheck();
  }

  private loadViewActivities(item: T): void {
    const obs = this.onLoadActivities?.(item);
    if (obs instanceof Observable) {
      this.loadingActivities = true;
      this.activities = [];
      this.cdr.markForCheck();
      obs.pipe(
        takeUntilDestroyed(this.destroyRef),
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: this.cdr,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => {
            this.loadingActivities = state;
            this.cdr.markForCheck();
          },
          errorMessage: 'Error al cargar actividades'
        })
      ).subscribe({
        next: (acts) => { this.activities = acts ?? []; }
      });
    }
  }

  closeModal(): void {
    this.onBeforeClose?.();
    this.modalVisible = false;
    this.selectedItem = null;
    this.cdr.markForCheck();
  }
}
