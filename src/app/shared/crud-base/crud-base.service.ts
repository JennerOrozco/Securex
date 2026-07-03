import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { normalizeBoolean } from '@shared/utils/form-utils';
import { Entity } from '@shared/types';
import { extractApiData, buildApiErrorMessage } from '@shared/utils/api-payload.utils';

@Injectable({ providedIn: 'root' })
export class CrudBaseService<T extends Entity> {
  private destroyRef = inject(DestroyRef);
  private notification = inject(NotificationService);
  private logger = inject(LoggerService);

  readonly items = signal<T[]>([]);
  readonly loading = signal(false);
  readonly isSaving = signal(false);

  readonly modalVisible = signal(false);
  readonly visibleDeleteModal = signal(false);
  readonly modalMode = signal<'add' | 'edit' | 'delete'>('add');
  readonly selectedItem = signal<T | null>(null);

  handleAdd(): void {
    this.modalMode.set('add');
    this.selectedItem.set(null);
    this.modalVisible.set(true);
  }

  handleEdit(item: T, extraFields?: string[]): void {
    this.modalMode.set('edit');
    const copy = { ...item } as any;
    if (!extraFields || extraFields.includes('is_active')) {
      copy.is_active = normalizeBoolean((item as any).is_active);
    }
    this.selectedItem.set(copy as T);
    this.modalVisible.set(true);
  }

  handleDelete(item: T): void {
    this.selectedItem.set(item);
    this.visibleDeleteModal.set(true);
  }

  load(
    loadFn: () => Observable<any>,
    mapper?: (item: any) => T
  ): void {
    this.loading.set(true);
    loadFn().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const data = extractApiData<any[]>(res, []);
        this.items.set(mapper ? data.map(mapper) : data);
        this.loading.set(false);
      },
      error: (err) => {
        this.logger.error('Error al cargar datos', err, 'CrudBaseService');
        this.notification.error(buildApiErrorMessage(err, 'Error al cargar datos'));
        this.loading.set(false);
      }
    });
  }

  save(
    createFn: (data: any) => Observable<any>,
    updateFn: (uuid: string, data: any) => Observable<any>,
    loadFn: () => Observable<any>,
    payload: any,
    entityName: string,
    mapper?: (item: any) => T
  ): void {
    this.isSaving.set(true);
    const uuid = payload.uuid || this.selectedItem()?.uuid;
    const isEdit = !!uuid;
    const obs = isEdit ? updateFn(uuid, payload) : createFn(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notification.success(`${entityName} ${isEdit ? 'actualizado' : 'creado'} correctamente`);
        this.load(loadFn, mapper);
        this.modalVisible.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.logger.error(`Error al ${isEdit ? 'actualizar' : 'crear'} ${entityName}`, err, 'CrudBaseService');
        this.notification.error(`Error al ${isEdit ? 'actualizar' : 'crear'} ${entityName}`);
        this.isSaving.set(false);
      }
    });
  }

  confirmDelete(
    deleteFn: (uuid: string) => Observable<any>,
    loadFn: () => Observable<any>,
    entityName: string,
    mapper?: (item: any) => T,
    itemId?: string
  ): void {
    this.isSaving.set(true);
    const uuid = itemId || this.selectedItem()?.uuid;
    deleteFn(uuid!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notification.success(`${entityName} eliminado correctamente`);
        this.load(loadFn, mapper);
        this.visibleDeleteModal.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.logger.error(`Error al eliminar ${entityName}`, err, 'CrudBaseService');
        this.notification.error(`Error al eliminar ${entityName}`);
        this.isSaving.set(false);
      }
    });
  }

  reset(): void {
    this.items.set([]);
    this.loading.set(false);
    this.isSaving.set(false);
    this.modalVisible.set(false);
    this.visibleDeleteModal.set(false);
    this.selectedItem.set(null);
  }
}
